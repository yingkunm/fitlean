import { useState } from 'react';
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState';
import { calculateBMI, round } from '../lib/calculations';
import { formatDateLabel, todayISO, uid } from '../lib/date';
import type { AppData, ProgressEntry } from '../types';

const emptyForm = { id: '', date: todayISO(), weightKg: 70, measurements: {}, notes: '' } as ProgressEntry;

interface ProgressProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function Progress({ data, setData }: ProgressProps) {
  const [form, setForm] = useState<ProgressEntry>(data.profile ? { ...emptyForm, weightKg: data.profile.currentWeightKg, measurements: data.profile.measurements } : emptyForm);
  const [message, setMessage] = useState('');
  const sorted = [...data.progress].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const latest = sorted.at(-1);
  const height = data.profile?.heightCm ?? 170;
  const chartData = sorted.map((entry) => ({ 日期: formatDateLabel(entry.date), 体重: entry.weightKg, 腰围: entry.measurements.waist }));

  const updateMeasurement = (key: keyof ProgressEntry['measurements'], value: string) =>
    setForm((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: value ? Number(value) : undefined } }));

  const submit = () => {
    if (form.weightKg <= 0) {
      setMessage('体重需要大于 0。');
      return;
    }
    const entry = { ...form, id: form.id || uid() };
    const progress = form.id ? data.progress.map((item) => (item.id === form.id ? entry : item)) : [...data.progress, entry];
    setData({ ...data, progress });
    setForm({ ...emptyForm, date: todayISO(), weightKg: entry.weightKg, measurements: entry.measurements });
    setMessage(form.id ? '进度记录已更新。' : '进度记录已添加。');
  };

  const remove = (id: string) => {
    if (confirm('确定删除这条进度记录吗？')) {
      setData({ ...data, progress: data.progress.filter((entry) => entry.id !== id) });
    }
  };

  return (
    <div className="page">
      <header className="page-header"><div><p>Progress</p><h1>进度记录</h1></div></header>
      {message ? <div className="toast">{message}</div> : null}
      <section className="panel">
        <h2>{form.id ? '编辑记录' : '添加记录'}</h2>
        <div className="form-grid">
          <label>日期<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label>体重 kg<input type="number" min="20" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} /></label>
          <label>腰围 cm<input type="number" min="30" value={form.measurements.waist ?? ''} onChange={(e) => updateMeasurement('waist', e.target.value)} /></label>
          <label>臀围 cm<input type="number" min="30" value={form.measurements.hip ?? ''} onChange={(e) => updateMeasurement('hip', e.target.value)} /></label>
          <label>胸围 cm<input type="number" min="30" value={form.measurements.chest ?? ''} onChange={(e) => updateMeasurement('chest', e.target.value)} /></label>
          <label>大腿围 cm<input type="number" min="20" value={form.measurements.thigh ?? ''} onChange={(e) => updateMeasurement('thigh', e.target.value)} /></label>
          <label>上臂围 cm<input type="number" min="15" value={form.measurements.arm ?? ''} onChange={(e) => updateMeasurement('arm', e.target.value)} /></label>
        </div>
        <label>备注<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="睡眠、盐分、水肿、训练状态等" /></label>
        <div className="actions"><button className="primary" onClick={submit}>{form.id ? '保存修改' : '添加记录'}</button>{form.id ? <button onClick={() => setForm(emptyForm)}>取消编辑</button> : null}</div>
      </section>
      <section className="metric-strip">
        <div><span>体重变化</span><strong>{first && latest ? round(latest.weightKg - first.weightKg, 1) : 0} kg</strong></div>
        <div><span>腰围变化</span><strong>{first?.measurements.waist && latest?.measurements.waist ? round(latest.measurements.waist - first.measurements.waist, 1) : 0} cm</strong></div>
        <div><span>BMI 变化</span><strong>{first && latest ? round(calculateBMI(latest.weightKg, height) - calculateBMI(first.weightKg, height), 1) : 0}</strong></div>
      </section>
      <section className="advice-card"><p>体重受水分、盐分、月经周期、睡眠等影响，建议看 7 日平均趋势。</p></section>
      <section className="panel">
        <h2>体重与腰围趋势</h2>
        {sorted.length ? (
          <div className="chart">
            <ResponsiveContainer minWidth={0}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ece8" />
                <XAxis dataKey="日期" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="体重" stroke="#3b8f69" strokeWidth={3} />
                <Line type="monotone" dataKey="腰围" stroke="#5a7fd8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyState title="暂无进度记录" description="保存个人资料后会自动创建第一条，也可以手动添加。" />}
      </section>
      <section className="panel">
        <h2>历史记录</h2>
        {sorted.length ? <div className="list">{[...sorted].reverse().map((entry) => <article key={entry.id} className="list-row"><div><strong>{entry.date} · {entry.weightKg} kg</strong><span>腰围 {entry.measurements.waist ?? '-'} cm · BMI {round(calculateBMI(entry.weightKg, height), 1)}</span></div><div className="row-actions"><button onClick={() => setForm(entry)}>编辑</button><button className="danger" onClick={() => remove(entry.id)}>删除</button></div></article>)}</div> : null}
      </section>
    </div>
  );
}
