import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { foods } from '../../data';
import { dailySummary, loadData, mealNutrition, saveData, todayISO, uid } from '../../lib';
import type { AppData, MealType } from '../../types';

const mealTypes: MealType[] = ['早餐', '午餐', '晚餐', '加餐', '夜宵'];

export default function FoodLog() {
  const [data, setData] = useState<AppData>(loadData());
  const [date, setDate] = useState(todayISO());
  const [foodIndex, setFoodIndex] = useState(0);
  const [mealIndex, setMealIndex] = useState(0);
  const [grams, setGrams] = useState(100);
  const [notes, setNotes] = useState('');

  useDidShow(() => setData(loadData()));

  const nutrition = mealNutrition(foodIndex, grams);
  const summary = dailySummary(date, data.meals, data.exercises, data.progress);
  const dayMeals = data.meals.filter((item) => item.date === date);

  const add = () => {
    if (grams <= 0) {
      Taro.showToast({ title: '克数需大于 0', icon: 'none' });
      return;
    }
    const next: AppData = {
      ...data,
      meals: [...data.meals, {
        id: uid(),
        date,
        time: '12:00',
        mealType: mealTypes[mealIndex],
        foodName: foods[foodIndex].name,
        grams,
        ...nutrition,
        notes,
      }],
    };
    saveData(next);
    setData(next);
    setNotes('');
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const remove = (id: string) => {
    const next = { ...data, meals: data.meals.filter((item) => item.id !== id) };
    saveData(next);
    setData(next);
  };

  return (
    <View className='page'>
      <View className='header'><Text className='eyebrow'>Food Log</Text><Text className='title'>饮食记录</Text></View>
      <View className='panel'>
        <View className='field'><Text className='label'>日期</Text><Picker mode='date' value={date} onChange={(e) => setDate(e.detail.value)}><View className='picker'>{date}</View></Picker></View>
        <View className='field'><Text className='label'>餐次</Text><Picker mode='selector' range={mealTypes} value={mealIndex} onChange={(e) => setMealIndex(Number(e.detail.value))}><View className='picker'>{mealTypes[mealIndex]}</View></Picker></View>
        <View className='field'><Text className='label'>食物库</Text><Picker mode='selector' range={foods.map((item) => item.name)} value={foodIndex} onChange={(e) => setFoodIndex(Number(e.detail.value))}><View className='picker'>{foods[foodIndex].name}</View></Picker></View>
        <View className='field'><Text className='label'>克数</Text><Input className='input' type='number' value={`${grams}`} onInput={(e) => setGrams(Number(e.detail.value || 0))} /></View>
        <Text className='hint'>估算：{nutrition.kcal} kcal · 蛋白 {nutrition.protein}g · 碳水 {nutrition.carbs}g · 脂肪 {nutrition.fat}g</Text>
        <View className='field'><Text className='label'>备注</Text><Textarea className='textarea' value={notes} onInput={(e) => setNotes(e.detail.value)} /></View>
        <Button className='primary' onClick={add}>添加饮食</Button>
      </View>

      <View className='grid'>
        <View className='stat'><Text className='stat-label'>当天摄入</Text><Text className='stat-value'>{summary.intakeKcal}</Text></View>
        <View className='stat'><Text className='stat-label'>蛋白质</Text><Text className='stat-value'>{summary.protein}g</Text></View>
        <View className='stat'><Text className='stat-label'>碳水</Text><Text className='stat-value'>{summary.carbs}g</Text></View>
        <View className='stat'><Text className='stat-label'>脂肪</Text><Text className='stat-value'>{summary.fat}g</Text></View>
      </View>

      <View className='panel'>
        <Text className='section-title'>当天记录</Text>
        {dayMeals.length ? dayMeals.map((item) => (
          <View className='list-item' key={item.id}>
            <Text className='list-title'>{item.mealType} · {item.foodName}</Text>
            <Text className='list-meta'>{item.grams}g · {item.kcal} kcal · 蛋白 {item.protein}g</Text>
            <Button className='danger' onClick={() => remove(item.id)}>删除</Button>
          </View>
        )) : <View className='empty'><Text>还没有饮食记录。</Text></View>}
      </View>
    </View>
  );
}
