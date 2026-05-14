import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { useState } from 'react';
import { EmptyState, StatCard } from '../../components';
import { foods } from '../../data/foods';
import { calculateMealNutrition, round } from '../../lib/calculations';
import { loadData, saveData } from '../../lib/storage';
import { todayISO, uid } from '../../lib/date';
import type { AppData, MealEntry, MealType } from '../../types';

const mealTypes: MealType[] = ['早餐', '午餐', '晚餐', '加餐', '夜宵'];

export default function Food() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [date, setDate] = useState(todayISO());
  const [foodIndex, setFoodIndex] = useState(0);
  const [mealIndex, setMealIndex] = useState(0);
  const [grams, setGrams] = useState('100');
  const [notes, setNotes] = useState('');

  useDidShow(() => setData(loadData()));

  const dayMeals = data.meals.filter((meal) => meal.date === date);
  const totals = {
    kcal: dayMeals.reduce((sum, meal) => sum + meal.kcal, 0),
    protein: dayMeals.reduce((sum, meal) => sum + meal.protein, 0),
    carbs: dayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
    fat: dayMeals.reduce((sum, meal) => sum + meal.fat, 0),
  };
  const selectedFood = foods[foodIndex];
  const nutrition = calculateMealNutrition(selectedFood, Number(grams || 0));

  const add = () => {
    const g = Number(grams || 0);
    if (g <= 0) {
      Taro.showToast({ title: '克数需大于 0', icon: 'none' });
      return;
    }
    const entry: MealEntry = {
      id: uid(),
      date,
      time: '12:00',
      mealType: mealTypes[mealIndex],
      foodName: selectedFood.name,
      grams: g,
      kcal: nutrition.kcal,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      notes,
    };
    const next = { ...data, meals: [...data.meals, entry] };
    saveData(next);
    setData(next);
    setNotes('');
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const remove = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条饮食记录吗？',
      success(result) {
        if (result.confirm) {
          const next = { ...data, meals: data.meals.filter((meal) => meal.id !== id) };
          saveData(next);
          setData(next);
        }
      },
    });
  };

  return (
    <View className="page">
      <View className="hero"><Text className="eyebrow">Food Log</Text><Text className="title">饮食记录</Text></View>
      <View className="panel">
        <Text className="section-title">添加一餐</Text>
        <View className="form-row"><Text className="label">日期</Text><Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value)}><View className="picker">{date}</View></Picker></View>
        <View className="form-row"><Text className="label">餐次</Text><Picker mode="selector" range={mealTypes} value={mealIndex} onChange={(e) => setMealIndex(Number(e.detail.value))}><View className="picker">{mealTypes[mealIndex]}</View></Picker></View>
        <View className="form-row"><Text className="label">食物库</Text><Picker mode="selector" range={foods.map((food) => food.name)} value={foodIndex} onChange={(e) => setFoodIndex(Number(e.detail.value))}><View className="picker">{selectedFood.name}</View></Picker></View>
        <View className="form-row"><Text className="label">克数</Text><Input className="input" type="digit" value={grams} onInput={(e) => setGrams(e.detail.value)} /></View>
        <View className="form-row"><Text className="label">备注</Text><Textarea className="textarea" value={notes} onInput={(e) => setNotes(e.detail.value)} /></View>
        <View className="button-row"><Button className="btn btn-primary" onClick={add}>添加记录</Button></View>
      </View>
      <View className="grid">
        <StatCard label="当天摄入" value={`${round(totals.kcal)} kcal`} />
        <StatCard label="蛋白质" value={`${round(totals.protein, 1)} g`} />
        <StatCard label="碳水" value={`${round(totals.carbs, 1)} g`} />
        <StatCard label="脂肪" value={`${round(totals.fat, 1)} g`} />
      </View>
      <View className="panel">
        <Text className="section-title">当天记录</Text>
        {dayMeals.length ? dayMeals.map((meal) => (
          <View key={meal.id} className="list-item">
            <Text className="item-title">{meal.mealType} · {meal.foodName}</Text>
            <Text className="item-meta">{meal.grams}g · {meal.kcal} kcal · 蛋白 {meal.protein}g</Text>
            <View className="button-row"><Button className="btn btn-danger" onClick={() => remove(meal.id)}>删除</Button></View>
          </View>
        )) : <EmptyState title="还没有饮食记录" description="添加一餐后，会展示当天摄入和营养素估算。" />}
      </View>
    </View>
  );
}
