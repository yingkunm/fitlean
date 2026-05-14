import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { useState } from 'react';
import { SafetyNotice, StatCard } from '../../components';
import { activityLabels, genderLabels, getProfileMetrics } from '../../lib/calculations';
import { addDaysISO, todayISO, uid } from '../../lib/date';
import { loadData, saveData } from '../../lib/storage';
import type { ActivityLevel, AppData, Gender, UserProfile } from '../../types';

const genderValues: Gender[] = ['male', 'female', 'other'];
const activityValues: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'high', 'veryHigh'];
const dietOptions = ['普通', '中式', '高蛋白', '低碳', '素食', '乳糖不耐'];
const exerciseOptions = ['快走', '跑步', '骑车', '力量训练', '瑜伽', '游泳'];

const defaultProfile: UserProfile = {
  age: 30,
  gender: 'other',
  heightCm: 170,
  currentWeightKg: 70,
  targetWeightKg: 65,
  targetDate: addDaysISO(90),
  measurements: {},
  activityLevel: 'light',
  dietPreferences: ['普通'],
  allergyNotes: '',
  exercisePreferences: ['快走', '力量训练'],
  equipment: ['无器械'],
  weeklyExerciseDays: 3,
  minutesPerSession: 40,
  injuryNotes: '',
};

export default function Profile() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [form, setForm] = useState<UserProfile>(data.profile ?? defaultProfile);
  const metrics = getProfileMetrics(form);

  useDidShow(() => {
    const loaded = loadData();
    setData(loaded);
    setForm(loaded.profile ?? defaultProfile);
  });

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateNumber = <K extends keyof UserProfile>(key: K, value: string) => update(key, Number(value || 0) as UserProfile[K]);
  const updateMeasurement = (key: keyof UserProfile['measurements'], value: string) =>
    setForm((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: value ? Number(value) : undefined } }));

  const save = () => {
    if (form.age < 12 || form.heightCm < 120 || form.currentWeightKg < 30 || form.targetWeightKg < 30) {
      Taro.showToast({ title: '请检查数值', icon: 'none' });
      return;
    }
    const next: AppData = {
      ...data,
      profile: form,
      progress: data.progress.length ? data.progress : [{
        id: uid(),
        date: todayISO(),
        weightKg: form.currentWeightKg,
        measurements: form.measurements,
        notes: '根据个人资料创建的初始记录',
      }],
    };
    saveData(next);
    setData(next);
    Taro.showToast({ title: '已保存', icon: 'success' });
  };

  return (
    <View className="page">
      <View className="hero">
        <Text className="eyebrow">Profile</Text>
        <Text className="title">个人资料</Text>
      </View>
      <SafetyNotice />
      <View className="panel">
        <Text className="section-title">基础信息</Text>
        <View className="form-row"><Text className="label">年龄</Text><Input className="input" type="number" value={`${form.age}`} onInput={(e) => updateNumber('age', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">性别/估算选项</Text><Picker mode="selector" range={genderValues.map((item) => genderLabels[item])} value={genderValues.indexOf(form.gender)} onChange={(e) => update('gender', genderValues[Number(e.detail.value)])}><View className="picker">{genderLabels[form.gender]}</View></Picker></View>
        <View className="form-row"><Text className="label">身高 cm</Text><Input className="input" type="digit" value={`${form.heightCm}`} onInput={(e) => updateNumber('heightCm', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">当前体重 kg</Text><Input className="input" type="digit" value={`${form.currentWeightKg}`} onInput={(e) => updateNumber('currentWeightKg', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">目标体重 kg</Text><Input className="input" type="digit" value={`${form.targetWeightKg}`} onInput={(e) => updateNumber('targetWeightKg', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">目标日期</Text><Picker mode="date" value={form.targetDate} onChange={(e) => update('targetDate', e.detail.value)}><View className="picker">{form.targetDate}</View></Picker></View>
        <View className="form-row"><Text className="label">活动水平</Text><Picker mode="selector" range={activityValues.map((item) => activityLabels[item])} value={activityValues.indexOf(form.activityLevel)} onChange={(e) => update('activityLevel', activityValues[Number(e.detail.value)])}><View className="picker">{activityLabels[form.activityLevel]}</View></Picker></View>
      </View>
      <View className="panel">
        <Text className="section-title">围度与偏好</Text>
        <View className="form-row"><Text className="label">腰围 cm</Text><Input className="input" type="digit" value={`${form.measurements.waist ?? ''}`} onInput={(e) => updateMeasurement('waist', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">臀围 cm</Text><Input className="input" type="digit" value={`${form.measurements.hip ?? ''}`} onInput={(e) => updateMeasurement('hip', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">饮食偏好</Text><Picker mode="multiSelector" range={[dietOptions]} value={[Math.max(0, dietOptions.indexOf(form.dietPreferences[0] ?? '普通'))]} onChange={(e) => update('dietPreferences', [dietOptions[Number(e.detail.value[0])]] as UserProfile['dietPreferences'])}><View className="picker">{form.dietPreferences.join('、')}</View></Picker></View>
        <View className="form-row"><Text className="label">运动偏好</Text><Picker mode="multiSelector" range={[exerciseOptions]} value={[Math.max(0, exerciseOptions.indexOf(form.exercisePreferences[0] ?? '快走'))]} onChange={(e) => update('exercisePreferences', [exerciseOptions[Number(e.detail.value[0])]])}><View className="picker">{form.exercisePreferences.join('、')}</View></Picker></View>
        <View className="form-row"><Text className="label">每周运动天数</Text><Input className="input" type="number" value={`${form.weeklyExerciseDays}`} onInput={(e) => updateNumber('weeklyExerciseDays', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">每次分钟数</Text><Input className="input" type="number" value={`${form.minutesPerSession}`} onInput={(e) => updateNumber('minutesPerSession', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">忌口/过敏备注</Text><Textarea className="textarea" value={form.allergyNotes} onInput={(e) => update('allergyNotes', e.detail.value)} /></View>
        <View className="form-row"><Text className="label">伤病/不适备注</Text><Textarea className="textarea" value={form.injuryNotes} onInput={(e) => update('injuryNotes', e.detail.value)} /></View>
      </View>
      <View className="grid">
        <StatCard label="BMI" value={metrics.bmi} />
        <StatCard label="BMR" value={`${metrics.bmr} kcal`} />
        <StatCard label="TDEE" value={`${metrics.tdee} kcal`} />
        <StatCard label="建议摄入" value={`${metrics.targetCalories} kcal`} />
      </View>
      {metrics.warnings.map((warning) => <View key={warning} className="warning"><Text>{warning}</Text></View>)}
      <View className="button-row">
        <Button className="btn btn-primary" onClick={save}>保存资料</Button>
      </View>
    </View>
  );
}
