import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Text, View } from '@tarojs/components';
import { useState } from 'react';
import { EmptyState, ProgressBar, SafetyNotice, StatCard } from '../../components';
import { generateTrend, getProfileMetrics, round } from '../../lib/calculations';
import { getTodayAdvice } from '../../lib/recommendations';
import { loadData } from '../../lib/storage';
import { todayISO } from '../../lib/date';
import type { AppData } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<AppData>(() => loadData());

  useDidShow(() => setData(loadData()));

  if (!data.profile) {
    return (
      <View className="page">
        <View className="hero">
          <Text className="eyebrow">FitLean Tracker / 减脂助手</Text>
          <Text className="title">先填写个人资料，建立你的本地减脂记录。</Text>
          <View className="button-row">
            <Button className="btn btn-primary" onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>开始填写</Button>
            <Button className="btn" onClick={() => Taro.navigateTo({ url: '/pages/data/index' })}>示例数据</Button>
          </View>
        </View>
        <SafetyNotice />
      </View>
    );
  }

  const trend = generateTrend(data.meals, data.exercises, data.progress, 7);
  const today = trend[trend.length - 1];
  const metrics = getProfileMetrics(data.profile);
  const advice = getTodayAdvice(data.profile, today, trend);
  const maxIntake = Math.max(...trend.map((item) => item.intakeKcal), metrics.targetCalories, 1);
  const maxExercise = Math.max(...trend.map((item) => item.exerciseKcal), 1);

  return (
    <View className="page">
      <View className="hero">
        <Text className="eyebrow">Dashboard</Text>
        <Text className="title">今日概览</Text>
        <Text className="muted">今天 {todayISO()} · 所有结果均为估算</Text>
      </View>
      <SafetyNotice />
      <View className="grid">
        <StatCard label="今日摄入" value={`${today.intakeKcal} kcal`} hint={`${today.mealCount} 条饮食`} />
        <StatCard label="运动消耗" value={`${today.exerciseKcal} kcal`} hint={`${today.exerciseCount} 条运动`} />
        <StatCard label="净摄入" value={`${today.netKcal} kcal`} />
        <StatCard label="建议摄入" value={`${metrics.targetCalories} kcal`} hint="TDEE - 推荐缺口" />
        <StatCard label="每日缺口" value={`${metrics.recommendedDeficit} kcal`} />
        <StatCard label="当前 BMI" value={metrics.bmi} />
        <StatCard label="距目标" value={`${Math.max(0, round(data.profile.currentWeightKg - data.profile.targetWeightKg, 1))} kg`} />
        <StatCard label="记录数量" value={`${today.mealCount + today.exerciseCount} 条`} />
      </View>
      {metrics.warnings.map((warning) => <View key={warning} className="warning"><Text>{warning}</Text></View>)}
      <View className="panel">
        <Text className="section-title">7 日趋势</Text>
        {trend.length ? trend.map((item) => (
          <View key={item.date}>
            <ProgressBar label={`${item.date.slice(5)} 摄入`} value={item.intakeKcal} max={maxIntake} />
            <ProgressBar label={`${item.date.slice(5)} 消耗`} value={item.exerciseKcal} max={maxExercise} />
          </View>
        )) : <EmptyState title="暂无趋势" description="记录饮食、运动和体重后会显示趋势。" />}
      </View>
      <View className="panel">
        <Text className="section-title">今日建议</Text>
        <Text className="notice-text">{advice}</Text>
      </View>
      <View className="button-row">
        <Button className="btn" onClick={() => Taro.navigateTo({ url: '/pages/progress/index' })}>进度记录</Button>
        <Button className="btn" onClick={() => Taro.navigateTo({ url: '/pages/data/index' })}>数据管理</Button>
      </View>
    </View>
  );
}
