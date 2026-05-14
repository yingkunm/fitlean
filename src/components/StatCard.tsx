interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'normal' | 'good' | 'warn';
}

export default function StatCard({ label, value, hint, tone = 'normal' }: StatCardProps) {
  return (
    <div className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}
