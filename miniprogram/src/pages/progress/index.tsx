import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { useState } from 'react';
import { EmptyState, ProgressBar, StatCard } from '../../components';
import { calculateBMI, round } from '../../lib/calculations';
import { todayISO, uid } from '../../lib/date';
import { loadData, saveData } from '../../lib/storage';
import type { AppData, ProgressEntry } from '../../types';

export default function Progress() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState(`${data.profile?.currentWeightKg ?? 70}`);
  const [waist, setWaist] = useState(`${data.profile?.measurements.waist ?? ''}`);
  const [notes, setNotes] = useState('');

  useDidShow(() => setData(loadData()));

  const sorted = [...data.progress].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const height = data.profile?.heightCm ?? 170;
  const maxWeight = Math.max(...sorted.map((item) => item.weightKg), Number(weight || 0), 1);

  const add = () => {
    const weightKg = Number(weight || 0);
    if (weightKg <= 0) {
      Taro.showToast({ title: '体重需大于 0', icon: 'none' });
      return;
    }
    const entry: ProgressEntry = {
      id: uid(),
      date,
      weightKg,
      measurements: { waist: waist ? Number(waist) : undefined },
      notes,
    };
    const next = { ...data, progress: [...data.progress, entry] };
    saveData(next);
    setData(next);
    setNotes('');
    Taro.showToast({ title: '已添加', icon: 'success' });
  };

  const remove = (id: string) => {
    Taro.showModal({
      title: '删除记录',
      content: '确定删除这条进度记录吗？',
      success(result) {
        if (result.confirm) {
          const next = { ...data, progress: data.progress.filter((entry) => entry.id !== id) };
          saveData(next);
          setData(next);
        }
      },
    });
  };

  return (
    <View className="page">
      <View className="hero"><Text className="eyebrow">Progress</Text><Text className="title">进度记录</Text></View>
      <View className="panel">
        <Text className="section-title">添加记录</Text>
        <View className="form-row"><Text className="label">日期</Text><Picker mode="date" value={date} onChange={(e) => setDate(e.detail.value)}><View className="picker">{date}</View></Picker></View>
        <View className="form-row"><Text className="label">体重 kg</Text><Input className="input" type="digit" value={weight} onInput={(e) => setWeight(e.detail.value)} /></View>
        <View className="form-row"><Text className="label">腰围 cm</Text><Input className="input" type="digit" value={waist} onInput={(e) => setWaist(e.detail.value)} /></View>
        <View className="form-row"><Text className="label">备注</Text><Textarea className="textarea" value={notes} onInput={(e) => setNotes(e.detail.value)} /></View>
        <View className="button-row"><Button className="btn btn-primary" onClick={add}>添加记录</Button></View>
      </View>
      <View className="grid">
        <StatCard label="体重变化" value={`${first && latest ? round(latest.weightKg - first.weightKg, 1) : 0} kg`} />
        <StatCard label="腰围变化" value={`${first?.measurements.waist && latest?.measurements.waist ? round(latest.measurements.waist - first.measurements.waist, 1) : 0} cm`} />
        <StatCard label="BMI 变化" value={first && latest ? round(calculateBMI(latest.weightKg, height) - calculateBMI(first.weightKg, height), 1) : 0} />
      </View>
      <View className="panel">
        <Text className="section-title">体重趋势</Text>
        <Text className="notice-text">体重受水分、盐分、月经周期、睡眠等影响，建议看 7 日平均趋势。</Text>
        {sorted.length ? sorted.map((entry) => <ProgressBar key={entry.id} label={entry.date.slice(5)} value={entry.weightKg} max={maxWeight} />) : null}
      </View>
      <View className="panel">
        <Text className="section-title">历史记录</Text>
        {sorted.length ? [...sorted].reverse().map((entry) => (
          <View key={entry.id} className="list-item">
            <Text className="item-title">{entry.date} · {entry.weightKg} kg</Text>
            <Text className="item-meta">腰围 {entry.measurements.waist ?? '-'} cm · BMI {round(calculateBMI(entry.weightKg, height), 1)}</Text>
            <View className="button-row"><Button className="btn btn-danger" onClick={() => remove(entry.id)}>删除</Button></View>
          </View>
        )) : <EmptyState title="暂无进度记录" description="保存个人资料后会自动创建第一条，也可以手动添加。" />}
      </View>
    </View>
  );
}
