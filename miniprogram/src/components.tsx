import { Text, View } from '@tarojs/components';

export function SafetyNotice() {
  return (
    <View className="notice">
      <Text className="section-title">健康免责声明</Text>
      <Text className="notice-text">
        本应用提供的热量、运动消耗、食谱和运动建议均为估算，仅用于自我记录和一般健康管理，不构成医疗建议。孕期、哺乳期、未成年人、有慢性疾病、进食障碍史、严重肥胖或正在服药的人，请先咨询医生或注册营养师。
      </Text>
    </View>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <View className="card">
      <Text className="card-label">{label}</Text>
      <Text className="card-value">{value}</Text>
      {hint ? <Text className="card-hint">{hint}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View className="empty">
      <Text className="section-title">{title}</Text>
      <Text className="notice-text">{description}</Text>
    </View>
  );
}

export function ProgressBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.max(4, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <View className="bar-row">
      <View className="bar-label">
        <Text>{label}</Text>
        <Text>{Math.round(value)}</Text>
      </View>
      <View className="bar-track">
        <View className="bar-fill" style={{ width: `${width}%` }} />
      </View>
    </View>
  );
}
