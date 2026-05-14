import type { ExerciseType } from '../types';

export const exerciseTypes: ExerciseType[] = [
  { id: 'walk', name: '步行', met: 3.0, lowImpact: true },
  { id: 'brisk-walk', name: '快走', met: 4.3, lowImpact: true },
  { id: 'run', name: '跑步', met: 8.0 },
  { id: 'cycle', name: '骑车', met: 6.8, lowImpact: true },
  { id: 'strength', name: '力量训练', met: 3.8, lowImpact: true },
  { id: 'yoga', name: '瑜伽', met: 2.5, lowImpact: true },
  { id: 'hiit', name: 'HIIT', met: 8.0 },
  { id: 'swim', name: '游泳', met: 7.0, lowImpact: true },
  { id: 'rope', name: '跳绳', met: 10.0 },
  { id: 'elliptical', name: '椭圆机', met: 5.0, lowImpact: true },
  { id: 'stairs', name: '爬楼', met: 8.8 },
  { id: 'pilates', name: '普拉提', met: 3.0, lowImpact: true },
];
