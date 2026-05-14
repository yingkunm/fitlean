import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Text, View } from '@tarojs/components';
import { calculateMetrics, clearData, createSampleData, dailySummary, loadData, saveData, todayAdvice, todayISO } from '../../lib';
import type { AppData } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<AppData>(loadData());

  useDidShow(() => setData(loadData()));

  const summary = dailySummary(todayISO(), data.meals, data.exercises, data.progress);
  const metrics = data.profile ? calculateMetrics(data.profile) : null;

  const loadSample = () => {
    const sample = createSampleData();
    saveData(sample);
    setData(sample);
    Taro.showToast({ title: '示例已加载', icon: 'success' });
  };

  const reset = () => {
    Taro.showModal({
      title: '清空数据',
      content: '确定清空小程序本地数据吗？',
      success: (res) => {
        if (res.confirm) {
          clearData();
          setData(loadData());
        }
      },
    });
  };

  return (
    <View className='page'>
      <View className='header'>
        <Text className='eyebrow'>FitLean Tracker</Text>
        <Text className='title'>减脂助手</Text>
        <Text className='subtitle'>微信小程序 MVP · 数据仅保存在本机</Text>
      </View>

      <View className='notice'>
        <Text className='notice-title'>健康免责声明</Text>
        <Text className='body-text'>本应用提供的热量、运动消耗、食谱和运动建议均为估算，仅用于自我记录和一般健康管理，不构成医疗建议。孕期、哺乳期、未成年人、有慢性疾病、进食障碍史、严重肥胖或正在服药的人，请先咨询医生或注册营养师。</Text>
      </View>

      {!data.profile ? (
        <View className='panel'>
          <Text className='section-title'>先填写个人资料</Text>
          <Text className='body-text'>填写身高、体重、目标和运动偏好后，首页会显示建议摄入和今日建议。</Text>
          <View className='actions'>
            <Button className='primary' onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>去填写</Button>
            <Button className='secondary' onClick={loadSample}>加载示例</Button>
          </View>
        </View>
      ) : (
        <>
          <View className='grid'>
            <View className='stat'><Text className='stat-label'>今日摄入</Text><Text className='stat-value'>{summary.intakeKcal} kcal</Text></View>
            <View className='stat'><Text className='stat-label'>运动消耗</Text><Text className='stat-value'>{summary.exerciseKcal} kcal</Text></View>
            <View className='stat'><Text className='stat-label'>净摄入</Text><Text className='stat-value'>{summary.netKcal} kcal</Text></View>
            <View className='stat'><Text className='stat-label'>建议摄入</Text><Text className='stat-value'>{metrics?.targetCalories} kcal</Text></View>
            <View className='stat'><Text className='stat-label'>BMI 估算</Text><Text className='stat-value'>{metrics?.bmi}</Text></View>
            <View className='stat'><Text className='stat-label'>距目标</Text><Text className='stat-value'>{Math.max(0, metrics?.targetLossKg || 0)} kg</Text></View>
          </View>

          <View className='panel'>
            <Text className='section-title'>今日建议</Text>
            <Text className='body-text'>{todayAdvice(data.profile, summary)}</Text>
          </View>

          <View className='panel'>
            <Text className='section-title'>今日记录</Text>
            <Text className='body-text'>饮食 {summary.mealCount} 条 · 运动 {summary.exerciseCount} 条 · 运动 {summary.exerciseMinutes} 分钟</Text>
            <View className='bar'><View className='bar-fill' style={{ width: `${Math.min(100, summary.intakeKcal / Math.max(1, metrics?.targetCalories || 1) * 100)}%` }} /></View>
            <Text className='hint'>进度条为今日摄入 / 建议摄入估算。</Text>
          </View>

          {metrics?.warnings.length ? (
            <View className='notice'>
              <Text className='notice-title'>风险提醒</Text>
              {metrics.warnings.map((item) => <Text className='body-text' key={item}>{item}</Text>)}
            </View>
          ) : null}

          <View className='actions'>
            <Button className='secondary' onClick={loadSample}>重载示例</Button>
            <Button className='danger' onClick={reset}>清空数据</Button>
          </View>
        </>
      )}
    </View>
  );
}
