import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Scale, 
  Grid3X3, 
  Users, 
  Briefcase, 
  Layers, 
  FileSpreadsheet, 
  Archive,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuthStore();
  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد مدیریتی', icon: LayoutDashboard },
    { id: 'evaluations', label: 'ارزیابی‌های عملکرد', icon: ClipboardCheck },
    { id: 'ninebox', label: 'ماتریس ۹ خانه (9-Box)', icon: Grid3X3 },
    { id: 'calibration', label: 'کالیبراسیون و توزیع نرمال', icon: Scale },
    { id: 'reports', label: 'گزارش‌های تحلیلی', icon: BarChart3 },
    ...(isAdminOrHr ? [
      { id: 'employees', label: 'مدیریت پرسنل', icon: Users },
      { id: 'criteria', label: 'بانک شاخص‌های شایستگی', icon: Layers },
      { id: 'job_profiles', label: 'پروفایل‌های شغلی و اوزان', icon: Briefcase },
      { id: 'backups', label: 'پشتیبان‌گیری ابری (R2)', icon: Archive }
    ] : [])
  ];

  return (
    <aside className="w-64 border-l border-slate-800 bg-slate-900/50 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          منوی اصلی سامانه
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="font-bold text-slate-300">سازمان: اصفهان چالاک</div>
        <div>پایگاه داده: Cloudflare D1 (توزیع‌شده)</div>
        <div>همگام‌سازی: Durable Objects</div>
      </div>
    </aside>
  );
};
