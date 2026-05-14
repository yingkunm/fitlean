import { Activity, Apple, ChartLine, Dumbbell, Home, Settings, UserRound } from 'lucide-react';
import type React from 'react';

export type PageKey = 'dashboard' | 'profile' | 'food' | 'exercise' | 'progress' | 'recommendations';

const navItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: '首页', icon: <Home size={18} /> },
  { key: 'profile', label: '资料', icon: <UserRound size={18} /> },
  { key: 'food', label: '饮食', icon: <Apple size={18} /> },
  { key: 'exercise', label: '运动', icon: <Dumbbell size={18} /> },
  { key: 'progress', label: '进度', icon: <ChartLine size={18} /> },
  { key: 'recommendations', label: '推荐', icon: <Activity size={18} /> },
];

interface LayoutProps {
  page: PageKey;
  onPageChange: (page: PageKey) => void;
  children: React.ReactNode;
}

export default function Layout({ page, onPageChange, children }: LayoutProps) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Settings size={20} /></div>
          <div>
            <strong>FitLean Tracker</strong>
            <span>减脂助手</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button key={item.key} className={page === item.key ? 'active' : ''} onClick={() => onPageChange(item.key)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
