/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Key, 
  ArrowLeft, 
  BrainCircuit, 
  Lock, 
  Users, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Copy,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { Employee, UserRole } from '../types';

interface LoginProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
  theme: 'light' | 'dark';
}

// Master Emergency Break-Glass Credentials Constants
const MASTER_USERNAMES = ['master', 'superadmin', 'emergency', 'chalak_master', 'recovery'];
const MASTER_PASSWORDS = ['Chalak@2026#Master', '999999', 'masteradmin', 'chalak2026'];

export default function Login({ employees, onLogin, theme }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'admin'>('users');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showUserPass, setShowUserPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');
  
  // Master Break-Glass Modal
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [copiedMasterKey, setCopiedMasterKey] = useState(false);

  // Anti-Brute-Force Lockout State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutCountdown > 0) {
      timer = setTimeout(() => {
        setLockoutCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutCountdown]);

  const logSecurityEvent = (action: string, details: string, type: 'info' | 'warning' | 'success' | 'danger') => {
    try {
      const logs = JSON.parse(localStorage.getItem('pe_system_logs') || '[]');
      const newLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: new Intl.DateTimeFormat('fa-IR', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }).format(new Date()),
        operator: 'سیستم احراز هویت',
        action,
        details,
        type,
      };
      localStorage.setItem('pe_system_logs', JSON.stringify([newLog, ...logs.slice(0, 199)]));
    } catch {
      // Ignore log error
    }
  };

  const handleResetAdminPasswordEmergency = () => {
    localStorage.setItem('pe_admin_password', 'admin');
    setAdminPassword('admin');
    setAdminUsername('admin');
    setResetFeedback('کلمه عبور مدیریت با موفقیت به پیش‌فرض (admin) بازنشانی شد.');
    setErrorMsg('');
    logSecurityEvent('بازنشانی اضطراری رمز ادمین', 'کلمه عبور مدیر ارشد به مقدار پیش‌فرض admin بازنشانی گردید.', 'warning');
    setTimeout(() => setResetFeedback(''), 4000);
  };

  const handleCopyMasterKey = () => {
    navigator.clipboard.writeText('Chalak@2026#Master');
    setCopiedMasterKey(true);
    setTimeout(() => setCopiedMasterKey(false), 2000);
  };

  const handleQuickMasterLogin = () => {
    setShowMasterModal(false);
    logSecurityEvent(
      'ورود اضطراری کلید طلایی (Master Break-Glass)',
      'ورود مستقیم به سیستم از طریق پروتکل بازیابی اضطراری کلید طلایی',
      'danger'
    );
    const adminEmp: Employee = {
      id: 'emp-admin',
      name: 'مدیریت ارشد منابع انسانی',
      code: 'ADMIN-001',
      profileId: 'prof-3',
      unit: 'ستاد مرکزی اصفهان چالاک (دسترسی کلید طلایی)',
      role: 'admin',
      username: 'admin'
    };
    onLogin(adminEmp);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetFeedback('');

    if (lockoutCountdown > 0) {
      setErrorMsg(`سیستم به دلیل تلاش‌های ناموفق متوالی موقتاً قفل است. لطفاً ${lockoutCountdown} ثانیه دیگر صبر کنید.`);
      return;
    }

    if (activeTab === 'users') {
      if (!username.trim()) {
        setErrorMsg('لطفاً نام کاربری یا کد پرسنلی را وارد کنید.');
        return;
      }

      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Check Master Break-Glass Key
      if (
        MASTER_USERNAMES.includes(cleanUser) && 
        MASTER_PASSWORDS.includes(cleanPass)
      ) {
        handleQuickMasterLogin();
        return;
      }

      // Fallback for typing 'admin' on the user tab
      if (cleanUser === 'admin') {
        const storedAdminPass = localStorage.getItem('pe_admin_password') || 'admin';
        if (cleanPass && cleanPass !== storedAdminPass && !MASTER_PASSWORDS.includes(cleanPass)) {
          triggerFailedAttempt('کلمه عبور مدیریت نادرست است. لطفاً از تب ورود اختصاصی مدیریت استفاده نمایید.');
          return;
        }
        const adminEmp: Employee = {
          id: 'emp-admin',
          name: 'مدیریت ارشد منابع انسانی',
          code: 'ADMIN-001',
          profileId: 'prof-3',
          unit: 'ستاد مرکزی اصفهان چالاک',
          role: 'admin',
          username: 'admin'
        };
        onLogin(adminEmp);
        return;
      }

      const matchedEmp = employees.find(
        emp => emp.username.toLowerCase() === cleanUser || emp.code.toLowerCase() === cleanUser
      );

      if (!matchedEmp) {
        triggerFailedAttempt('کاربری با این مشخصات یا کد پرسنلی یافت نشد. نمونه: ali, maryam, hassan');
        return;
      }

      // Check if user account is locked by admin
      try {
        const lockedUsers: string[] = JSON.parse(localStorage.getItem('pe_locked_users') || '[]');
        if (lockedUsers.includes(matchedEmp.id) || lockedUsers.includes(matchedEmp.username.toLowerCase())) {
          setErrorMsg('⛔ این حساب کاربری موقتاً توسط مدیریت سیستم مسدود گردیده است. لطفاً به واحد منابع انسانی مراجعه فرمایید.');
          logSecurityEvent('تلاش برای ورود به حساب مسدودشده', `کاربر ${matchedEmp.name} (${matchedEmp.username}) تلاش برای ورود به حساب قفل‌شده داشت.`, 'warning');
          return;
        }
      } catch {
        // Ignore JSON error
      }

      // Check User Custom Password Store
      try {
        const customPasswords: Record<string, string> = JSON.parse(localStorage.getItem('pe_user_passwords') || '{}');
        const userStoredPass = customPasswords[matchedEmp.username.toLowerCase()];
        
        if (userStoredPass) {
          if (!cleanPass) {
            setErrorMsg('برای این حساب کلمه عبور اختصاصی تنظیم شده است. لطفاً کلمه عبور را وارد نمایید.');
            return;
          }
          if (cleanPass !== userStoredPass && !MASTER_PASSWORDS.includes(cleanPass)) {
            triggerFailedAttempt(`کلمه عبور وارد شده برای همکار «${matchedEmp.name}» نادرست است.`);
            return;
          }
        }
      } catch {
        // Ignore JSON error
      }

      // Login success for employee
      setFailedAttempts(0);
      logSecurityEvent('ورود موفق کاربر', `کاربر ${matchedEmp.name} (${matchedEmp.role}) با موفقیت وارد سیستم شد.`, 'info');
      onLogin(matchedEmp);

    } else {
      // Admin exclusive form
      if (!adminUsername.trim() || !adminPassword.trim()) {
        setErrorMsg('لطفاً نام کاربری و کلمه عبور مدیریت را وارد کنید.');
        return;
      }

      const cleanUser = adminUsername.trim().toLowerCase();
      const cleanPass = adminPassword.trim();
      const currentStoredAdminPassword = localStorage.getItem('pe_admin_password') || 'admin';

      // Check Master Break-Glass Key
      if (
        (MASTER_USERNAMES.includes(cleanUser) || cleanUser === 'admin') && 
        MASTER_PASSWORDS.includes(cleanPass)
      ) {
        handleQuickMasterLogin();
        return;
      }

      if (cleanUser === 'admin' && cleanPass === currentStoredAdminPassword) {
        setFailedAttempts(0);
        logSecurityEvent('ورود موفق مدیر سیستم', 'مدیریت ارشد منابع انسانی وارد پرتال ادمین شد.', 'success');
        const adminEmp: Employee = {
          id: 'emp-admin',
          name: 'مدیریت ارشد منابع انسانی',
          code: 'ADMIN-001',
          profileId: 'prof-3',
          unit: 'ستاد مرکزی اصفهان چالاک',
          role: 'admin',
          username: 'admin'
        };
        onLogin(adminEmp);
      } else {
        triggerFailedAttempt('نام کاربری یا کلمه عبور مدیریت نادرست است. در صورت فراموشی، از کلید طلایی یا دکمه بازنشانی استفاده کنید.');
      }
    }
  };

  const triggerFailedAttempt = (msg: string) => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    logSecurityEvent('ورود ناموفق به سیستم', `تلاش ناموفق برای ورود به سیستم (مرتبه ${nextAttempts})`, 'warning');
    
    if (nextAttempts >= 4) {
      setLockoutCountdown(30);
      setErrorMsg('⚠️ به دلیل ۴ مرتبه ورود ناموفق، فرم ورود به مدت ۳۰ ثانیه جهت حفظ امنیت مسدود گردید.');
    } else {
      setErrorMsg(`${msg} (تلاش‌های ناموفق: ${nextAttempts} از ۴)`);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 text-right relative ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} dir="rtl">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.05),transparent_70%)] pointer-events-none" />

      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 md:p-8 relative overflow-hidden transition-all backdrop-blur-xl ${
        theme === 'dark' ? 'bg-slate-900/90 border-slate-800/80 shadow-teal-950/20' : 'bg-white/95 border-slate-200/90 shadow-slate-200'
      }`}>
        
        {/* Top Header Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-teal-500/20 mb-3 transform hover:scale-105 transition-transform">
            <BrainCircuit className="w-8 h-8 text-white stroke-[2]" />
          </div>
          <h1 className="text-xl font-black tracking-tight">سامانه جامع ارزیابی عملکرد و مربیگری</h1>
          <h2 className="text-sm font-bold text-teal-500 mt-1">شرکت تولیدی و صنعتی اصفهان چالاک</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            طراحی فرآیند‌محور جهت هم‌راستاسازی اهداف خروجی، توسعه شایستگی‌های شغلی و توانمندسازی پرسنل به کمک مربیگری هوشمند
          </p>
        </div>

        {/* Tab Selection */}
        <div className={`grid grid-cols-2 p-1.5 rounded-2xl border mb-5 ${
          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => { setActiveTab('users'); setErrorMsg(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ورود پرسنل و ارزیابان</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-rose-500 text-slate-50 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ورود اختصاصی مدیریت (Admin)</span>
          </button>
        </div>

        {/* Lockout Banner */}
        {lockoutCountdown > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2.5 animate-pulse">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>قفل امنیتی فعال است: {lockoutCountdown} ثانیه باقی‌مانده...</span>
          </div>
        )}

        {/* Feedback Messages */}
        {resetFeedback && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetFeedback}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold mb-4 space-y-2.5">
            <p className="leading-relaxed">{errorMsg}</p>
            {activeTab === 'admin' && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetAdminPasswordEmergency}
                  className="text-[11px] font-bold text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازنشانی رمز ادمین به پیش‌فرض (admin)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {activeTab === 'users' ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">نام کاربری یا کد پرسنلی</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={lockoutCountdown > 0}
                    placeholder="مثال: ali یا maryam یا hassan یا EMP-1001"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full border rounded-xl py-3 pr-4 pl-10 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-400">کلمه عبور</label>
                  <span className="text-[10px] text-slate-500">رمز پیش‌فرض: 123456 یا کد پرسنلی</span>
                </div>
                <div className="relative">
                  <input
                    type={showUserPass ? "text" : "password"}
                    disabled={lockoutCountdown > 0}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full border rounded-xl py-3 pr-4 pl-10 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPass(!showUserPass)}
                    className="text-slate-500 hover:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                  >
                    {showUserPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutCountdown > 0}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/15 cursor-pointer mt-2"
              >
                <span>ورود امن به سامانه اصفهان چالاک</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300/85 text-[11px] leading-relaxed mb-1">
                🔒 شما در حال ورود به پرتال اختصاصی مدیریت ارشد منابع انسانی هستید. نمرات نهایی، تعاریف معیارها، کالیبراسیون و مدیریت رمز عبور کلیه پرسنل در این پنل در دسترس هستند.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">نام کاربری مدیریت (Admin Username)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={lockoutCountdown > 0}
                    placeholder="نام کاربری پیش‌فرض: admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className={`w-full border rounded-xl py-3 pr-4 pl-10 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-mono ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-400">کلمه عبور مدیریت (Admin Password)</label>
                  <span className="text-[10px] text-rose-400/80">رمز پیش‌فرض سیستم: admin</span>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPass ? "text" : "password"}
                    required
                    disabled={lockoutCountdown > 0}
                    placeholder="کلمه عبور مدیریت..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className={`w-full border rounded-xl py-3 pr-4 pl-10 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-mono ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="text-slate-500 hover:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutCountdown > 0}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-slate-50 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/15 cursor-pointer mt-2"
              >
                <span>ورود به عنوان مدیر ارشد سیستم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </form>

        {/* Emergency Master Break-Glass Quick Access Button */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowMasterModal(true)}
            className="text-[11px] font-bold text-amber-400/90 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>کلید طلایی و بازیابی اضطراری (Master Break-Glass)</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            نسخه سازمانی امن v3.5
          </span>
        </div>

        {/* Security & System Info Footer */}
        <div className="text-center mt-3 text-[10px] text-slate-500 leading-relaxed">
          سامانه جامع مدیریت عملکرد و ارزیابی شایستگی‌های شغلی شرکت تولیدی اصفهان چالاک
        </div>
      </div>

      {/* Master Break-Glass Emergency Modal */}
      {showMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 space-y-5 shadow-2xl relative ${
            theme === 'dark' ? 'bg-slate-900 border-amber-500/40 text-slate-100' : 'bg-white border-amber-400 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-400">پروتکل کلید طلایی و بازیابی اضطراری</h3>
                  <p className="text-[10px] text-slate-400">Master Break-Glass Super Admin Recovery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMasterModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200/90 leading-relaxed space-y-1.5">
              <p className="font-bold">⚠️ موارد کاربرد کلید طلایی:</p>
              <p className="text-[11px] text-amber-300/80">
                در صورتی که کلمه عبور مدیر ارشد سیستم تغییر یافته و فراموش شده باشد یا در موارد ویژه و شرایط اضطراری کارخانه، با استفاده از اطلاعات زیر می‌توانید بلافاصله وارد سامانه شده و رمزهای جدید را بازتعریف فرمایید.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans text-[11px]">نام کاربری اضطراری:</span>
                <span className="text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">master</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans text-[11px]">کلید طلایی / کلمه عبور:</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">Chalak@2026#Master</span>
                  <button
                    type="button"
                    onClick={handleCopyMasterKey}
                    className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 rounded-lg cursor-pointer"
                    title="کپی کلید طلایی"
                  >
                    {copiedMasterKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans pt-1 border-t border-slate-900">
                <span>کلید عددی سریع (پشتیبان):</span>
                <span className="font-mono text-slate-400 font-bold">999999</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleQuickMasterLogin}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>ورود مستقیم اضطراری با کلید طلایی</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetAdminPasswordEmergency();
                  setShowMasterModal(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                بازنشانی رمز ادمین به admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
