/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info,
  Scale
} from 'lucide-react';
import { 
  JobProfile, 
  Criterion, 
  ProfileItem, 
  MIN_WEIGHT, 
  MAX_WEIGHT, 
  MAX_CRITERIA_COUNT, 
  MANDATORY_SAFETY_CODE,
  CATEGORIES
} from '../types';

interface JobProfilesProps {
  profiles: JobProfile[];
  criteria: Criterion[];
  onAddProfile: (prof: Omit<JobProfile, 'id'>) => void;
  onUpdateProfile: (id: string, prof: Omit<JobProfile, 'id'>) => void;
  onDeleteProfile: (id: string) => void;
  onToggleLockProfile: (id: string) => void;
}

export default function JobProfiles({
  profiles,
  criteria,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  onToggleLockProfile
}: JobProfilesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form values
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formFamily, setFormFamily] = useState('');
  
  // Array of { cid: string, weight: number } for the profile
  const [selectedItems, setSelectedItems] = useState<ProfileItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to validate profile weights and requirements
  const validateProfileItems = (items: ProfileItem[]): { ok: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push(`مجموع وزن‌ها باید دقیقاً ۱۰۰٪ باشد. مجموع فعلی شما ${totalWeight}٪ است.`);
    }

    let hasSafety = false;
    items.forEach((item) => {
      const crit = criteria.find(c => c.id === item.cid);
      if (crit && crit.code === MANDATORY_SAFETY_CODE) {
        hasSafety = true;
      }
      if (item.weight < MIN_WEIGHT || item.weight > MAX_WEIGHT) {
        errors.push(`وزن معیار «${crit?.code || item.cid}» باید بین ${MIN_WEIGHT}٪ تا ${MAX_WEIGHT}٪ باشد (مقدار فعلی: ${item.weight}٪).`);
      }
    });

    if (!hasSafety) {
      errors.push(`پیوست معیار ایمنی اجباری با کد «${MANDATORY_SAFETY_CODE}» در تمامی پروفایل‌ها الزامی است.`);
    }

    if (items.length > MAX_CRITERIA_COUNT) {
      warnings.push(`تعداد معیارهای انتخابی (${items.length} شاخص) بیش از حد توصیه‌شده (${MAX_CRITERIA_COUNT} شاخص) است. شلوغی بیش از حد تمرکز فرد را کاهش می‌دهد.`);
    }

    const uniqueCategories = new Set(
      items.map(item => criteria.find(c => c.id === item.cid)?.cat).filter(Boolean)
    );
    if (uniqueCategories.size < 2) {
      errors.push('نمایه شایستگی نباید تک‌بعدی باشد. ترکیب حداقل دو بعد (مثلاً خروجی کمی و رفتارهای کیفی) الزامی است.');
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings
    };
  };

  const openForm = (prof?: JobProfile) => {
    if (prof) {
      if (prof.locked) {
        alert('این پروفایل قفل و تایید نهایی شده است. برای ویرایش، ابتدا قفل آن را باز کنید.');
        return;
      }
      setEditingId(prof.id);
      setFormTitle(prof.title);
      setFormCode(prof.code);
      setFormFamily(prof.family);
      setSelectedItems([...prof.items]);
    } else {
      setEditingId(null);
      setFormTitle('');
      setFormCode('');
      setFormFamily('');
      
      // Auto-include the mandatory Safety (S-01) with default 15% weight
      const safetyCrit = criteria.find(c => c.code === MANDATORY_SAFETY_CODE);
      if (safetyCrit) {
        setSelectedItems([{ cid: safetyCrit.id, weight: 15 }]);
      } else {
        setSelectedItems([]);
      }
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleCriterion = (cid: string) => {
    const exists = selectedItems.find(i => i.cid === cid);
    if (exists) {
      // Don't allow removing safety easily if it's the mandatory one
      const crit = criteria.find(c => c.id === cid);
      if (crit && crit.code === MANDATORY_SAFETY_CODE) {
        alert('حذف شاخص ایمنی الزامی امکان‌پذیر نیست.');
        return;
      }
      setSelectedItems(selectedItems.filter(i => i.cid !== cid));
    } else {
      setSelectedItems([...selectedItems, { cid, weight: 10 }]);
    }
  };

  const handleWeightChange = (cid: string, weight: number) => {
    setSelectedItems(
      selectedItems.map(i => i.cid === cid ? { ...i, weight } : i)
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCode) {
      setErrorMsg('وارد کردن عنوان شغل و کد الزامی است.');
      return;
    }

    const validation = validateProfileItems(selectedItems);
    if (!validation.ok) {
      setErrorMsg(validation.errors[0]); // Show first error
      return;
    }

    const payload = {
      title: formTitle.trim(),
      code: formCode.trim().toUpperCase(),
      family: formFamily.trim() || 'عمومی',
      items: selectedItems,
      locked: false
    };

    if (editingId) {
      onUpdateProfile(editingId, payload);
    } else {
      onAddProfile(payload);
    }

    setIsModalOpen(false);
  };

  const totalCurrentWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">پروفایل‌های شایستگی شغلی</h1>
          <p className="text-sm text-slate-400 mt-1">
            نگاشت اهداف کمی و کیفی متناسب با اقتضائات نقشی پرسنل • مهار سلیقه‌گرایی و تضمین عدالت ارزیابی
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد پروفایل شایستگی جدید</span>
        </button>
      </div>

      {/* Info constraints summary */}
      <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex gap-2.5">
          <Scale className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-200">مجموع ۱۰۰٪ اوزان</p>
            <p className="text-slate-400 mt-0.5">مجموع کلی اوزان هر پروفایل باید دقیقاً برابر با ۱۰۰٪ باشد تا نمره نهایی متوازن بماند.</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-200">بازه وزنی هر شاخص (۵٪ تا ۲۵٪)</p>
            <p className="text-slate-400 mt-0.5">تخصیص وزن زیر ۵٪ بی‌اثر است و بالای ۲۵٪ باعث غلبه سلیقه‌ای یک شاخص می‌شود.</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <CheckCircle2 className="پ-5 w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-200">ایمنی کارگاه الزامی است (S-01)</p>
            <p className="text-slate-400 mt-0.5">شاخص موازین HSE به عنوان فرهنگ سازمانی، پیوست غیرقابل حذف در تمامی مشاغل است.</p>
          </div>
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {profiles.map((p) => {
          const validation = validateProfileItems(p.items);
          const totalWeight = p.items.reduce((sum, item) => sum + item.weight, 0);

          return (
            <div 
              key={p.id} 
              className={`bg-slate-800/30 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${
                p.locked ? 'border-slate-800' : 'border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="space-y-3">
                {/* Profile Card Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{p.title}</h3>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                        {p.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">خانواده شغلی: {p.family} • شامل {p.items.length} شاخص ارزیابی</p>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => onToggleLockProfile(p.id)}
                      className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        p.locked 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                      title={p.locked ? 'پروفایل تصویب شده و قفل است. جهت ویرایش باز کنید.' : 'تصویب و قفل کردن پروفایل'}
                    >
                      {p.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-bold">{p.locked ? 'تصویب شده' : 'پیش‌نویس'}</span>
                    </button>

                    <button
                      onClick={() => openForm(p)}
                      disabled={p.locked}
                      className={`p-2 rounded-xl border text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all ${
                        p.locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      title="ویرایش معیارهای پروفایل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف پروفایل شغلی «${p.title}» مطمئن هستید؟`)) {
                          onDeleteProfile(p.id);
                        }
                      }}
                      disabled={p.locked}
                      className={`p-2 rounded-xl border transition-all ${
                        p.locked ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer'
                      }`}
                      title="حذف پروفایل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <hr className="border-slate-800/80" />

                {/* Items List */}
                <div className="space-y-2">
                  {p.items.map((item) => {
                    const crit = criteria.find(c => c.id === item.cid);
                    if (!crit) return null;
                    return (
                      <div key={item.cid} className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded-xl border border-slate-800/40 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                            crit.cat === 'K' ? 'bg-blue-500/10 text-blue-400' :
                            crit.cat === 'Q' ? 'bg-amber-500/10 text-amber-300' :
                            crit.cat === 'B' ? 'bg-purple-500/10 text-purple-300' :
                            crit.cat === 'S' ? 'bg-red-500/10 text-red-400' :
                            'bg-emerald-500/10 text-emerald-300'
                          }`}>
                            {crit.code}
                          </span>
                          <span className="text-slate-300 font-medium">{crit.name}</span>
                        </div>
                        <span className="font-bold text-slate-100">{item.weight}٪</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Validation Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">جمع‌کل اوزان سنجش:</span>
                  <span className={totalWeight === 100 ? 'text-emerald-400' : 'text-orange-400'}>
                    {totalWeight}٪
                  </span>
                </div>

                {validation.ok ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 px-3 py-2 rounded-xl text-[11px] flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>پروفایل کاملاً منطبق با موازین و سنجه‌های HSE و توزیع اوزان است.</span>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/10 text-red-400 px-3 py-2 rounded-xl text-[11px] flex flex-col gap-1">
                    {validation.errors.map((err, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/10 text-amber-400 px-3 py-2 rounded-xl text-[11px] flex flex-col gap-1">
                    {validation.warnings.map((warn, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {profiles.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-500 bg-slate-800/10 rounded-2xl border border-dashed border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-base font-bold">هیچ پروفایل شغلی ثبت نشده است</p>
            <p className="text-xs mt-1">با کلیک بر روی دکمه بالای صفحه، اولین الگوی شایستگی نقش را ایجاد کنید.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-slate-200">
                {editingId ? 'اصلاح و بازنگری معیارهای پروفایل' : 'تعریف پروفایل شایستگی شغلی جدید'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs flex gap-2 items-center shrink-0">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Core Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان پروفایل شغلی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثل: اپراتور سالن ماشین‌کاری"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">کد اختصاصی رده</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: B1"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">خانواده شغلی</label>
                  <input
                    type="text"
                    placeholder="مثال: فنی تولید"
                    value={formFamily}
                    onChange={(e) => setFormFamily(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Criterion Selector & Weighting list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-300">شاخص‌های ارزیابی و اوزان شایستگی</label>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                    totalCurrentWeight === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    مجموع اوزان فعلی: {totalCurrentWeight}٪ (باید دقیقاً ۱۰۰٪ باشد)
                  </span>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-800/60 bg-slate-950/40">
                  {criteria.map((c) => {
                    const matchedItem = selectedItems.find(i => i.cid === c.id);
                    const isSelected = !!matchedItem;
                    const isMandatorySafety = c.code === MANDATORY_SAFETY_CODE;

                    return (
                      <div 
                        key={c.id} 
                        className={`p-3 flex justify-between items-center transition-colors ${
                          isSelected ? 'bg-slate-800/10' : ''
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-200 select-none flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isMandatorySafety}
                            onChange={() => handleToggleCriterion(c.id)}
                            className="rounded text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700 w-4 h-4"
                          />
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            c.cat === 'K' ? 'bg-blue-500/10 text-blue-400' :
                            c.cat === 'Q' ? 'bg-amber-500/10 text-amber-300' :
                            c.cat === 'B' ? 'bg-purple-500/10 text-purple-300' :
                            c.cat === 'S' ? 'bg-red-500/10 text-red-400' :
                            'bg-emerald-500/10 text-emerald-300'
                          }`}>
                            {c.code}
                          </span>
                          <span className="truncate">{c.name}</span>
                          {isMandatorySafety && (
                            <span className="text-[9px] text-red-400 bg-red-500/10 px-1 py-0.5 rounded font-bold shrink-0">
                              الزامی HSE
                            </span>
                          )}
                        </label>

                        {isSelected && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-500 font-medium">وزن:</span>
                            <input
                              type="number"
                              min="5"
                              max="25"
                              required
                              value={matchedItem.weight}
                              onChange={(e) => handleWeightChange(c.id, parseInt(e.target.value) || 0)}
                              className="w-16 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-xs text-center text-slate-200 font-bold font-mono focus:outline-none focus:border-teal-500"
                            />
                            <span className="text-xs text-slate-400">%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ذخیره الگو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
