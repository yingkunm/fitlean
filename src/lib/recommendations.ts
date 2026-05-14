import type { DailySummary, UserProfile } from '../types';
import { getProfileMetrics } from './calculations';

export const getTodayAdvice = (profile: UserProfile | null, summary: DailySummary, recent: DailySummary[]) => {
  if (!profile) return '请先填写个人资料，减脂助手会据此生成更准确的估算建议。';
  const metrics = getProfileMetrics(profile);
  if (summary.mealCount === 0) return '今天还没有饮食记录。先记录一餐，今日建议会更有参考价值。';
  if (summary.netKcal < metrics.targetCalories * 0.65) return '今日净摄入明显偏低，可能增加疲劳和暴食风险，不建议用极端节食换速度。';
  if (summary.exerciseKcal > 900) return '今日运动消耗估算较高，注意恢复、补水和睡眠，不要把过量运动当作惩罚。';
  const diff = summary.netKcal - metrics.targetCalories;
  if (Math.abs(diff) < 150) return '今天的净摄入接近建议目标，继续保持稳定记录。';
  if (diff > 300) return '今天净摄入高于建议目标，可以优先增加蔬菜和蛋白质，减少高油高糖零食。';
  const lowDays = recent.filter((day) => day.mealCount > 0 && day.netKcal < metrics.targetCalories * 0.7).length;
  if (lowDays >= 3) return '最近多天净摄入偏低。减脂更需要可持续，请考虑提高摄入或咨询医生/注册营养师。';
  return '今天略低于建议目标，晚些时候如果饥饿，可补充高蛋白加餐。';
};
