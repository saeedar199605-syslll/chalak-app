/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Briefcase, 
  Users, 
  ClipboardCheck, 
  Scale, 
  TrendingUp, 
  ShieldCheck,
  BrainCircuit,
  Settings,
  Sun,
  Moon,
  LogOut,
  Award,
  BookOpen,
  HelpCircle,
  X,
  LockKeyhole,
  CheckCircle,
  Database
} from 'lucide-react';
import { Employee, UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  currentUser: Employee;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  hasCertifiedBadge: boolean;
  employees?: Employee[];
  onSwitchUser?: (empId: string) => void;
  onStartTour: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  onChangeTab, 
  currentUser, 
  onLogout, 
  theme, 
  onToggleTheme, 
  hasCertifiedBadge,
  onStartTour,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  
  // Categorized Navigation Items
  const menuCategories = [
    {
      title: 'فرآیند ارزیابی و توانمندسازی',
      items: [
        { id: 'dashboard', label: 'داشبورد ارزیابی', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
        { id: 'my-evaluation', label: 'کارنامه و خودارزیابی من', icon: ShieldCheck, roles: ['employee'] },
        { id: 'evaluations', label: 'ارزیابی‌های عملکرد', icon: ClipboardCheck, roles: ['admin', 'supervisor'] },
      ]
    },
    {
      title: 'تحلیل داده و کالیبراسیون',
      items: [
        { id: 'calibration', label: 'پنل کالیبراسیون نمرات', icon: Scale, roles: ['admin'] },
        { id: 'reports', label: 'تحلیل‌ها و ماتریس ۹-Box', icon: TrendingUp, roles: ['admin', 'supervisor'] },
      ]
    },
    {
      title: 'پایگاه شایستگی و پرسنل',
      items: [
        { id: 'criteria', label: 'بانک مرکزی معیارها', icon: FileSpreadsheet, roles: ['admin'] },
        { id: 'profiles', label: 'پروفایل‌های شغلی', icon: Briefcase, roles: ['admin'] },
        { id: 'employees', label: 'مدیریت و کنترل همکاران', icon: Users, roles: ['admin', 'supervisor'] },
      ]
    },
    {
      title: 'سیستم و آموزش',
      items: [
        { id: 'onboarding', label: 'آموزش بدو ورود پرسنل', icon: BookOpen, roles: ['admin', 'supervisor', 'employee'] },
        { id: 'settings', label: 'مرکز مدیریت و امنیت', icon: LockKeyhole, roles: ['admin'] },
      ]
    }
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'مدیر منابع انسانی';
      case 'supervisor': return 'سرپرست خط';
      case 'employee': return 'اپراتور کارگاه';
    }
  };

  const handleTabClick = (tabId: string) => {
    onChangeTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 md:static md:z-auto
        w-72 md:w-64 border-l flex flex-col justify-between h-screen shrink-0 select-none
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'}
        ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-lg'}
      `}>
        
        {/* Top Header & Navigation Links */}
        <div className="p-4 md:p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => handleTabClick(currentUser.role === 'employee' ? 'my-evaluation' : 'dashboard')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all"
              title="صفحه اصلی"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/15 shrink-0">
                <BrainCircuit className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-black tracking-tight truncate">اصفهان چالاک</h1>
                <p className="text-[10px] text-teal-500 font-bold truncate">توسعه هوشمند شایستگی</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-xl bg-slate-800/40 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Session Info Card */}
          <div className={`p-3 rounded-2xl border text-right space-y-1.5 ${
            theme === 'dark' ? 'bg-slate-950/70 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-400">کاربر جاری</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black truncate">
                {currentUser.name}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                {currentUser.code}
              </span>
            </div>
          </div>

          {/* Interactive Tour Trigger */}
          <button
            type="button"
            onClick={onStartTour}
            className="w-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 font-bold py-2 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-teal-400" />
            <span>راهنمای تعاملی سامانه</span>
          </button>

          {/* Categorized Navigation Menu */}
          <nav className="flex flex-col gap-4">
            {menuCategories.map((cat, catIdx) => {
              const visibleItems = cat.items.filter(item => item.roles.includes(currentUser.role));
              if (visibleItems.length === 0) return null;

              return (
                <div key={catIdx} className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 px-3 block">
                    {cat.title}
                  </span>
                  <div className="space-y-0.5">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTabClick(item.id)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-right text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? theme === 'dark'
                                ? 'bg-teal-500/15 text-teal-300 border-r-4 border-teal-500 shadow-sm'
                                : 'bg-teal-50 text-teal-700 border-r-4 border-teal-600 font-black shadow-sm'
                              : theme === 'dark'
                                ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-500' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

        </div>

        {/* Footer Profile & Custom Controls */}
        <div className={`p-4 border-t flex flex-col gap-3 shrink-0 ${
          theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${
              currentUser.role === 'admin'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
            }`}>
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-rose-500" />
              ) : (
                currentUser.name[0]
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold truncate">
                  {currentUser.role === 'admin' ? 'مدیریت ارشد سیستم' : currentUser.name}
                </p>
                {hasCertifiedBadge && (
                  <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" title="ارزیاب ذیصلاح اصفهان چالاک" />
                )}
              </div>
              <p className="text-[9px] text-slate-500 truncate">
                {currentUser.role === 'admin' ? 'راهبری سرمایه انسانی و توسعه سازمان' : `${getRoleLabel(currentUser.role)} • ${currentUser.unit}`}
              </p>
            </div>
          </div>

          {/* Quick Toolbar: Theme & Logout */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/30">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                theme === 'dark' ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-200 text-indigo-600'
              }`}
              title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-[10px] text-slate-400">{theme === 'dark' ? 'تم روز' : 'تم شب'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl transition-all cursor-pointer text-rose-400 hover:bg-rose-500/10 flex items-center gap-1 text-[10px] font-bold"
              title="خروج از حساب"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
