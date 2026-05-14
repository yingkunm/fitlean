import { useEffect, useState } from 'react';
import Layout, { type PageKey } from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExerciseLog from './pages/ExerciseLog';
import FoodLog from './pages/FoodLog';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Recommendations from './pages/Recommendations';
import type { AppData } from './types';
import { clearData, createSampleData, exportData, importData, loadData, saveData } from './lib/storage';

export default function App() {
  const [data, setDataState] = useState<AppData>(() => loadData());
  const [page, setPage] = useState<PageKey>('dashboard');
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const setData = (next: AppData) => {
    setDataState(next);
    saveData(next);
  };

  useEffect(() => {
    if (!data.profile) setPage('dashboard');
  }, [data.profile]);

  const loadSamples = () => {
    if (data.profile || data.meals.length || data.exercises.length || data.progress.length) {
      if (!confirm('加载示例数据会覆盖当前本地数据，确定继续吗？')) return;
    }
    setData(createSampleData());
    setMessage('示例数据已加载，可以直接查看 Dashboard、记录和推荐。');
  };

  const doExport = () => {
    const blob = new Blob([exportData(data)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitlean-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    try {
      setData(importData(importText));
      setImportText('');
      setMessage('数据导入成功。');
    } catch {
      setMessage('导入失败，请检查 JSON 文件内容。');
    }
  };

  const doClear = () => {
    if (confirm('确定清空所有本地数据吗？此操作不可撤销。')) {
      clearData();
      setDataState({ profile: null, meals: [], exercises: [], progress: [] });
      setMessage('本地数据已清空。');
    }
  };

  return (
    <Layout page={page} onPageChange={setPage}>
      <div className="top-actions">
        <button onClick={loadSamples}>加载示例数据</button>
        <button onClick={doExport}>导出 JSON</button>
        <details>
          <summary>导入 JSON</summary>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="粘贴导出的 JSON 内容" />
          <button className="primary" onClick={doImport}>确认导入</button>
        </details>
        <button className="danger" onClick={doClear}>清空数据</button>
      </div>
      {message ? <div className="toast">{message}</div> : null}
      {page === 'dashboard' ? <Dashboard data={data} onGoProfile={() => setPage('profile')} /> : null}
      {page === 'profile' ? <Profile data={data} setData={setData} onSaved={() => setPage('dashboard')} /> : null}
      {page === 'food' ? <FoodLog data={data} setData={setData} /> : null}
      {page === 'exercise' ? <ExerciseLog data={data} setData={setData} /> : null}
      {page === 'progress' ? <Progress data={data} setData={setData} /> : null}
      {page === 'recommendations' ? <Recommendations data={data} onGoProfile={() => setPage('profile')} /> : null}
    </Layout>
  );
}
