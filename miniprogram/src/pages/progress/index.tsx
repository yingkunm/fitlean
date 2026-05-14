import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { calculateBMI, loadData, round, saveData, todayISO, uid } from '../../lib';
import type { AppData } from '../../types';

export default function Progress() {
  const [data, setData] = useState<AppData>(loadData());
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState(data.profile?.currentWeightKg || 70);
  const [waist, setWaist] = useState(data.profile?.measurements.waist || 0);
  const [notes, setNotes] = useState('');
  useDidShow(() => {
    const next = loadData();
    setData(next);
    setWeight(next.profile?.currentWeightKg || next.progress.at(-1)?.weightKg || 70);
    setWaist(next.profile?.measurements.waist || next.progress.at(-1)?.measurements.waist || 0);
  });

  const sorted = [...data.progress].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const latest = sorted.at(-1);
  const height = data.profile?.heightCm || 170;

  const add = () => {
    if (weight <= 0) {
      Taro.showToast({ title: '体重需大于 0', icon: 'none' });
      return;
    }
    const next: AppData = { ...data, progress: [...data.progress, { id: uid(), date, weightKg: weight, measurements: { waist: waist || undefined }, notes }] };
    saveData(next);
    setData(next);
    setNotes('');
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const remove = (id: string) => {
    const next = { ...data, progress: data.progress.filter((item) => item.id !== id) };
    saveData(next);
    setData(next);
  };

  return (
    <View className='page'>
      <View className='header'><Text className='eyebrow'>Progress</Text><Text className='title'>进度记录</Text></View>
      <View className='panel'>
        <View className='field'><Text className='label'>日期</Text><Picker mode='date' value={date} onChange={(e) => setDate(e.detail.value)}><View className='picker'>{date}</View></Picker></View>
        <View className='field'><Text className='label'>体重 kg</Text><Input className='input' type='digit' value={`${weight}`} onInput={(e) => setWeight(Number(e.detail.value || 0))} /></View>
        <View className='field'><Text className='label'>腰围 cm</Text><Input className='input' type='digit' value={`${waist || ''}`} onInput={(e) => setWaist(Number(e.detail.value || 0))} /></View>
        <View className='field'><Text className='label'>备注</Text><Textarea className='textarea' value={notes} onInput={(e) => setNotes(e.detail.value)} /></View>
        <Button className='primary' onClick={add}>添加进度</Button>
      </View>

      <View className='grid'>
        <View className='stat'><Text className='stat-label'>体重变化</Text><Text className='stat-value'>{first && latest ? round(latest.weightKg - first.weightKg, 1) : 0} kg</Text></View>
        <View className='stat'><Text className='stat-label'>腰围变化</Text><Text className='stat-value'>{first?.measurements.waist && latest?.measurements.waist ? round(latest.measurements.waist - first.measurements.waist, 1) : 0} cm</Text></View>
        <View className='stat'><Text className='stat-label'>当前 BMI</Text><Text className='stat-value'>{latest ? round(calculateBMI(latest.weightKg, height), 1) : '-'}</Text></View>
        <View className='stat'><Text className='stat-label'>记录数</Text><Text className='stat-value'>{sorted.length}</Text></View>
      </View>

      <View className='notice'><Text className='body-text'>体重受水分、盐分、月经周期、睡眠等影响，建议看 7 日平均趋势。</Text></View>

      <View className='panel'>
        <Text className='section-title'>历史记录</Text>
        {sorted.length ? [...sorted].reverse().map((item) => (
          <View className='list-item' key={item.id}>
            <Text className='list-title'>{item.date} · {item.weightKg} kg</Text>
            <Text className='list-meta'>腰围 {item.measurements.waist || '-'} cm · BMI {round(calculateBMI(item.weightKg, height), 1)}</Text>
            <Button className='danger' onClick={() => remove(item.id)}>删除</Button>
          </View>
        )) : <View className='empty'><Text>还没有进度记录。</Text></View>}
      </View>
    </View>
  );
}
