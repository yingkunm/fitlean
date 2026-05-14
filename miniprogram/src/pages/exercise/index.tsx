import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { useState } from 'react';
import { EmptyState, StatCard } from '../../components';
import { exerciseTypes } from '../../data/exercises';
import { calculateExerciseCalories, round } from '../../lib/calculations';
import { todayISO, uid } from '../../lib/date';
import { loadData, saveData } from '../../lib/storage';
import type { AppData, ExerciseEntry, ExerciseIntensity } from '../../types';

const intensities: ExerciseIntensity[] = ['低', '中', '高'];

export default function Exercise() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [date, setDate] = useState(todayISO());
  const [typeIndex, setTypeIndex] = useState(1);
  const [intensityIndex, setIntensityIndex] = useState(1);
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');

  useDidShow(() => setData(loadData()));

  const weight = data.profile?.currentWeightKg ?? data.progress[data.progress.length - 1]?.weightKg ?? 70;
  const type = exerciseTypes[typeIndex];
  const kcal = calculateExerciseCalories(type.met, weight, Number(duration || 0));
  const dayExercises = data.exercises.filter((entry) => entry.date === date);
  const totals = {
    minutes: dayExercises.reduce((sum, entry) => sum + entry.durationMinutes, 0),
    kcal: dayExercises.reduce((sum, entry) => sum + entry.kcal, 0),
  };

  const add = () => {
    const durationMinutes = Number(duration || 0);
    if (durationMinutes <= 0) {
      Taro.showToast({ title: '时长需大于 0', icon: 'none' });
      return;
    }
    const entry: ExerciseEntry = {
      id: uid(),
      date,
      startTime: '19:00',
      type: type.name,
      durationMinutes,
      intensity: intensities[intensityIndex],
      kcal,
      notes,
    };
    const next = { ...data, exercises: [...data.exercises, entry] };
    saveData(next);
    setData(next);
    setNotes('');
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const remove = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条运动记录吗？',
      success(result) {
        if (result.confirm) {
          const next = { ...data, exercises: data.exercises.filter((entry) => entry.id !== id) };
          saveData(next);
          setData(next);
        }
      },
    });
  };

  return (
    <View className="page">
      <View className="hero"><Text className="eyebrow">Exercise Log</Text><Text className="title">运动记录</Text></View>
      <View className="panel">
        <Text className="section-title">添加运动</Text>
        <View className="form-row"><Text className="label">日期</Text><Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value)}><View className="picker">{date}</View></Picker></View>
        <View className="form-row"><Text className="label">运动类型</Text><Picker mode="selector" range={exerciseTypes.map((item) => item.name)} value={typeIndex} onChange={(e) => setTypeIndex(Number(e.detail.value))}><View className="picker">{type.name}</View></Picker></View>
        <View className="form-row"><Text className="label">时长分钟</Text><Input className="input" type="number" value={duration} onInput={(e) => setDuration(e.detail.value)} /></View>
        <View className="form-row"><Text className="label">强度</Text><Picker mode="selector" range={intensities} value={intensityIndex} onChange={(e) => setIntensityIndex(Number(e.detail.value))}><View className="picker">{intensities[intensityIndex]}</View></Picker></View>
        <View className="form-row"><Text className="label">备注</Text><Textarea className="textarea" value={notes} onInput={(e) => setNotes(e.detail.value)} /></View>
        <View className="button-row"><Button className="btn btn-primary" onClick={add}>添加记录</Button></View>
      </View>
      <View className="grid">
        <StatCard label="当天时长" value={`${totals.minutes} 分钟`} />
        <StatCard label="当天消耗" value={`${round(totals.kcal)} kcal`} />
      </View>
      <View className="panel">
        <Text className="section-title">当天记录</Text>
        {dayExercises.length ? dayExercises.map((entry) => (
          <View key={entry.id} className="list-item">
            <Text className="item-title">{entry.type} · {entry.durationMinutes} 分钟</Text>
            <Text className="item-meta">{entry.intensity}强度 · {entry.kcal} kcal 估算</Text>
            <View className="button-row"><Button className="btn btn-danger" onClick={() => remove(entry.id)}>删除</Button></View>
          </View>
        )) : <EmptyState title="还没有运动记录" description="添加运动后，会按 MET 公式估算当天消耗。" />}
      </View>
    </View>
  );
}
