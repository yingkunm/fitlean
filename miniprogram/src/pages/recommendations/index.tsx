import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Text, View } from '@tarojs/components';
import { useState } from 'react';
import { EmptyState, StatCard } from '../../components';
import { calculateMacroTargets, generateRecipeRecommendations, generateWorkoutPlan, getProfileMetrics } from '../../lib/calculations';
import { loadData } from '../../lib/storage';
import type { AppData } from '../../types';

export default function Recommendations() {
  const [data, setData] = useState<AppData>(() => loadData());
  useDidShow(() => setData(loadData()));

  if (!data.profile) {
    return (
      <View className="page">
        <View className="hero"><Text className="eyebrow">Recommendations</Text><Text className="title">推荐</Text></View>
        <EmptyState title="需要先填写个人资料" description="推荐会基于目标、偏好、可运动时间和不适备注生成。" />
        <View className="button-row"><Button className="btn btn-primary" onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>去填写资料</Button></View>
      </View>
    );
  }

  const profile = data.profile;
  const metrics = getProfileMetrics(profile);
  const macros = calculateMacroTargets(profile);
  const recipeGroups = generateRecipeRecommendations(profile.dietPreferences);
  const plan = generateWorkoutPlan(profile);

  return (
    <View className="page">
      <View className="hero">
        <Text className="eyebrow">Recommendations</Text>
        <Text className="title">规则推荐</Text>
        <Text className="muted">不调用外部 AI 或食品数据库。</Text>
      </View>
      {metrics.warnings.map((warning) => <View key={warning} className="warning"><Text>{warning}</Text></View>)}
      <View className="grid">
        <StatCard label="建议摄入" value={`${macros.calories} kcal`} />
        <StatCard label="蛋白质" value={`${macros.proteinG} g`} hint={`${macros.proteinKcal} kcal`} />
        <StatCard label="脂肪" value={`${macros.fatG} g`} hint={`${macros.fatKcal} kcal`} />
        <StatCard label="碳水" value={`${macros.carbsG} g`} hint={`${macros.carbsKcal} kcal`} />
      </View>
      <View className="panel">
        <Text className="section-title">减脂食谱推荐</Text>
        {Object.entries(recipeGroups).map(([mealType, group]) => {
          const list = group.exact.length ? group.exact : group.fallback;
          return (
            <View key={mealType} className="list">
              <Text className="item-title">{mealType}</Text>
              {!group.exact.length && group.fallback.length ? <Text className="item-meta">接近匹配：已避开明确忌口。</Text> : null}
              {list.map((recipe) => (
                <View key={recipe.id} className="list-item">
                  <Text className="item-title">{recipe.name}</Text>
                  <Text className="item-meta">{recipe.kcal} kcal · 蛋白 {recipe.protein}g · 碳水 {recipe.carbs}g · 脂肪 {recipe.fat}g</Text>
                  <Text className="item-meta">食材：{recipe.ingredients.join('、')}</Text>
                  <Text className="item-meta">做法：{recipe.steps}</Text>
                  <Text className="item-meta">{recipe.reason}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
      <View className="panel">
        <Text className="section-title">一周运动计划</Text>
        {plan.map((day) => (
          <View key={day.day} className="list-item">
            <Text className="item-title">{day.day} · {day.activity}</Text>
            <Text className="item-meta">{day.minutes} 分钟 · {day.intensity} · 估算消耗 {day.estimatedKcal} kcal</Text>
            <Text className="item-meta">{day.notes}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
