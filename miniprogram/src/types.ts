export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'veryHigh';
export type MealType = '早餐' | '午餐' | '晚餐' | '加餐' | '夜宵';
export type ExerciseIntensity = '低' | '中' | '高';

export interface Measurement {
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
  measurements: Measurement;
  activityLevel: ActivityLevel;
  dietPreferences: string[];
  allergyNotes: string;
  exercisePreferences: string[];
  equipment: string[];
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
}

export interface ExerciseEntry {
  id: string;
  date: string;
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
  measurements: Measurement;
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
  avoid?: string[];
}

export interface AppData {
  profile: UserProfile | null;
  meals: MealEntry[];
  exercises: ExerciseEntry[];
  progress: ProgressEntry[];
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
