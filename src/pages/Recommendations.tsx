import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { calculateMacroTargets, generateRecipeRecommendations, generateWorkoutPlan, getProfileMetrics } from '../lib/calculations';
import type { AppData } from '../types';

interface RecommendationsProps {
  data: AppData;
  onGoProfile: () => void;
}

export default function Recommendations({ data, onGoProfile }: RecommendationsProps) {
  if (!data.profile) {
    return (
      <div className="page">
        <header className="page-header"><div><p>Recommendations</p><h1>推荐页</h1></div></header>
        <EmptyState title="需要先填写个人资料" description="推荐会基于你的目标、偏好、可运动时间和不适备注生成。" />
        <button className="primary" onClick={onGoProfile}>去填写资料</button>
      </div>
    );
  }
  const profile = data.profile;
  const metrics = getProfileMetrics(profile);
  const macros = calculateMacroTargets(profile);
  const recipeGroups = generateRecipeRecommendations(profile.dietPreferences);
  const plan = generateWorkoutPlan(profile);

  return (
    <div className="page">
      <header className="page-header"><div><p>Recommendations</p><h1>推荐页</h1></div><span className="subtle">规则生成 · 不调用外部 API</span></header>
      {metrics.warnings.length ? <div className="warning-list">{metrics.warnings.map((item) => <p key={item}>{item}</p>)}</div> : null}
      <section className="panel">
        <h2>每日热量与宏量建议</h2>
        <div className="stats-grid compact">
          <StatCard label="建议摄入热量" value={`${macros.calories} kcal`} />
          <StatCard label="蛋白质" value={`${macros.proteinG} g`} hint={`${macros.proteinKcal} kcal · 1.2-1.8 g/kg 区间`} />
          <StatCard label="脂肪" value={`${macros.fatG} g`} hint={`${macros.fatKcal} kcal · 总热量约 25%`} />
          <StatCard label="碳水" value={`${macros.carbsG} g`} hint={`${macros.carbsKcal} kcal · 剩余热量`} />
        </div>
      </section>
      <section className="panel">
        <h2>减脂食谱推荐</h2>
        <div className="recipe-grid">
          {Object.entries(recipeGroups).map(([mealType, group]) => {
            const list = group.exact.length ? group.exact : group.fallback;
            return (
              <div key={mealType} className="recipe-section">
                <h3>{mealType}</h3>
                {!group.exact.length && group.fallback.length ? <p className="subtle">接近匹配：已避开明确忌口，但风格不一定完全匹配。</p> : null}
                {list.map((recipe) => (
                  <article key={recipe.id} className="recipe-card">
                    <strong>{recipe.name}</strong>
                    <span>{recipe.kcal} kcal · 蛋白 {recipe.protein}g · 碳水 {recipe.carbs}g · 脂肪 {recipe.fat}g</span>
                    <p>食材：{recipe.ingredients.join('、')}</p>
                    <p>做法：{recipe.steps}</p>
                    <small>{recipe.reason}</small>
                  </article>
                ))}
                {!list.length ? <EmptyState title="暂无完全匹配" description="当前忌口较多，可以放宽偏好或手动调整食材。" /> : null}
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <h2>一周运动计划推荐</h2>
        <div className="list">
          {plan.map((day) => (
            <article key={day.day} className="list-row workout">
              <div><strong>{day.day} · {day.activity}</strong><span>{day.minutes} 分钟 · {day.intensity} · 估算消耗 {day.estimatedKcal} kcal</span></div>
              <p>{day.notes}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
