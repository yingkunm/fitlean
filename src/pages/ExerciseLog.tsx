import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import { exerciseTypes } from '../data/exercises';
import { calculateExerciseCalories, round } from '../lib/calculations';
import { todayISO, uid } from '../lib/date';
import type { AppData, ExerciseEntry, ExerciseIntensity } from '../types';

const intensities: ExerciseIntensity[] = ['低', '中', '高'];

const emptyForm = {
  id: '',
  startTime: '19:00',
  type: '快走',
  durationMinutes: 30,
  intensity: '中' as ExerciseIntensity,
  notes: '',
};

interface ExerciseLogProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function ExerciseLog({ data, setData }: ExerciseLogProps) {
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const weight = data.profile?.currentWeightKg ?? data.progress.at(-1)?.weightKg ?? 70;
  const met = exerciseTypes.find((item) => item.name === form.type)?.met ?? 3;
  const kcal = calculateExerciseCalories(met, weight, form.durationMinutes);
  const dayExercises = data.exercises.filter((entry) => entry.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const totals = useMemo(() => ({
    minutes: dayExercises.reduce((sum, entry) => sum + entry.durationMinutes, 0),
    kcal: dayExercises.reduce((sum, entry) => sum + entry.kcal, 0),
  }), [dayExercises]);

  const submit = () => {
    if (form.durationMinutes <= 0) {
      setMessage('运动时长需要大于 0 分钟。');
      return;
    }
    const entry: ExerciseEntry = { ...form, id: form.id || uid(), date, kcal };
    const exercises = form.id ? data.exercises.map((item) => (item.id === form.id ? entry : item)) : [...data.exercises, entry];
    setData({ ...data, exercises });
    setForm(emptyForm);
    setMessage(form.id ? '运动记录已更新。' : '运动记录已添加。');
  };

  const edit = (entry: ExerciseEntry) => {
    setDate(entry.date);
    setForm({ id: entry.id, startTime: entry.startTime, type: entry.type, durationMinutes: entry.durationMinutes, intensity: entry.intensity, notes: entry.notes });
  };

  const remove = (id: string) => {
    if (confirm('确定删除这条运动记录吗？')) {
      setData({ ...data, exercises: data.exercises.filter((entry) => entry.id !== id) });
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div><p>Exercise Log</p><h1>运动记录</h1></div>
        <label className="date-picker">日期<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      </header>
      {message ? <div className="toast">{message}</div> : null}
      <section className="panel">
        <h2>{form.id ? '编辑运动' : '添加运动'}</h2>
        <div className="form-grid">
          <label>开始时间<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
          <label>运动类型<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{exerciseTypes.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
          <label>时长分钟<input type="number" min="1" max="300" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
          <label>强度<select value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value as ExerciseIntensity })}>{intensities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>估算消耗 kcal<input value={kcal} disabled /></label>
        </div>
        <label>备注<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="身体感受、心率、路线等" /></label>
        <div className="actions"><button className="primary" onClick={submit}>{form.id ? '保存修改' : '添加记录'}</button>{form.id ? <button onClick={() => setForm(emptyForm)}>取消编辑</button> : null}</div>
      </section>
      <section className="metric-strip">
        <div><span>当天运动时长</span><strong>{totals.minutes} 分钟</strong></div>
        <div><span>当天运动消耗</span><strong>{round(totals.kcal)} kcal</strong></div>
      </section>
      <section className="panel">
        <h2>当天记录</h2>
        {dayExercises.length ? (
          <div className="list">
            {dayExercises.map((entry) => (
              <article key={entry.id} className="list-row">
                <div><strong>{entry.type} · {entry.durationMinutes} 分钟</strong><span>{entry.startTime} · {entry.intensity}强度 · {entry.kcal} kcal 估算</span></div>
                <div className="row-actions"><button onClick={() => edit(entry)}>编辑</button><button className="danger" onClick={() => remove(entry.id)}>删除</button></div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="还没有运动记录" description="添加运动后，会按 MET 公式估算当天消耗。" />}
      </section>
    </div>
  );
}
