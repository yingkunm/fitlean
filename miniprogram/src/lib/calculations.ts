import { exerciseTypes } from '../data/exercises';
import { recipes } from '../data/recipes';
import type {
  ActivityLevel,
  DailySummary,
  DietPreference,
  ExerciseEntry,
  FoodItem,
  Gender,
  MacroTargets,
  MealEntry,
  ProfileMetrics,
  ProgressEntry,
  Recipe,
  UserProfile,
  WorkoutPlanDay,
} from '../types';
import { daysBetween, lastNDates, todayISO } from './date';

export const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  veryHigh: 1.9,
};

export const activityLabels: Record<ActivityLevel, string> = {
  sedentary: '久坐',
  light: '轻度活动',
  moderate: '中等活动',
  high: '高度活动',
  veryHigh: '非常活跃',
};

export const genderLabels: Record<Gender, string> = {
  male: '男',
  female: '女',
  other: '其他/不透露',
};

export const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const calculateBMI = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm) return 0;
  return weightKg / (heightCm / 100) ** 2;
};

export const calculateBMR = (profile: Pick<UserProfile, 'gender' | 'currentWeightKg' | 'heightCm' | 'age'>) => {
  const male = 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const female = 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  if (profile.gender === 'male') return male;
  if (profile.gender === 'female') return female;
  return (male + female) / 2;
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel) => bmr * activityFactors[activityLevel];

export const calculateDailyDeficit = (targetLossKg: number, days: number) => {
  if (targetLossKg <= 0 || days <= 0) return 0;
  return (targetLossKg * 7700) / days;
};

export const calculateTargetCalories = (tdee: number, recommendedDeficit: number) => tdee - recommendedDeficit;

export const calculateMealNutrition = (food: FoodItem, grams: number) => ({
  kcal: round((food.kcalPer100g * grams) / 100),
  protein: round((food.proteinPer100g * grams) / 100, 1),
  carbs: round((food.carbsPer100g * grams) / 100, 1),
  fat: round((food.fatPer100g * grams) / 100, 1),
});

export const calculateExerciseCalories = (met: number, weightKg: number, durationMinutes: number) =>
  round((met * 3.5 * weightKg * durationMinutes) / 200);

export const getProfileMetrics = (profile: UserProfile): ProfileMetrics => {
  const bmi = calculateBMI(profile.currentWeightKg, profile.heightCm);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetLossKg = profile.currentWeightKg - profile.targetWeightKg;
  const daysToTarget = daysBetween(todayISO(), profile.targetDate);
  const theoreticalDeficit = calculateDailyDeficit(targetLossKg, daysToTarget);
  const recommendedDeficit = theoreticalDeficit <= 0 ? 0 : Math.min(750, Math.max(250, theoreticalDeficit));
  const targetCalories = calculateTargetCalories(tdee, recommendedDeficit);
  const targetBmi = calculateBMI(profile.targetWeightKg, profile.heightCm);
  const warnings: string[] = [];

  if (profile.gender === 'other') warnings.push('其他/不透露选项会让基础代谢估算误差可能更大。');
  if (targetBmi > 0 && targetBmi < 18.5) warnings.push('目标体重对应 BMI 低于 18.5，目标体重可能过低。');
  if (theoreticalDeficit > 1000) warnings.push('当前目标需要每日缺口超过 1000 kcal，属于过激目标，建议延长周期。');
  if (targetCalories < 1200) warnings.push('建议摄入热量过低，建议咨询医生或注册营养师。');
  if (daysToTarget <= 0) warnings.push('目标日期需要晚于今天，才能估算每日热量缺口。');

  return {
    bmi: round(bmi, 1),
    bmr: round(bmr),
    tdee: round(tdee),
    targetLossKg: round(targetLossKg, 1),
    daysToTarget,
    theoreticalDeficit: round(theoreticalDeficit),
    recommendedDeficit: round(recommendedDeficit),
    targetCalories: round(targetCalories),
    warnings,
  };
};

export const calculateMacroTargets = (profile: UserProfile): MacroTargets => {
  const metrics = getProfileMetrics(profile);
  const activityProtein = profile.activityLevel === 'high' || profile.activityLevel === 'veryHigh' ? 1.7 : profile.activityLevel === 'moderate' ? 1.5 : 1.3;
  const proteinG = round(profile.currentWeightKg * activityProtein);
  const proteinKcal = proteinG * 4;
  const fatKcal = round(metrics.targetCalories * 0.25);
  const fatG = round(fatKcal / 9);
  const carbsKcal = Math.max(0, metrics.targetCalories - proteinKcal - fatKcal);
  const carbsG = round(carbsKcal / 4);
  return { calories: metrics.targetCalories, proteinG, proteinKcal, fatG, fatKcal, carbsG, carbsKcal: round(carbsKcal) };
};

export const generateDailySummary = (
  date: string,
  meals: MealEntry[],
  exercises: ExerciseEntry[],
  progress: ProgressEntry[],
): DailySummary => {
  const dayMeals = meals.filter((meal) => meal.date === date);
  const dayExercises = exercises.filter((exercise) => exercise.date === date);
  const progressForDay = [...progress].reverse().find((entry) => entry.date <= date);
  const intakeKcal = dayMeals.reduce((sum, meal) => sum + meal.kcal, 0);
  const exerciseKcal = dayExercises.reduce((sum, exercise) => sum + exercise.kcal, 0);
  return {
    date,
    intakeKcal: round(intakeKcal),
    exerciseKcal: round(exerciseKcal),
    netKcal: round(intakeKcal - exerciseKcal),
    protein: round(dayMeals.reduce((sum, meal) => sum + meal.protein, 0), 1),
    carbs: round(dayMeals.reduce((sum, meal) => sum + meal.carbs, 0), 1),
    fat: round(dayMeals.reduce((sum, meal) => sum + meal.fat, 0), 1),
    mealCount: dayMeals.length,
    exerciseCount: dayExercises.length,
    exerciseMinutes: dayExercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0),
    weightKg: progressForDay?.weightKg,
  };
};

export const generateTrend = (meals: MealEntry[], exercises: ExerciseEntry[], progress: ProgressEntry[], days = 7) =>
  lastNDates(days).map((date) => generateDailySummary(date, meals, exercises, progress));

const conflictsWithPreference = (recipe: Recipe, prefs: DietPreference[]) => {
  if (recipe.avoid?.some((item) => prefs.includes(item))) return true;
  if (prefs.includes('素食') && !recipe.tags.includes('素食')) return true;
  return false;
};

export const generateRecipeRecommendations = (preferences: DietPreference[]) => {
  const result: Record<'早餐' | '午餐' | '晚餐' | '加餐', { exact: Recipe[]; fallback: Recipe[] }> = {
    早餐: { exact: [], fallback: [] },
    午餐: { exact: [], fallback: [] },
    晚餐: { exact: [], fallback: [] },
    加餐: { exact: [], fallback: [] },
  };

  recipes.forEach((recipe) => {
    const bucket = result[recipe.mealType];
    if (!conflictsWithPreference(recipe, preferences)) {
      const matchesStyle = preferences.length === 0 || preferences.some((pref) => recipe.tags.includes(pref)) || preferences.includes('普通');
      (matchesStyle ? bucket.exact : bucket.fallback).push(recipe);
    }
  });

  return Object.fromEntries(
    Object.entries(result).map(([mealType, bucket]) => [
      mealType,
      {
        exact: bucket.exact.slice(0, 2),
        fallback: bucket.exact.length ? [] : bucket.fallback.slice(0, 2),
      },
    ]),
  ) as typeof result;
};

export const generateWorkoutPlan = (profile: UserProfile): WorkoutPlanDay[] => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const planDays = Math.min(6, Math.max(1, profile.weeklyExerciseDays));
  const hasKneeIssue = profile.injuryNotes.includes('膝');
  const hasBackIssue = profile.injuryNotes.includes('腰');
  const preferred = profile.exercisePreferences.length ? profile.exercisePreferences : ['快走', '力量训练', '骑车'];
  const pool = preferred.filter((item) => (hasKneeIssue ? !['跳绳', '爬楼', 'HIIT', '跑步'].includes(item) : true));
  const safePool = pool.length ? pool : ['快走', '骑车', '瑜伽'];
  const minutes = Math.max(15, profile.minutesPerSession || 30);

  return days.map((day, index) => {
    if (index >= planDays) {
      return {
        day,
        activity: '休息或主动恢复',
        minutes: 20,
        intensity: '恢复',
        estimatedKcal: 0,
        notes: '散步、拉伸或轻松活动即可，给身体恢复时间。',
      };
    }
    const activity = safePool[index % safePool.length];
    const exercise = exerciseTypes.find((item) => item.name === activity) ?? exerciseTypes.find((item) => item.name === '快走')!;
    const notes = [
      hasKneeIssue ? '膝盖不适时选择低冲击版本，避免跳跃和爬楼。' : '保持可持续的节奏，结束后做放松。',
      hasBackIssue ? '腰不舒服时避免高负重深蹲、硬拉类动作，注意中立脊柱。' : '',
      profile.equipment.includes('无器械') ? '可用自重动作完成力量部分。' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return {
      day,
      activity,
      minutes,
      intensity: index % 3 === 2 ? '中' : '低',
      estimatedKcal: calculateExerciseCalories(exercise.met, profile.currentWeightKg, minutes),
      notes,
    };
  });
};
