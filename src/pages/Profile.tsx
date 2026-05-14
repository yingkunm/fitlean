import { useState } from 'react';
import type { ActivityLevel, AppData, DietPreference, Equipment, Gender, UserProfile } from '../types';
import { activityLabels, genderLabels, getProfileMetrics } from '../lib/calculations';
import { addDaysISO, todayISO, uid } from '../lib/date';
import SafetyNotice from '../components/SafetyNotice';

const dietOptions: DietPreference[] = ['普通', '中式', '低碳', '高蛋白', '素食', '不吃猪肉', '不吃牛肉', '乳糖不耐'];
const exerciseOptions = ['走路', '跑步', '骑车', '力量训练', '瑜伽', 'HIIT', '游泳', '快走', '跳绳', '普拉提'];
const equipmentOptions: Equipment[] = ['无器械', '哑铃', '弹力带', '健身房'];

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

interface ProfileProps {
  data: AppData;
  setData: (data: AppData) => void;
  onSaved?: () => void;
}

export default function Profile({ data, setData, onSaved }: ProfileProps) {
  const [form, setForm] = useState<UserProfile>(data.profile ?? defaultProfile);
  const [message, setMessage] = useState('');
  const metrics = getProfileMetrics(form);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateMeasurement = (key: keyof UserProfile['measurements'], value: string) =>
    setForm((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: value ? Number(value) : undefined } }));
  const toggle = <T extends string>(list: T[], item: T) => (list.includes(item) ? list.filter((value) => value !== item) : [...list, item]);

  const save = () => {
    if (form.age < 12 || form.age > 100 || form.heightCm < 120 || form.heightCm > 230 || form.currentWeightKg < 30 || form.currentWeightKg > 300) {
      setMessage('请检查年龄、身高和体重，避免明显不合理的数值。');
      return;
    }
    const hasProgress = data.progress.length > 0;
    setData({
      ...data,
      profile: form,
      progress: hasProgress
        ? data.progress
        : [
            {
              id: uid(),
              date: todayISO(),
              weightKg: form.currentWeightKg,
              measurements: form.measurements,
              notes: '根据个人资料创建的初始记录',
            },
          ],
    });
    setMessage('个人资料已保存，估算结果已更新。');
    onSaved?.();
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p>Profile</p>
          <h1>个人资料</h1>
        </div>
        <button className="primary" onClick={save}>保存资料</button>
      </header>
      <SafetyNotice />
      {message ? <div className="toast">{message}</div> : null}
      <section className="panel">
        <h2>基础信息</h2>
        <div className="form-grid">
          <label>年龄<input type="number" min="12" max="100" value={form.age} onChange={(e) => update('age', Number(e.target.value))} /></label>
          <label>性别/估算选项<select value={form.gender} onChange={(e) => update('gender', e.target.value as Gender)}>{Object.entries(genderLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label>身高 cm<input type="number" min="120" max="230" value={form.heightCm} onChange={(e) => update('heightCm', Number(e.target.value))} /></label>
          <label>当前体重 kg<input type="number" min="30" max="300" step="0.1" value={form.currentWeightKg} onChange={(e) => update('currentWeightKg', Number(e.target.value))} /></label>
          <label>目标体重 kg<input type="number" min="30" max="300" step="0.1" value={form.targetWeightKg} onChange={(e) => update('targetWeightKg', Number(e.target.value))} /></label>
          <label>目标日期<input type="date" min={todayISO()} value={form.targetDate} onChange={(e) => update('targetDate', e.target.value)} /></label>
          <label>活动水平<select value={form.activityLevel} onChange={(e) => update('activityLevel', e.target.value as ActivityLevel)}>{Object.entries(activityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        </div>
      </section>
      <section className="panel">
        <h2>围度与偏好</h2>
        <div className="form-grid">
          <label>腰围 cm<input type="number" min="30" value={form.measurements.waist ?? ''} onChange={(e) => updateMeasurement('waist', e.target.value)} /></label>
          <label>臀围 cm<input type="number" min="30" value={form.measurements.hip ?? ''} onChange={(e) => updateMeasurement('hip', e.target.value)} /></label>
          <label>胸围 cm<input type="number" min="30" value={form.measurements.chest ?? ''} onChange={(e) => updateMeasurement('chest', e.target.value)} /></label>
          <label>大腿围 cm<input type="number" min="20" value={form.measurements.thigh ?? ''} onChange={(e) => updateMeasurement('thigh', e.target.value)} /></label>
          <label>上臂围 cm<input type="number" min="15" value={form.measurements.arm ?? ''} onChange={(e) => updateMeasurement('arm', e.target.value)} /></label>
        </div>
        <div className="chip-group">
          {dietOptions.map((item) => <button key={item} className={form.dietPreferences.includes(item) ? 'chip selected' : 'chip'} onClick={() => update('dietPreferences', toggle(form.dietPreferences, item))}>{item}</button>)}
        </div>
        <label>忌口/过敏备注<textarea value={form.allergyNotes} onChange={(e) => update('allergyNotes', e.target.value)} placeholder="例如：花生过敏、不能吃辣" /></label>
      </section>
      <section className="panel">
        <h2>运动设置</h2>
        <div className="chip-group">
          {exerciseOptions.map((item) => <button key={item} className={form.exercisePreferences.includes(item) ? 'chip selected' : 'chip'} onClick={() => update('exercisePreferences', toggle(form.exercisePreferences, item))}>{item}</button>)}
        </div>
        <div className="chip-group">
          {equipmentOptions.map((item) => <button key={item} className={form.equipment.includes(item) ? 'chip selected' : 'chip'} onClick={() => update('equipment', toggle(form.equipment, item))}>{item}</button>)}
        </div>
        <div className="form-grid">
          <label>每周可运动天数<input type="number" min="1" max="7" value={form.weeklyExerciseDays} onChange={(e) => update('weeklyExerciseDays', Number(e.target.value))} /></label>
          <label>每次可运动分钟数<input type="number" min="10" max="180" value={form.minutesPerSession} onChange={(e) => update('minutesPerSession', Number(e.target.value))} /></label>
        </div>
        <label>伤病/不适备注<textarea value={form.injuryNotes} onChange={(e) => update('injuryNotes', e.target.value)} placeholder="例如：膝盖疼、腰不舒服" /></label>
      </section>
      <section className="metric-strip">
        <div><span>BMI 估算</span><strong>{metrics.bmi}</strong></div>
        <div><span>BMR 估算</span><strong>{metrics.bmr} kcal</strong></div>
        <div><span>TDEE 估算</span><strong>{metrics.tdee} kcal</strong></div>
        <div><span>建议每日摄入</span><strong>{metrics.targetCalories} kcal</strong></div>
        <div><span>推荐每日缺口</span><strong>{metrics.recommendedDeficit} kcal</strong></div>
      </section>
      {metrics.warnings.length ? <div className="warning-list">{metrics.warnings.map((item) => <p key={item}>{item}</p>)}</div> : null}
    </div>
  );
}
