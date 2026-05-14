import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Text, View } from '@tarojs/components';
import { calculateMetrics, loadData, macroTargets, recommendedRecipes, workoutPlan } from '../../lib';
import type { AppData } from '../../types';

export default function Recommendations() {
  const [data, setData] = useState<AppData>(loadData());
  useDidShow(() => setData(loadData()));

  if (!data.profile) {
    return (
      <View className='page'>
        <View className='header'><Text className='eyebrow'>Recommendations</Text><Text className='title'>推荐</Text></View>
        <View className='empty'><Text>请先填写个人资料，再生成推荐。</Text></View>
        <Button className='primary' onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>去填写资料</Button>
      </View>
    );
  }

  const metrics = calculateMetrics(data.profile);
  const macros = macroTargets(data.profile);
  const recipes = recommendedRecipes(data.profile);
  const plan = workoutPlan(data.profile);

  return (
    <View className='page'>
      <View className='header'><Text className='eyebrow'>Recommendations</Text><Text className='title'>推荐</Text><Text className='subtitle'>规则生成，不调用外部 AI 或食品数据库。</Text></View>

      {metrics.warnings.length ? <View className='notice'>{metrics.warnings.map((item) => <Text className='body-text' key={item}>{item}</Text>)}</View> : null}

      <View className='grid'>
        <View className='stat'><Text className='stat-label'>建议摄入</Text><Text className='stat-value'>{macros.calories}</Text></View>
        <View className='stat'><Text className='stat-label'>蛋白质</Text><Text className='stat-value'>{macros.proteinG}g</Text></View>
        <View className='stat'><Text className='stat-label'>脂肪</Text><Text className='stat-value'>{macros.fatG}g</Text></View>
        <View className='stat'><Text className='stat-label'>碳水</Text><Text className='stat-value'>{macros.carbsG}g</Text></View>
      </View>

      <View className='panel'>
        <Text className='section-title'>减脂食谱推荐</Text>
        {recipes.map((item) => (
          <View className='list-item' key={item.id}>
            <Text className='list-title'>{item.mealType} · {item.name}</Text>
            <Text className='list-meta'>{item.kcal} kcal · 蛋白 {item.protein}g · 碳水 {item.carbs}g · 脂肪 {item.fat}g</Text>
            <Text className='body-text'>食材：{item.ingredients.join('、')}</Text>
            <Text className='body-text'>做法：{item.steps}</Text>
            <Text className='hint'>{item.reason}</Text>
          </View>
        ))}
      </View>

      <View className='panel'>
        <Text className='section-title'>一周运动计划</Text>
        {plan.map((item) => (
          <View className='list-item' key={item.day}>
            <Text className='list-title'>{item.day} · {item.activity}</Text>
            <Text className='list-meta'>{item.minutes} 分钟 · 估算 {item.kcal} kcal</Text>
            <Text className='body-text'>{item.notes}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
