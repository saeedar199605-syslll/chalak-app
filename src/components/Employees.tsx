/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ClipboardPlus, 
  Building2, 
  UserCheck, 
  Key, 
  ShieldAlert,
  UploadCloud,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Employee, JobProfile, UserRole } from '../types';

interface EmployeesProps {
  employees: Employee[];
  profiles: JobProfile[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (id: string, emp: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
  onStartEvaluation: (empId: string) => void;
}

// Predefined workshop rosters for fast 1-click batch team importing
const PRESET_ROSTERS = [
  {
    title: 'تیم تکمیلی سالن ماشین‌کاری و CNC',
    unit: 'سالن ماشین‌کاری ۱',
    description: 'شامل ۳ اپراتور ارشد تراشکاری، فرزکاری و ستاپ دستگاه‌های چندمحوره',
    members: [
      { code: 'EMP-1006', name: 'مهندس سعید میرزایی', unit: 'سالن ماشین‌کاری ۱', role: 'employee' as UserRole, username: 'saeed' },
      { code: 'EMP-1007', name: 'جناب آقای مجید نوری', unit: 'سالن ماشین‌کاری ۱', role: 'employee' as UserRole, username: 'majid' },
      { code: 'EMP-1008', name: 'مهندس کامران صباغی', unit: 'سالن ماشین‌کاری ۱', role: 'supervisor' as UserRole, username: 'kamran' }
    ]
  },
  {
    title: 'تیم ایستگاه‌های مونتاژ و بسته‌بندی نهایی',
    unit: 'سالن مونتاژ و بسته‌بندی',
    description: 'اپراتورهای خطوط مکانیزه مونتاژ، پرچ‌کاری و تست پایانی',
    members: [
      { code: 'EMP-1009', name: 'سرکار خانم زهرا موسوی', unit: 'سالن مونتاژ و بسته‌بندی', role: 'employee' as UserRole, username: 'zahra' },
      { code: 'EMP-1010', name: 'جناب آقای حسین توکلی', unit: 'سالن مونتاژ و بسته‌بندی', role: 'employee' as UserRole, username: 'hossein' }
    ]
  },
  {
    title: 'تیم آزمایشگاه کالیبراسیون و کنترل کیفی (QC)',
    unit: 'واحد کنترل کیفیت و آزمایشگاه',
    description: 'کارشناسان تست‌های ابعادی، متالوژی و تضمین کیفیت فرآیند',
    members: [
      { code: 'EMP-1011', name: 'سرکار خانم الناز بهرامی', unit: 'واحد کنترل کیفیت و آزمایشگاه', role: 'employee' as UserRole, username: 'elnaz' },
      { code: 'EMP-1012', name: 'مهندس پیمان رستمی', unit: 'واحد کنترل کیفیت و آزمایشگاه', role: 'supervisor' as UserRole, username: 'peyman' }
    ]
  }
];

export default function Employees({
  employees,
  profiles,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onStartEvaluation
}: EmployeesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkStatusMsg, setBulkStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form values
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formProfileId, setFormProfileId] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('employee');
  const [formUsername, setFormUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openForm = (emp?: Employee) => {
    if (emp) {
      setEditingId(emp.id);
      setFormName(emp.name);
      setFormCode(emp.code);
      setFormUnit(emp.unit);
      setFormProfileId(emp.profileId);
      setFormRole(emp.role || 'employee');
      setFormUsername(emp.username || '');
    } else {
      setEditingId(null);
      setFormName('');
      setFormCode('');
      setFormUnit('');
      setFormProfileId(profiles[0]?.id || '');
      setFormRole('employee');
      setFormUsername('');
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCode || !formUnit || !formProfileId || !formUsername) {
      setErrorMsg('تکمیل تمامی فیلدها از جمله نام کاربری الزامی است.');
      return;
    }

    const cleanedUsername = formUsername.trim().toLowerCase();

    // Check duplicate username (except current editing user)
    const isDuplicateUser = employees.some(
      emp => emp.username.toLowerCase() === cleanedUsername && emp.id !== editingId
    );

    if (isDuplicateUser) {
      setErrorMsg('این نام کاربری قبلاً توسط همکار دیگری ثبت شده است.');
      return;
    }

    const payload: Omit<Employee, 'id'> = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      unit: formUnit.trim(),
      profileId: formProfileId,
      role: formRole,
      username: cleanedUsername
    };

    if (editingId) {
      onUpdateEmployee(editingId, payload);
    } else {
      onAddEmployee(payload);
    }

    setIsModalOpen(false);
  };

  // Bulk Import Handlers
  const handleLoadRoster = (members: typeof PRESET_ROSTERS[0]['members'], defaultUnit: string) => {
    let addedCount = 0;
    const defaultProfId = profiles[0]?.id || 'prof-1';

    members.forEach(member => {
      const existsCode = employees.some(e => e.code.toUpperCase() === member.code.toUpperCase());
      const existsUser = employees.some(e => e.username.toLowerCase() === member.username.toLowerCase());
      
      if (!existsCode && !existsUser) {
        onAddEmployee({
          name: member.name,
          code: member.code,
          unit: member.unit || defaultUnit,
          profileId: defaultProfId,
          role: member.role,
          username: member.username
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setBulkStatusMsg({ text: `تعداد ${addedCount} همکار با موفقیت به فهرست پرسنل اضافه شدند.`, type: 'success' });
    } else {
      setBulkStatusMsg({ text: 'تمامی پرسنل این تیم قبلاً در سیستم ثبت شده‌اند.', type: 'info' });
    }
  };

  const handleProcessBulkEmployees = () => {
    if (!bulkText.trim()) {
      setBulkStatusMsg({ text: 'لطفاً اطلاعات پرسنل را در کادر متنی وارد فرمایید.', type: 'error' });
      return;
    }

    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let addedCount = 0;
    const defaultProfId = profiles[0]?.id || 'prof-1';

    lines.forEach(line => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const code = parts[0]?.trim().toUpperCase();
        const name = parts[1]?.trim();
        const unit = parts[2]?.trim() || 'سالن تولید';
        const role = (parts[3]?.trim().toLowerCase() === 'supervisor' || parts[3]?.trim().toLowerCase() === 'سرپرست' ? 'supervisor' : parts[3]?.trim().toLowerCase() === 'admin' ? 'admin' : 'employee') as UserRole;
        const username = (parts[4]?.trim().toLowerCase() || `user_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`);

        if (code && name) {
          const existsCode = employees.some(e => e.code.toUpperCase() === code);
          const existsUser = employees.some(e => e.username.toLowerCase() === username);

          if (!existsCode && !existsUser) {
            onAddEmployee({
              name,
              code,
              unit,
              profileId: defaultProfId,
              role,
              username
            });
            addedCount++;
          }
        }
      }
    });

    if (addedCount > 0) {
      setBulkStatusMsg({ text: `تعداد ${addedCount} پرونده پرسنلی جدید با موفقیت ایجاد گردید.`, type: 'success' });
      setBulkText('');
    } else {
      setBulkStatusMsg({ text: 'هیچ پرسنل جدیدی ثبت نشد. کدهای تکراری یا فرمت ورودی را بررسی نمایید.', type: 'error' });
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const profile = profiles.find(p => p.id === emp.profileId);
    return emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           emp.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
           emp.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (profile?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (emp.role || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'supervisor': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'employee': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'مدیر منابع انسانی';
      case 'supervisor': return 'سرپرست خط';
      case 'employee': return 'کارمند کارگاه';
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">مدیریت پرسنل</h1>
          <p className="text-sm text-slate-400 mt-1">
            ثبت اطلاعات همکاران، تعریف و تغییر نقش‌های دسترسی (RBAC) و تخصیص پروفایل‌های شایستگی اصفهان چالاک
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setBulkStatusMsg(null);
              setIsBulkModalOpen(true);
            }}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>ورود سریع و دسته‌جمعی پرسنل</span>
          </button>
          
          <button
            onClick={() => openForm()}
            className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن همکار جدید</span>
          </button>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="bg-slate-800/30 border border-slate-800/60 p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در نام، کد پرسنلی، واحد یا نقش دسترسی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-2.5 pr-10 pl-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Employees Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const profile = profiles.find(p => p.id === emp.profileId);
          return (
            <div 
              key={emp.id} 
              className="bg-slate-800/20 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Employee Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-teal-400">
                      {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{emp.name}</h3>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${getRoleBadgeColor(emp.role)}`}>
                          {getRoleLabel(emp.role)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.code} • username: <span className="text-teal-400">{emp.username}</span></p>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openForm(emp)}
                      className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                      title="ویرایش پرونده"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف پرونده پرسنلی «${emp.name}» مطمئن هستید؟`)) {
                          onDeleteEmployee(emp.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                      title="حذف پرسنل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <hr className="border-slate-800/60" />

                {/* Details list */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>واحد سازمانی:</span>
                    <span className="text-slate-200 font-semibold">{emp.unit}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>الگوی شایستگی متناظر:</span>
                    <span className="text-teal-400 font-bold">
                      {profile ? `${profile.title} (${profile.code})` : 'بدون انتساب'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Eval Action */}
              <div className="mt-5 pt-3 border-t border-slate-800/60">
                <button
                  onClick={() => onStartEvaluation(emp.id)}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ClipboardPlus className="w-4 h-4 text-teal-400" />
                  <span>راه‌اندازی ارزیابی دوره جدید</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-800/10 rounded-2xl border border-dashed border-slate-800">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-base font-bold">همکاری با این مشخصات یافت نشد</p>
            <p className="text-xs mt-1">پرونده پرسنل را اضافه کنید یا فیلترهای جستجو را بازبینی کنید.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
         BULK IMPORT EMPLOYEES MODAL
         ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">ورود سریع و دسته‌جمعی پرسنل به سازمان</h2>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bulkStatusMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                bulkStatusMsg.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : bulkStatusMsg.type === 'error'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bulkStatusMsg.text}</span>
              </div>
            )}

            {/* 1-Click Preset Roster Batches */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>درج دسته‌جمعی تیم‌های کارگاهی و ستادی پیش‌فرض (با ۱ کلیک):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRESET_ROSTERS.map((roster, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/30 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200 line-clamp-1">{roster.title}</span>
                      </div>
                      <span className="text-[9px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded inline-block mb-1">
                        {roster.unit}
                      </span>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {roster.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadRoster(roster.members, roster.unit)}
                      className="mt-3 w-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت اعضای این تیم</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Multi-Line Paste Box */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300">
                یا چسباندن (Paste) سطرهای اکسل یا داده‌های متنی پرسنل:
              </label>
              <p className="text-[11px] text-slate-500">
                فرمت خطوط (با کاما یا تب جدا شود): <code className="text-teal-400 font-mono">کد پرسنلی, نام و نام خانوادگی, واحد سازمانی, نقش(employee/supervisor), نام‌کاربری</code>
              </p>
              <textarea
                rows={4}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="EMP-1020, مهندس آرش صادقی, سالن تراشکاری CNC, supervisor, arash&#10;EMP-1021, جناب آقای بهنام کاظمی, سالن مونتاژ ۲, employee, behnam"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleProcessBulkEmployees}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>ثبت پرسنل از متن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-right" dir="rtl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-200">
                {editingId ? 'ویرایش پرونده همکار' : 'ایجاد پرونده پرسنلی جدید'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رضا صادقی"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">کد پرسنلی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: EMP-1011"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">واحد سازمانی / بخش کارگاه</label>
                  <input
                    type="text"
                    required
                    placeholder="مثل: سالن پرس یا کنترل ابزار"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الگوی شایستگی متناظر شغلی</label>
                  <select
                    value={formProfileId}
                    onChange={(e) => setFormProfileId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 text-right"
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NEW FIELDS: Username & Role */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">نام کاربری ورود (به انگلیسی)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: amiri"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">نقش و سطح دسترسی سازمانی</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 text-right"
                  >
                    <option value="admin">مدیر منابع انسانی (دسترسی کل)</option>
                    <option value="supervisor">سرپرست خط (ارزیابی پرسنل خط)</option>
                    <option value="employee">اپراتور کارگاه (مشاهده کارنامه و خودارزیابی)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ذخیره پرونده
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
