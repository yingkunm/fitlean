import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { exercises } from '../../data';
import { dailySummary, exerciseCalories, loadData, saveData, todayISO, uid } from '../../lib';
import type { AppData, ExerciseIntensity } from '../../types';

const intensities: ExerciseIntensity[] = ['低', '中', '高'];

export default function ExerciseLog() {
  const [data, setData] = useState<AppData>(loadData());
  const [date, setDate] = useState(todayISO());
  const [exerciseIndex, setExerciseIndex] = useState(1);
  const [intensityIndex, setIntensityIndex] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  useDidShow(() => setData(loadData()));

  const weight = data.profile?.currentWeightKg || data.progress.at(-1)?.weightKg || 70;
  const kcal = exerciseCalories(exerciseIndex, weight, minutes);
  const summary = dailySummary(date, data.meals, data.exercises, data.progress);
  const dayItems = data.exercises.filter((item) => item.date === date);

  const add = () => {
    if (minutes <= 0) {
      Taro.showToast({ title: '时长需大于 0', icon: 'none' });
      return;
    }
    const next: AppData = { ...data, exercises: [...data.exercises, { id: uid(), date, type: exercises[exerciseIndex].name, durationMinutes: minutes, intensity: intensities[intensityIndex], kcal, notes }] };
    saveData(next);
    setData(next);
    setNotes('');
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const remove = (id: string) => {
    const next = { ...data, exercises: data.exercises.filter((item) => item.id !== id) };
    saveData(next);
    setData(next);
  };

  return (
    <View className='page'>
      <View className='header'><Text className='eyebrow'>Exercise Log</Text><Text className='title'>运动记录</Text></View>
      <View className='panel'>
        <View className='field'><Text className='label'>日期</Text><Picker mode='date' value={date} onChange={(e) => setDate(e.detail.value)}><View className='picker'>{date}</View></Picker></View>
        <View className='field'><Text className='label'>运动类型</Text><Picker mode='selector' range={exercises.map((item) => item.name)} value={exerciseIndex} onChange={(e) => setExerciseIndex(Number(e.detail.value))}><View className='picker'>{exercises[exerciseIndex].name}</View></Picker></View>
        <View className='field'><Text className='label'>时长分钟</Text><Input className='input' type='number' value={`${minutes}`} onInput={(e) => setMinutes(Number(e.detail.value || 0))} /></View>
        <View className='field'><Text className='label'>强度</Text><Picker mode='selector' range={intensities} value={intensityIndex} onChange={(e) => setIntensityIndex(Number(e.detail.value))}><View className='picker'>{intensities[intensityIndex]}</View></Picker></View>
        <Text className='hint'>估算消耗：{kcal} kcal</Text>
        <View className='field'><Text className='label'>备注</Text><Textarea className='textarea' value={notes} onInput={(e) => setNotes(e.detail.value)} /></View>
        <Button className='primary' onClick={add}>添加运动</Button>
      </View>

      <View className='grid'>
        <View className='stat'><Text className='stat-label'>当天时长</Text><Text className='stat-value'>{summary.exerciseMinutes} 分</Text></View>
        <View className='stat'><Text className='stat-label'>当天消耗</Text><Text className='stat-value'>{summary.exerciseKcal}</Text></View>
      </View>

      <View className='panel'>
        <Text className='section-title'>当天记录</Text>
        {dayItems.length ? dayItems.map((item) => (
          <View className='list-item' key={item.id}>
            <Text className='list-title'>{item.type} · {item.durationMinutes} 分钟</Text>
            <Text className='list-meta'>{item.intensity}强度 · {item.kcal} kcal 估算</Text>
            <Button className='danger' onClick={() => remove(item.id)}>删除</Button>
          </View>
        )) : <View className='empty'><Text>还没有运动记录。</Text></View>}
      </View>
    </View>
  );
}
