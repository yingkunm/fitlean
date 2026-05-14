import Taro from '@tarojs/taro';
import { exercises, foods, recipes } from './data';
import type { AppData, DailySummary, ExerciseEntry, MealEntry, ProgressEntry, UserProfile } from './types';

const KEY = 'fitlean-miniprogram-data-v1';

export const emptyData: AppData = { profile: null, meals: [], exercises: [], progress: [] };
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const round = (value: number, digits = 0) => Math.round(value * 10 ** digits) / 10 ** digits;

export const addDaysISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const loadData = (): AppData => {
  try {
    return Taro.getStorageSync(KEY) || emptyData;
  } catch {
    return emptyData;
  }
};

export const saveData = (data: AppData) => Taro.setStorageSync(KEY, data);
export const clearData = () => Taro.removeStorageSync(KEY);

export const calculateBMI = (weightKg: number, heightCm: number) => (heightCm ? weightKg / (heightCm / 100) ** 2 : 0);

export const calculateBMR = (profile: Pick<UserProfile, 'gender' | 'currentWeightKg' | 'heightCm' | 'age'>) => {
  const male = 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const female = 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  if (profile.gender === 'male') return male;
  if (profile.gender === 'female') return female;
  return (male + female) / 2;
};

export const activityFactors = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  veryHigh: 1.9,
};

export const calculateMetrics = (profile: UserProfile) => {
  const bmr = calculateBMR(profile);
  const tdee = bmr * activityFactors[profile.activityLevel];
  const days = Math.max(1, Math.ceil((new Date(`${profile.targetDate}T00:00:00`).getTime() - new Date(`${todayISO()}T00:00:00`).getTime()) / 86400000));
  const targetLossKg = profile.currentWeightKg - profile.targetWeightKg;
  const theoreticalDeficit = targetLossKg > 0 ? (targetLossKg * 7700) / days : 0;
  const recommendedDeficit = theoreticalDeficit > 0 ? Math.min(750, Math.max(250, theoreticalDeficit)) : 0;
  const targetCalories = tdee - recommendedDeficit;
  const warnings: string[] = [];
  if (calculateBMI(profile.targetWeightKg, profile.heightCm) < 18.5) warnings.push('目标体重可能过低。');
  if (theoreticalDeficit > 1000) warnings.push('目标需要每日缺口超过 1000 kcal，建议延长周期。');
  if (targetCalories < 1200) warnings.push('建议摄入过低，建议咨询医生或注册营养师。');
  if (profile.gender === 'other') warnings.push('其他/不透露选项估算误差可能更大。');
  return {
    bmi: round(calculateBMI(profile.currentWeightKg, profile.heightCm), 1),
    bmr: round(bmr),
    tdee: round(tdee),
    days,
    targetLossKg: round(targetLossKg, 1),
    theoreticalDeficit: round(theoreticalDeficit),
    recommendedDeficit: round(recommendedDeficit),
    targetCalories: round(targetCalories),
    warnings,
  };
};

export const mealNutrition = (foodIndex: number, grams: number) => {
  const food = foods[foodIndex] || foods[0];
  return {
    kcal: round((food.kcalPer100g * grams) / 100),
    protein: round((food.proteinPer100g * grams) / 100, 1),
    carbs: round((food.carbsPer100g * grams) / 100, 1),
    fat: round((food.fatPer100g * grams) / 100, 1),
  };
};

export const exerciseCalories = (exerciseIndex: number, weightKg: number, minutes: number) => {
  const exercise = exercises[exerciseIndex] || exercises[0];
  return round((exercise.met * 3.5 * weightKg * minutes) / 200);
};

export const dailySummary = (date: string, meals: MealEntry[], exerciseEntries: ExerciseEntry[], progress: ProgressEntry[]): DailySummary => {
  const dayMeals = meals.filter((item) => item.date === date);
  const dayExercises = exerciseEntries.filter((item) => item.date === date);
  const lastProgress = [...progress].reverse().find((item) => item.date <= date);
  const intakeKcal = dayMeals.reduce((sum, item) => sum + item.kcal, 0);
  const exerciseKcal = dayExercises.reduce((sum, item) => sum + item.kcal, 0);
  return {
    date,
    intakeKcal: round(intakeKcal),
    exerciseKcal: round(exerciseKcal),
    netKcal: round(intakeKcal - exerciseKcal),
    protein: round(dayMeals.reduce((sum, item) => sum + item.protein, 0), 1),
    carbs: round(dayMeals.reduce((sum, item) => sum + item.carbs, 0), 1),
    fat: round(dayMeals.reduce((sum, item) => sum + item.fat, 0), 1),
    mealCount: dayMeals.length,
    exerciseCount: dayExercises.length,
    exerciseMinutes: dayExercises.reduce((sum, item) => sum + item.durationMinutes, 0),
    weightKg: lastProgress?.weightKg,
  };
};

export const todayAdvice = (profile: UserProfile | null, summary: DailySummary) => {
  if (!profile) return '请先填写个人资料，系统会据此生成估算目标。';
  const metrics = calculateMetrics(profile);
  if (!summary.mealCount) return '今天还没有饮食记录，先记录一餐会更准确。';
  if (summary.netKcal < metrics.targetCalories * 0.65) return '今日净摄入明显偏低，不建议极端节食。';
  if (summary.exerciseKcal > 900) return '今日运动消耗较高，注意恢复、补水和睡眠。';
  if (Math.abs(summary.netKcal - metrics.targetCalories) < 150) return '今天净摄入接近建议目标，继续保持稳定记录。';
  return summary.netKcal > metrics.targetCalories ? '今天净摄入高于目标，可以减少高油高糖零食。' : '今天略低于目标，如饥饿可补充高蛋白加餐。';
};

export const macroTargets = (profile: UserProfile) => {
  const metrics = calculateMetrics(profile);
  const proteinG = round(profile.currentWeightKg * (profile.activityLevel === 'moderate' ? 1.5 : 1.3));
  const fatG = round((metrics.targetCalories * 0.25) / 9);
  const carbsG = round(Math.max(0, metrics.targetCalories - proteinG * 4 - fatG * 9) / 4);
  return { calories: metrics.targetCalories, proteinG, fatG, carbsG };
};

export const recommendedRecipes = (profile: UserProfile | null) => {
  const prefs = profile?.dietPreferences || [];
  return recipes.filter((recipe) => !recipe.avoid?.some((item) => prefs.includes(item))).slice(0, 8);
};

export const workoutPlan = (profile: UserProfile) => {
  const knee = profile.injuryNotes.includes('膝');
  const pool = (profile.exercisePreferences.length ? profile.exercisePreferences : ['快走', '力量训练', '瑜伽']).filter((item) => (knee ? !['跳绳', '爬楼', 'HIIT', '跑步'].includes(item) : true));
  const safePool = pool.length ? pool : ['快走', '骑车', '瑜伽'];
  return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
    if (index >= Math.min(6, profile.weeklyExerciseDays)) return { day, activity: '休息或主动恢复', minutes: 20, kcal: 0, notes: '散步或拉伸即可。' };
    const activity = safePool[index % safePool.length];
    const exerciseIndex = Math.max(0, exercises.findIndex((item) => item.name === activity));
    return { day, activity, minutes: profile.minutesPerSession, kcal: exerciseCalories(exerciseIndex, profile.currentWeightKg, profile.minutesPerSession), notes: knee ? '膝盖不适时选择低冲击版本。' : '保持可持续节奏。' };
  });
};

export const createSampleData = (): AppData => {
  const profile: UserProfile = {
    age: 32,
    gender: 'female',
    heightCm: 166,
    currentWeightKg: 72,
    targetWeightKg: 64,
    targetDate: addDaysISO(120),
    measurements: { waist: 82, hip: 99 },
    activityLevel: 'light',
    dietPreferences: ['中式', '高蛋白'],
    allergyNotes: '',
    exercisePreferences: ['快走', '力量训练', '瑜伽'],
    equipment: ['无器械', '哑铃'],
    weeklyExerciseDays: 4,
    minutesPerSession: 40,
    injuryNotes: '偶尔膝盖不舒服',
  };
  const today = todayISO();
  return {
    profile,
    meals: [
      { id: uid(), date: today, time: '08:00', mealType: '早餐', foodName: '无糖豆浆燕麦', grams: 260, kcal: 340, protein: 16, carbs: 56, fat: 8, notes: '示例' },
      { id: uid(), date: today, time: '12:30', mealType: '午餐', foodName: '鸡胸肉', grams: 160, ...mealNutrition(4, 160), notes: '' },
      { id: uid(), date: today, time: '16:00', mealType: '加餐', foodName: '苹果', grams: 180, ...mealNutrition(11, 180), notes: '' },
    ],
    exercises: [{ id: uid(), date: today, type: '快走', durationMinutes: 40, intensity: '中', kcal: exerciseCalories(1, profile.currentWeightKg, 40), notes: '示例' }],
    progress: [{ id: uid(), date: today, weightKg: profile.currentWeightKg, measurements: profile.measurements, notes: '初始记录' }],
  };
};
