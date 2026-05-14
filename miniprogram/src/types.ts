export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'veryHigh';
export type DietPreference =
  | '普通'
  | '中式'
  | '低碳'
  | '高蛋白'
  | '素食'
  | '不吃猪肉'
  | '不吃牛肉'
  | '乳糖不耐';
export type Equipment = '无器械' | '哑铃' | '弹力带' | '健身房';
export type MealType = '早餐' | '午餐' | '晚餐' | '加餐' | '夜宵';
export type ExerciseIntensity = '低' | '中' | '高';

export interface BodyMeasurement {
  waist?: number;
  hip?: number;
  chest?: number;
  thigh?: number;
  arm?: number;
}

export interface UserProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDate: string;
  measurements: BodyMeasurement;
  activityLevel: ActivityLevel;
  dietPreferences: DietPreference[];
  allergyNotes: string;
  exercisePreferences: string[];
  equipment: Equipment[];
  weeklyExerciseDays: number;
  minutesPerSession: number;
  injuryNotes: string;
}

export interface FoodItem {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  tags?: string[];
}

export interface MealEntry {
  id: string;
  date: string;
  time: string;
  mealType: MealType;
  foodName: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
}

export interface ExerciseType {
  id: string;
  name: string;
  met: number;
  lowImpact?: boolean;
}

export interface ExerciseEntry {
  id: string;
  date: string;
  startTime: string;
  type: string;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  kcal: number;
  notes: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  weightKg: number;
  measurements: BodyMeasurement;
  notes: string;
}

export interface Recipe {
  id: string;
  mealType: '早餐' | '午餐' | '晚餐' | '加餐';
  name: string;
  ingredients: string[];
  steps: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
  tags: string[];
  avoid?: DietPreference[];
}

export interface DailySummary {
  date: string;
  intakeKcal: number;
  exerciseKcal: number;
  netKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  exerciseCount: number;
  exerciseMinutes: number;
  weightKg?: number;
}

export interface ProfileMetrics {
  bmi: number;
  bmr: number;
  tdee: number;
  targetLossKg: number;
  daysToTarget: number;
  theoreticalDeficit: number;
  recommendedDeficit: number;
  targetCalories: number;
  warnings: string[];
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  proteinKcal: number;
  fatG: number;
  fatKcal: number;
  carbsG: number;
  carbsKcal: number;
}

export interface WorkoutPlanDay {
  day: string;
  activity: string;
  minutes: number;
  intensity: ExerciseIntensity | '恢复';
  estimatedKcal: number;
  notes: string;
}

export interface AppData {
  profile: UserProfile | null;
  meals: MealEntry[];
  exercises: ExerciseEntry[];
  progress: ProgressEntry[];
}
