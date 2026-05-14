import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components';
import { addDaysISO, calculateMetrics, loadData, saveData, todayISO, uid } from '../../lib';
import type { ActivityLevel, AppData, Gender, UserProfile } from '../../types';

const genderOptions: { label: string; value: Gender }[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他/不透露', value: 'other' },
];
const activityOptions: { label: string; value: ActivityLevel }[] = [
  { label: '久坐', value: 'sedentary' },
  { label: '轻度活动', value: 'light' },
  { label: '中等活动', value: 'moderate' },
  { label: '高度活动', value: 'high' },
  { label: '非常活跃', value: 'veryHigh' },
];
const dietOptions = ['普通', '中式', '低碳', '高蛋白', '素食', '不吃猪肉', '不吃牛肉', '乳糖不耐'];
const exerciseOptions = ['快走', '跑步', '骑车', '力量训练', '瑜伽', 'HIIT', '游泳'];

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
  const [data, setData] = useState<AppData>(loadData());
  const [form, setForm] = useState<UserProfile>(data.profile || defaultProfile);

  useDidShow(() => {
    const next = loadData();
    setData(next);
    setForm(next.profile || defaultProfile);
  });

  const metrics = calculateMetrics(form);
  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const num = (value: string) => Number(value || 0);
  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter((value) => value !== item) : [...list, item];

  const save = () => {
    if (form.age < 12 || form.heightCm < 120 || form.currentWeightKg < 30 || form.targetWeightKg < 30) {
      Taro.showToast({ title: '请检查数值', icon: 'none' });
      return;
    }
    const next: AppData = {
      ...data,
      profile: form,
      progress: data.progress.length ? data.progress : [{ id: uid(), date: todayISO(), weightKg: form.currentWeightKg, measurements: form.measurements, notes: '初始记录' }],
    };
    saveData(next);
    setData(next);
    Taro.showToast({ title: '已保存', icon: 'success' });
  };

  return (
    <View className='page'>
      <View className='header'>
        <Text className='eyebrow'>Profile</Text>
        <Text className='title'>个人资料</Text>
        <Text className='subtitle'>保存后自动估算 BMI、BMR、TDEE 和建议摄入。</Text>
      </View>

      <View className='panel'>
        <View className='field'><Text className='label'>年龄</Text><Input className='input' type='number' value={`${form.age}`} onInput={(e) => update('age', num(e.detail.value))} /></View>
        <View className='field'><Text className='label'>性别/估算选项</Text><Picker mode='selector' range={genderOptions.map((item) => item.label)} value={genderOptions.findIndex((item) => item.value === form.gender)} onChange={(e) => update('gender', genderOptions[Number(e.detail.value)].value)}><View className='picker'>{genderOptions.find((item) => item.value === form.gender)?.label}</View></Picker></View>
        <View className='field'><Text className='label'>身高 cm</Text><Input className='input' type='number' value={`${form.heightCm}`} onInput={(e) => update('heightCm', num(e.detail.value))} /></View>
        <View className='field'><Text className='label'>当前体重 kg</Text><Input className='input' type='digit' value={`${form.currentWeightKg}`} onInput={(e) => update('currentWeightKg', num(e.detail.value))} /></View>
        <View className='field'><Text className='label'>目标体重 kg</Text><Input className='input' type='digit' value={`${form.targetWeightKg}`} onInput={(e) => update('targetWeightKg', num(e.detail.value))} /></View>
        <View className='field'><Text className='label'>目标日期</Text><Picker mode='date' value={form.targetDate} start={todayISO()} onChange={(e) => update('targetDate', e.detail.value)}><View className='picker'>{form.targetDate}</View></Picker></View>
        <View className='field'><Text className='label'>活动水平</Text><Picker mode='selector' range={activityOptions.map((item) => item.label)} value={activityOptions.findIndex((item) => item.value === form.activityLevel)} onChange={(e) => update('activityLevel', activityOptions[Number(e.detail.value)].value)}><View className='picker'>{activityOptions.find((item) => item.value === form.activityLevel)?.label}</View></Picker></View>
      </View>

      <View className='panel'>
        <Text className='section-title'>围度与偏好</Text>
        <View className='field'><Text className='label'>腰围 cm</Text><Input className='input' type='digit' value={`${form.measurements.waist || ''}`} onInput={(e) => update('measurements', { ...form.measurements, waist: num(e.detail.value) || undefined })} /></View>
        <View className='field'><Text className='label'>臀围 cm</Text><Input className='input' type='digit' value={`${form.measurements.hip || ''}`} onInput={(e) => update('measurements', { ...form.measurements, hip: num(e.detail.value) || undefined })} /></View>
        <Text className='label'>饮食偏好</Text>
        <View className='actions'>{dietOptions.slice(0, 2).map((item) => <Button key={item} className={form.dietPreferences.includes(item) ? 'primary' : 'secondary'} onClick={() => update('dietPreferences', toggle(form.dietPreferences, item))}>{item}</Button>)}</View>
        <View className='actions'>{dietOptions.slice(2, 4).map((item) => <Button key={item} className={form.dietPreferences.includes(item) ? 'primary' : 'secondary'} onClick={() => update('dietPreferences', toggle(form.dietPreferences, item))}>{item}</Button>)}</View>
        <View className='actions'>{dietOptions.slice(4, 6).map((item) => <Button key={item} className={form.dietPreferences.includes(item) ? 'primary' : 'secondary'} onClick={() => update('dietPreferences', toggle(form.dietPreferences, item))}>{item}</Button>)}</View>
        <View className='actions'>{dietOptions.slice(6).map((item) => <Button key={item} className={form.dietPreferences.includes(item) ? 'primary' : 'secondary'} onClick={() => update('dietPreferences', toggle(form.dietPreferences, item))}>{item}</Button>)}</View>
        <View className='field'><Text className='label'>忌口/过敏备注</Text><Textarea className='textarea' value={form.allergyNotes} onInput={(e) => update('allergyNotes', e.detail.value)} /></View>
      </View>

      <View className='panel'>
        <Text className='section-title'>运动设置</Text>
        <Text className='label'>运动偏好</Text>
        <View className='actions'>{exerciseOptions.slice(0, 2).map((item) => <Button key={item} className={form.exercisePreferences.includes(item) ? 'primary' : 'secondary'} onClick={() => update('exercisePreferences', toggle(form.exercisePreferences, item))}>{item}</Button>)}</View>
        <View className='actions'>{exerciseOptions.slice(2, 4).map((item) => <Button key={item} className={form.exercisePreferences.includes(item) ? 'primary' : 'secondary'} onClick={() => update('exercisePreferences', toggle(form.exercisePreferences, item))}>{item}</Button>)}</View>
        <View className='field'><Text className='label'>每周运动天数</Text><Input className='input' type='number' value={`${form.weeklyExerciseDays}`} onInput={(e) => update('weeklyExerciseDays', num(e.detail.value))} /></View>
        <View className='field'><Text className='label'>每次分钟数</Text><Input className='input' type='number' value={`${form.minutesPerSession}`} onInput={(e) => update('minutesPerSession', num(e.detail.value))} /></View>
        <View className='field'><Text className='label'>伤病/不适备注</Text><Textarea className='textarea' value={form.injuryNotes} onInput={(e) => update('injuryNotes', e.detail.value)} /></View>
      </View>

      <View className='grid'>
        <View className='stat'><Text className='stat-label'>BMI</Text><Text className='stat-value'>{metrics.bmi}</Text></View>
        <View className='stat'><Text className='stat-label'>BMR</Text><Text className='stat-value'>{metrics.bmr}</Text></View>
        <View className='stat'><Text className='stat-label'>TDEE</Text><Text className='stat-value'>{metrics.tdee}</Text></View>
        <View className='stat'><Text className='stat-label'>建议摄入</Text><Text className='stat-value'>{metrics.targetCalories}</Text></View>
      </View>
      {metrics.warnings.length ? <View className='notice'>{metrics.warnings.map((item) => <Text className='body-text' key={item}>{item}</Text>)}</View> : null}
      <Button className='primary' onClick={save}>保存资料</Button>
    </View>
  );
}
