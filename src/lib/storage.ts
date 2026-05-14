import type { AppData, UserProfile } from '../types';
import { addDaysISO, todayISO, uid } from './date';
import { calculateExerciseCalories, calculateMealNutrition } from './calculations';
import { foods } from '../data/foods';
import { exerciseTypes } from '../data/exercises';

const KEY = 'fitlean-tracker-data-v1';

export const emptyData: AppData = {
  profile: null,
  meals: [],
  exercises: [],
  progress: [],
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyData, ...JSON.parse(raw) } : emptyData;
  } catch {
    return emptyData;
  }
};

export const saveData = (data: AppData) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const clearData = () => {
  localStorage.removeItem(KEY);
};

export const exportData = (data: AppData) => JSON.stringify(data, null, 2);

export const importData = (raw: string): AppData => {
  const parsed = JSON.parse(raw) as AppData;
  if (!('meals' in parsed) || !('exercises' in parsed) || !('progress' in parsed)) {
    throw new Error('导入文件格式不正确');
  }
  return { ...emptyData, ...parsed };
};

export const createSampleData = (): AppData => {
  const profile: UserProfile = {
    age: 32,
    gender: 'female',
    heightCm: 166,
    currentWeightKg: 72,
    targetWeightKg: 64,
    targetDate: addDaysISO(120),
    measurements: { waist: 82, hip: 99, chest: 91, thigh: 56, arm: 29 },
    activityLevel: 'light',
    dietPreferences: ['中式', '高蛋白'],
    allergyNotes: '',
    exercisePreferences: ['快走', '力量训练', '瑜伽'],
    equipment: ['无器械', '哑铃'],
    weeklyExerciseDays: 4,
    minutesPerSession: 40,
    injuryNotes: '偶尔膝盖不舒服',
  };
  const dates = Array.from({ length: 7 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - index));
    return d.toISOString().slice(0, 10);
  });
  const meals = dates.flatMap((date, index) => {
    const rice = calculateMealNutrition(foods[0], 120);
    const chicken = calculateMealNutrition(foods[4], 160);
    const apple = calculateMealNutrition(foods[11], 180);
    return [
      { id: uid(), date, time: '08:10', mealType: '早餐' as const, foodName: '无糖豆浆燕麦', grams: 260, kcal: 340, protein: 16, carbs: 56, fat: 8, notes: '示例早餐' },
      { id: uid(), date, time: '12:30', mealType: '午餐' as const, foodName: '米饭', grams: 120, ...rice, notes: '' },
      { id: uid(), date, time: '12:35', mealType: '午餐' as const, foodName: '鸡胸肉', grams: 160, ...chicken, notes: '' },
      { id: uid(), date, time: '16:00', mealType: '加餐' as const, foodName: '苹果', grams: 180, ...apple, notes: index % 2 ? '训练前' : '' },
    ];
  });
  const exercises = dates
    .filter((_, index) => index % 2 === 0)
    .map((date) => {
      const type = exerciseTypes.find((item) => item.name === '快走')!;
      const durationMinutes = 40;
      return {
        id: uid(),
        date,
        startTime: '19:00',
        type: type.name,
        durationMinutes,
        intensity: '中' as const,
        kcal: calculateExerciseCalories(type.met, profile.currentWeightKg, durationMinutes),
        notes: '示例运动',
      };
    });
  const progress = dates.map((date, index) => ({
    id: uid(),
    date,
    weightKg: 72 - index * 0.15,
    measurements: { waist: 82 - index * 0.1, hip: 99, chest: 91, thigh: 56, arm: 29 },
    notes: index === 0 ? '初始记录' : '',
  }));
  return { profile, meals, exercises, progress };
};
