/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Info, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Layers,
  Sparkles
} from 'lucide-react';
import { Criterion, CategoryKey, CATEGORIES } from '../types';

interface CriteriaBankProps {
  criteria: Criterion[];
  onAddCriterion: (crit: Omit<Criterion, 'id'>) => boolean;
  onUpdateCriterion: (id: string, crit: Omit<Criterion, 'id'>) => boolean;
  onDeleteCriterion: (id: string) => void;
}

// Predefined industrial competency presets for fast 1-click library loading
const PRESET_LIBRARIES = [
  {
    title: 'بسته شاخص‌های کمی سالن‌های تولید و ماشین‌کاری (KPI)',
    category: 'K' as CategoryKey,
    description: 'شاخص‌های کلیدی OEE، نرخ ضایعات، راندمان شیفت، تحقق برنامه تولید و توقفات خط',
    items: [
      { code: 'K-PRD-01', cat: 'K' as CategoryKey, name: 'درصد تحقق برنامه زمان‌بندی تولید', def: 'نسبت قطعات سالم خروجی از خط به برنامه مصوب شیفت در سامانه MES', source: 'سامانه MES کارخانه', method: 'درصد کمی (بیشتر بهتر)', dir: 'more' as const },
      { code: 'K-PRD-02', cat: 'K' as CategoryKey, name: 'اثربخشی کلی تجهیزات (OEE)', def: 'محاسبه حاصلضرب در دسترس بودن، نرخ کارایی و نرخ کیفیت ایستگاه', source: 'سیستم مانیتورینگ PLC', method: 'شاخص درصدی OEE', dir: 'more' as const },
      { code: 'K-PRD-03', cat: 'K' as CategoryKey, name: 'نرخ ضایعات قطعات حین تولید', def: 'تعداد قطعات اسقاطی نسبت به کل ورودی مواد اولیه خط', source: 'گزارش شیفت ضایعات', method: 'درصد وزنی (کمتر بهتر)', dir: 'less' as const },
      { code: 'K-PRD-04', cat: 'K' as CategoryKey, name: 'میانگین زمان توقفات اضطراری خط (MTTR)', def: 'مجموع دقایق توقف ناخواسته به علت نقص فنی یا عدم تغذیه خط', source: 'لاگ نگهداری تعمیرات', method: 'دقیقه بر شیفت (کمتر بهتر)', dir: 'less' as const }
    ]
  },
  {
    title: 'بسته شاخص‌های کنترل کیفیت و آزمایشگاه (QC / QA)',
    category: 'K' as CategoryKey,
    description: 'شامل نرخ عدم انطباق، دقت تست‌های آزمایشگاهی، کالیبراسیون ابزار و برگشتی مشتری',
    items: [
      { code: 'K-QC-01', cat: 'K' as CategoryKey, name: 'نرخ بازرسی بدون نقص فرآیندی (FTT)', def: 'درصد عبور قطعات در اولین مرحله تست کنترل کیفی بدون نیاز به دوباره‌کاری', source: 'کارتابل بازرسی کیفیت', method: 'First Time Through %', dir: 'more' as const },
      { code: 'K-QC-02', cat: 'K' as CategoryKey, name: 'شکایات کیفی مشتری یا ادعای گارانتی (PPM)', def: 'تعداد گزارش‌های عدم انطباق ارسالی از طرف مشتریان یا نمایندگی‌ها', source: 'سیستم CRM و خدمات پس از فروش', method: 'تعداد بر میلیون (کمتر بهتر)', dir: 'less' as const },
      { code: 'B-QC-01', cat: 'B' as CategoryKey, name: 'دقت در مستندسازی نتایج تست و نمونه‌برداری', def: 'رعایت کامل دستورالعمل‌های بازرسی و ثبت بی‌درنگ داده‌ها در فرمت استاندارد', source: 'ممیزی ادواری تضمین کیفیت', method: 'مقیاس ۱ تا ۵ رفتاری' }
    ]
  },
  {
    title: 'بسته شایستگی‌های ایمنی، بهداشت و ۵اس (HSE & 5S)',
    category: 'B' as CategoryKey,
    description: 'الگوهای رفتار ایمن، استفاده از PPE، ساماندهی محیط کار و اصول آراستگی صنعتی',
    items: [
      { code: 'B-HSE-01', cat: 'B' as CategoryKey, name: 'رعایت پروتکل‌های ایمنی و استفاده از لوازم حفاظت فردی', def: 'استفاده مستمر از کلاه، کفش ایمنی، دستکش عایق و عینک در محدوده کارگاه', source: 'چک‌لیست ممیزی HSE', method: 'ممیزی ۱ تا ۵ سرپرست' },
      { code: 'B-5S-01', cat: 'B' as CategoryKey, name: 'اجرای استانداردهای آراستگی محیط کار (5S)', def: 'پاکیزگی دائمی ماشین‌آلات، مرتب‌سازی ابزارآلات در محل استاندارد و تفکیک زوائد', source: 'ممیزی هفتگی ۵اس', method: 'امتیاز چک‌لیست ۵اس' },
      { code: 'B-TEAM-01', cat: 'B' as CategoryKey, name: 'روحیه کار تیمی، انتقال تجربه و آموزش همکاران جدید', def: 'مشارکت فعال در حل مسائل گروهی و آموزش تجارب فنی به نیروهای تازه جذب شده', source: 'مشاهده سرپرست و بازخورد ۳۶۰', method: 'مقیاس ۱ تا ۵ شایستگی' }
    ]
  },
  {
    title: 'بسته شایستگی‌های راه‌اندازی سریع و تنظیمات قالب (SMED)',
    category: 'K' as CategoryKey,
    description: 'زمان تعویض خط و قالب، تنظیم پارامترهای پرس و ماشین‌کاری CNC',
    items: [
      { code: 'K-SET-01', cat: 'K' as CategoryKey, name: 'زمان تعویض قالب و ستاپ خط (Setup Time)', def: 'مدت زمان از آخرین قطعه سالم تیراژ قبل تا اولین قطعه سالم تیراژ بعد', source: 'زمان‌سنجی تولید', method: 'دقیقه (کمتر بهتر)', dir: 'less' as const },
      { code: 'K-SET-02', cat: 'K' as CategoryKey, name: 'صحت تنظیم پارامترهای حرارتی و فشار هیدرولیک', def: 'تنظیم دقیق دستگاه‌ها بدون ایجاد تابیدگی یا تنش در قطعه اولیه', source: 'چک‌لیست راه‌اندازی دستگاه', method: 'نرخ انطباق پارامترها', dir: 'more' as const }
    ]
  }
];

export default function CriteriaBank({ 
  criteria, 
  onAddCriterion, 
  onUpdateCriterion, 
  onDeleteCriterion 
}: CriteriaBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryKey | 'ALL'>('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkStatusMsg, setBulkStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Form values
  const [formCode, setFormCode] = useState('');
  const [formCat, setFormCat] = useState<CategoryKey>('K');
  const [formName, setFormName] = useState('');
  const [formDef, setFormDef] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formMethod, setFormMethod] = useState('');
  const [formDir, setFormDir] = useState<'more' | 'less'>('more');
  const [errorMsg, setErrorMsg] = useState('');

  const openForm = (crit?: Criterion) => {
    if (crit) {
      setEditingId(crit.id);
      setFormCode(crit.code);
      setFormCat(crit.cat);
      setFormName(crit.name);
      setFormDef(crit.def);
      setFormSource(crit.source || '');
      setFormMethod(crit.method || '');
      setFormDir(crit.dir || 'more');
    } else {
      setEditingId(null);
      setFormCode('');
      setFormCat('K');
      setFormName('');
      setFormDef('');
      setFormSource('');
      setFormMethod('');
      setFormDir('more');
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formDef) {
      setErrorMsg('کد، نام معیار و تعریف عملیاتی الزامی هستند.');
      return;
    }

    const prefix = formCode.split('-')[0];
    if (prefix !== formCat) {
      setErrorMsg(`کد وارد شده (${formCode}) با پیشوند دسته انتخابی (${formCat}) همخوانی ندارد.`);
      return;
    }

    const payload = {
      code: formCode.trim(),
      cat: formCat,
      name: formName.trim(),
      def: formDef.trim(),
      source: formSource.trim() || undefined,
      method: formMethod.trim() || undefined,
      dir: formCat === 'K' ? formDir : undefined,
    };

    let success = false;
    if (editingId) {
      success = onUpdateCriterion(editingId, payload);
    } else {
      success = onAddCriterion(payload);
    }

    if (success) {
      setIsModalOpen(false);
    } else {
      setErrorMsg('کد معیار تکراری است یا مشکلی در ذخیره‌سازی وجود دارد.');
    }
  };

  // Bulk Import Handlers
  const handleLoadPreset = (presetItems: typeof PRESET_LIBRARIES[0]['items']) => {
    let addedCount = 0;
    presetItems.forEach(item => {
      const exists = criteria.some(c => c.code.toLowerCase() === item.code.toLowerCase());
      if (!exists) {
        const ok = onAddCriterion(item);
        if (ok) addedCount++;
      }
    });

    if (addedCount > 0) {
      setBulkStatusMsg({ text: `تعداد ${addedCount} معیار استاندارد با موفقیت به بانک شاخص‌ها افزوده شد.`, type: 'success' });
    } else {
      setBulkStatusMsg({ text: 'تمامی معیارهای این بسته از قبل در بانک شاخص‌ها وجود دارند.', type: 'info' });
    }
  };

  const handleProcessBulkText = () => {
    if (!bulkText.trim()) {
      setBulkStatusMsg({ text: 'لطفاً خطوط اطلاعات معیارها را در کادر متنی وارد کنید.', type: 'error' });
      return;
    }

    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let addedCount = 0;

    lines.forEach(line => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 3) {
        const code = parts[0]?.trim();
        const cat = (parts[1]?.trim().toUpperCase() === 'B' ? 'B' : 'K') as CategoryKey;
        const name = parts[2]?.trim();
        const def = parts[3]?.trim() || `تعریف عملیاتی سنجه ${name}`;
        const source = parts[4]?.trim() || 'سیستم اطلاعاتی کارخانه';
        const method = parts[5]?.trim() || 'سنجش دوره‌ای';
        const dir = (parts[6]?.trim() === 'less' ? 'less' : 'more') as 'more' | 'less';

        if (code && name) {
          const exists = criteria.some(c => c.code.toLowerCase() === code.toLowerCase());
          if (!exists) {
            const ok = onAddCriterion({
              code,
              cat,
              name,
              def,
              source,
              method,
              dir: cat === 'K' ? dir : undefined
            });
            if (ok) addedCount++;
          }
        }
      }
    });

    if (addedCount > 0) {
      setBulkStatusMsg({ text: `تعداد ${addedCount} معیار جدید با موفقیت به بانک اضافه شدند.`, type: 'success' });
      setBulkText('');
    } else {
      setBulkStatusMsg({ text: 'هیچ معیار جدیدی اضافه نشد. لطفاً ساختار داده‌ها را بررسی فرمایید.', type: 'error' });
    }
  };

  // Filter criteria
  const filteredCriteria = criteria.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.def.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || c.cat === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">بانک مرکزی معیارها</h1>
          <p className="text-sm text-slate-400 mt-1">
            اصل طلایی ارزیابی: <span className="text-teal-300 font-semibold">«انتخاب، نه ابداع»</span>. هر معیار با تایید کمیته ارزیابی وارد این بانک می‌شود.
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
            <span>ورود سریع و دسته‌جمعی شاخص‌ها</span>
          </button>
          
          <button
            onClick={() => openForm()}
            className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن معیار تکی</span>
          </button>
        </div>
      </div>

      {/* Info Warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-2xl flex gap-3 text-xs leading-relaxed">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">مقررات کمیته مدیریت منابع انسانی:</p>
          <p className="text-slate-300 mt-1">
            اپراتورها و سرپرستان مجاز به تعریف شاخص‌های سلیقه‌ای یا جدید نیستند. تنوع بالای سنجه‌ها منجر به انحراف ارزیابی می‌شود. معیارهای جدید حتماً باید دارای تعریف دقیق عملیاتی، فرمول اندازه‌گیری شفاف و محل ردیابی در سیستم‌های اطلاعاتی سازمان (MES/WMS/HSE) باشند.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-800/30 border border-slate-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در نام، کد یا تعریف عملیاتی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-2.5 pr-10 pl-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCat === 'ALL'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            همه معیارها ({criteria.length})
          </button>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((cat) => {
            const count = criteria.filter(c => c.cat === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCat === cat
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                {CATEGORIES[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-slate-800/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        {filteredCriteria.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-4 text-right w-20">کد</th>
                  <th className="p-4 text-right w-40">دسته معیار</th>
                  <th className="p-4 text-right">عنوان شاخص و تعریف عملیاتی</th>
                  <th className="p-4 text-center w-28">منبع داده</th>
                  <th className="p-4 text-center w-36">نحوه سنجش</th>
                  <th className="p-4 text-left w-24">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCriteria.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-teal-400 text-sm">{c.code}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        c.cat === 'K' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/10' :
                        c.cat === 'Q' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/10' :
                        c.cat === 'B' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/10' :
                        c.cat === 'S' ? 'bg-red-500/10 text-red-300 border border-red-500/10' :
                        'bg-emerald-500/10 text-emerald-300 border border-emerald-500/10'
                      }`}>
                        {CATEGORIES[c.cat]}
                      </span>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{c.name}</span>
                        {c.cat === 'K' && (
                          <span className={`text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                            c.dir === 'more' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {c.dir === 'more' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" />
                                <span>مستقیم (بیشتر بهتر)</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>معکوس (کمتر بهتر)</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] leading-relaxed max-w-xl">{c.def}</div>
                    </td>
                    <td className="p-4 text-center text-slate-400">{c.source || 'ثبت دستی'}</td>
                    <td className="p-4 text-center text-slate-400 max-w-[150px] truncate" title={c.method}>
                      {c.method || 'ممیزی سرپرست'}
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openForm(c)}
                          className="p-1.5 text-slate-400 hover:text-teal-400 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="ویرایش معیار"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (c.code === 'S-01') {
                              alert('شاخص ایمنی کارگاهی یک شاخص اجباری سازمانی است و قابل حذف نیست.');
                              return;
                            }
                            if (confirm(`آیا از حذف معیار «${c.name}» مطمئن هستید؟`)) {
                              onDeleteCriterion(c.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer ${
                            c.code === 'S-01' ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-red-400'
                          }`}
                          title="حذف معیار"
                          disabled={c.code === 'S-01'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <p className="text-base font-bold">معیاری متناسب با فیلتر یافت نشد.</p>
            <p className="text-xs">شما می‌توانید معیار جدیدی تعریف کرده یا فیلترها را ریست کنید.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
         BULK IMPORT MODAL
         ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">ورود سریع و دسته‌جمعی شاخص‌ها به بانک</h2>
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

            {/* 1-Click Preset Libraries */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>بارگذاری سریع بسته‌های استاندارد صنعتی (با یک کلیک):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_LIBRARIES.map((preset, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/30 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200">{preset.title}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {preset.items.length} سنجه
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadPreset(preset.items)}
                      className="mt-3 w-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن این بسته به بانک</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Multi-Line Paste Box */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300">
                یا چسباندن (Paste) سطرهای اکسل یا داده‌های متنی:
              </label>
              <p className="text-[11px] text-slate-500">
                فرمت خطوط (با کاما یا تب جدا شود): <code className="text-teal-400 font-mono">کد, دسته(K/B), نام معیار, شرح عملیاتی, منبع داده, سنجه, جهت(more/less)</code>
              </p>
              <textarea
                rows={4}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="K-PRD-05, K, نرخ توقف فیلترها, بررسی زمان تعویض فیلترهای هیدرولیک, واحد نگهداری تعمیرات, دقیقه در شیفت, less&#10;B-LEAD-01, B, مهارت‌های رهبری و حل مسئله, هدایت بهینه اعضای شیفت در شرایط بحرانی, مشاهده سرپرست, مقیاس ۱ تا ۵"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleProcessBulkText}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>پردازش و ثبت خطوط</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-200">
                {editingId ? 'ویرایش اطلاعات معیار بانک' : 'ثبت معیار شایستگی مصوب جدید'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">کد شاخص (پیشوند منطبق)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً K-02 یا Q-03"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">دسته طبقه‌بندی</label>
                  <select
                    value={formCat}
                    onChange={(e) => {
                      const val = e.target.value as CategoryKey;
                      setFormCat(val);
                      // Update code prefix to match category automatically
                      if (formCode.includes('-')) {
                        const parts = formCode.split('-');
                        setFormCode(`${val}-${parts[1]}`);
                      } else {
                        setFormCode(`${val}-`);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    {(Object.keys(CATEGORIES) as CategoryKey[]).map(cat => (
                      <option key={cat} value={cat}>{CATEGORIES[cat]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">نام و عنوان معیار</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: نرخ ضایعات خط تولید"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">تعریف عملیاتی (فرم اجرایی و جزئیات دقیق سنجش)</label>
                <textarea
                  required
                  placeholder="توضیح دهید اپراتور دقیقاً چه رفتاری باید نشان دهد یا چه فرمولی بابت KPI محاسبه می‌شود..."
                  value={formDef}
                  onChange={(e) => setFormDef(e.target.value)}
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">منبع استخراج داده</label>
                  <input
                    type="text"
                    placeholder="مانند: سیستم MES / تبلت QC"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">فرمول محاسباتی / سنجه</label>
                  <input
                    type="text"
                    placeholder="مانند: درصد وزنی / ممیزی رفتاری ۵ تایی"
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {formCat === 'K' && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">جهت مطلوب شاخص کمی</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="kpiDir"
                        checked={formDir === 'more'}
                        onChange={() => setFormDir('more')}
                        className="text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                      />
                      <span>⬆️ صعودی (هر چه بیشتر بهتر - مانند تولید)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="kpiDir"
                        checked={formDir === 'less'}
                        onChange={() => setFormDir('less')}
                        className="text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                      />
                      <span>⬇️ نزولی (هر چه کمتر بهتر - مانند ضایعات/توقف)</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
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
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
