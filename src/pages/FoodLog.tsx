import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { foods } from '../data/foods';
import { calculateMealNutrition, round } from '../lib/calculations';
import { todayISO, uid } from '../lib/date';
import type { AppData, MealEntry, MealType } from '../types';

const mealTypes: MealType[] = ['早餐', '午餐', '晚餐', '加餐', '夜宵'];

const emptyForm = {
  id: '',
  time: '08:00',
  mealType: '早餐' as MealType,
  foodName: foods[0].name,
  grams: 100,
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  notes: '',
};

interface FoodLogProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function FoodLog({ data, setData }: FoodLogProps) {
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm);
  const [custom, setCustom] = useState(false);
  const [message, setMessage] = useState('');
  const selectedFood = foods.find((food) => food.name === form.foodName);
  const nutrition = selectedFood && !custom ? calculateMealNutrition(selectedFood, form.grams) : form;
  const dayMeals = data.meals.filter((meal) => meal.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const totals = useMemo(
    () => ({
      kcal: dayMeals.reduce((sum, meal) => sum + meal.kcal, 0),
      protein: dayMeals.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: dayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: dayMeals.reduce((sum, meal) => sum + meal.fat, 0),
    }),
    [dayMeals],
  );
  const macroTotal = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9 || 1;

  const submit = () => {
    if (!form.foodName.trim() || form.grams <= 0 || nutrition.kcal < 0) {
      setMessage('请填写食物名称、正数克数和合理热量。');
      return;
    }
    const entry: MealEntry = {
      id: form.id || uid(),
      date,
      time: form.time,
      mealType: form.mealType,
      foodName: form.foodName,
      grams: form.grams,
      kcal: round(nutrition.kcal),
      protein: round(nutrition.protein, 1),
      carbs: round(nutrition.carbs, 1),
      fat: round(nutrition.fat, 1),
      notes: form.notes,
    };
    const meals = form.id ? data.meals.map((meal) => (meal.id === form.id ? entry : meal)) : [...data.meals, entry];
    setData({ ...data, meals });
    setForm(emptyForm);
    setCustom(false);
    setMessage(form.id ? '饮食记录已更新。' : '饮食记录已添加。');
  };

  const edit = (meal: MealEntry) => {
    setDate(meal.date);
    setCustom(!foods.some((food) => food.name === meal.foodName));
    setForm({ ...meal });
  };

  const remove = (id: string) => {
    if (confirm('确定删除这条饮食记录吗？')) {
      setData({ ...data, meals: data.meals.filter((meal) => meal.id !== id) });
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div><p>Food Log</p><h1>饮食记录</h1></div>
        <label className="date-picker">日期<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      </header>
      {message ? <div className="toast">{message}</div> : null}
      <section className="panel">
        <h2>{form.id ? '编辑一餐' : '添加一餐'}</h2>
        <div className="form-grid">
          <label>时间<input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label>餐次<select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value as MealType })}>{mealTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>食物来源<select value={custom ? '自定义' : '食物库'} onChange={(e) => setCustom(e.target.value === '自定义')}><option>食物库</option><option>自定义</option></select></label>
          {custom ? (
            <label>食物<input value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} placeholder="请输入食物名称" /></label>
          ) : (
            <label>食物<select value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })}>{foods.map((food) => <option key={food.id}>{food.name}</option>)}</select></label>
          )}
          <label>克数<input type="number" min="1" value={form.grams} onChange={(e) => setForm({ ...form, grams: Number(e.target.value) })} /></label>
          <label>热量 kcal<input type="number" min="0" disabled={!custom} value={round(nutrition.kcal)} onChange={(e) => setForm({ ...form, kcal: Number(e.target.value) })} /></label>
          <label>蛋白质 g<input type="number" min="0" disabled={!custom} value={round(nutrition.protein, 1)} onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })} /></label>
          <label>碳水 g<input type="number" min="0" disabled={!custom} value={round(nutrition.carbs, 1)} onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })} /></label>
          <label>脂肪 g<input type="number" min="0" disabled={!custom} value={round(nutrition.fat, 1)} onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })} /></label>
        </div>
        <label>备注<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="口味、饱腹感、外食情况等" /></label>
        <div className="actions">
          <button className="primary" onClick={submit}>{form.id ? '保存修改' : '添加记录'}</button>
          {form.id ? <button onClick={() => setForm(emptyForm)}>取消编辑</button> : null}
        </div>
      </section>
      <section className="metric-strip">
        <div><span>当天总摄入</span><strong>{round(totals.kcal)} kcal</strong></div>
        <div><span>蛋白质</span><strong>{round(totals.protein, 1)} g</strong></div>
        <div><span>碳水</span><strong>{round(totals.carbs, 1)} g</strong></div>
        <div><span>脂肪</span><strong>{round(totals.fat, 1)} g</strong></div>
      </section>
      <section className="panel">
        <h2>三大营养素占比</h2>
        <div className="macro-bars">
          <span style={{ width: `${(totals.protein * 4 / macroTotal) * 100}%` }}>蛋白质</span>
          <span style={{ width: `${(totals.carbs * 4 / macroTotal) * 100}%` }}>碳水</span>
          <span style={{ width: `${(totals.fat * 9 / macroTotal) * 100}%` }}>脂肪</span>
        </div>
      </section>
      <section className="panel">
        <h2>当天记录</h2>
        {dayMeals.length ? (
          <div className="list">
            {dayMeals.map((meal) => (
              <article key={meal.id} className="list-row">
                <div><strong>{meal.mealType} · {meal.foodName}</strong><span>{meal.time} · {meal.grams}g · {meal.kcal} kcal · 蛋白 {meal.protein}g</span></div>
                <div className="row-actions"><button onClick={() => edit(meal)}>编辑</button><button className="danger" onClick={() => remove(meal.id)}>删除</button></div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="还没有饮食记录" description="添加一餐后，这里会展示当天摄入和营养素估算。" />}
      </section>
    </div>
  );
}
