import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState';
import SafetyNotice from '../components/SafetyNotice';
import StatCard from '../components/StatCard';
import { generateTrend, getProfileMetrics, round } from '../lib/calculations';
import { formatDateLabel, todayISO } from '../lib/date';
import { getTodayAdvice } from '../lib/recommendations';
import type { AppData } from '../types';

interface DashboardProps {
  data: AppData;
  onGoProfile: () => void;
}

export default function Dashboard({ data, onGoProfile }: DashboardProps) {
  if (!data.profile) {
    return (
      <div className="page">
        <header className="hero">
          <p>FitLean Tracker / 减脂助手</p>
          <h1>先填写个人资料，建立你的本地减脂记录。</h1>
          <button className="primary" onClick={onGoProfile}>开始填写资料</button>
        </header>
        <SafetyNotice />
      </div>
    );
  }

  const trend = generateTrend(data.meals, data.exercises, data.progress, 7);
  const today = trend.at(-1)!;
  const metrics = getProfileMetrics(data.profile);
  const targetGap = round(data.profile.currentWeightKg - data.profile.targetWeightKg, 1);
  const advice = getTodayAdvice(data.profile, today, trend);
  const chartData = trend.map((item) => ({
    日期: formatDateLabel(item.date),
    摄入: item.intakeKcal,
    消耗: item.exerciseKcal,
    体重: item.weightKg,
  }));

  return (
    <div className="page">
      <header className="page-header">
        <div><p>Dashboard</p><h1>首页</h1></div>
        <span className="subtle">今天 {todayISO()} · 所有结果均为估算</span>
      </header>
      <SafetyNotice />
      <section className="stats-grid">
        <StatCard label="今日摄入热量" value={`${today.intakeKcal} kcal`} hint={`${today.mealCount} 条饮食记录`} />
        <StatCard label="今日运动消耗" value={`${today.exerciseKcal} kcal`} hint={`${today.exerciseCount} 条运动记录`} />
        <StatCard label="今日净摄入" value={`${today.netKcal} kcal`} tone={today.netKcal < metrics.targetCalories * 0.65 && today.mealCount ? 'warn' : 'normal'} />
        <StatCard label="建议每日摄入目标" value={`${metrics.targetCalories} kcal`} hint="TDEE - 推荐缺口" tone="good" />
        <StatCard label="预计每日热量缺口" value={`${metrics.recommendedDeficit} kcal`} hint={`理论需要 ${metrics.theoreticalDeficit} kcal`} />
        <StatCard label="当前 BMI" value={metrics.bmi} hint="估算" />
        <StatCard label="距离目标体重" value={`${Math.max(0, targetGap)} kg`} />
        <StatCard label="今日记录数量" value={`${today.mealCount + today.exerciseCount} 条`} hint={`饮食 ${today.mealCount} · 运动 ${today.exerciseCount}`} />
      </section>
      {metrics.warnings.length ? <div className="warning-list">{metrics.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div> : null}
      <section className="panel">
        <h2>7 日摄入 / 消耗 / 体重趋势</h2>
        {chartData.length ? (
          <div className="chart">
            <ResponsiveContainer minWidth={0}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ece8" />
                <XAxis dataKey="日期" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="摄入" stroke="#3b8f69" fill="#bfe8d3" />
                <Area yAxisId="left" type="monotone" dataKey="消耗" stroke="#f2a65a" fill="#ffe0bd" />
                <Area yAxisId="right" type="monotone" dataKey="体重" stroke="#5a7fd8" fill="#d8e3ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyState title="暂无趋势" description="记录饮食、运动和体重后会显示 7 日趋势。" />}
      </section>
      <section className="advice-card">
        <h2>今日建议</h2>
        <p>{advice}</p>
      </section>
    </div>
  );
}
