import React, { useState } from 'react';
import { ClipboardCheck, Sparkles, AlertTriangle, Eye, CheckCircle2, Lock } from 'lucide-react';
import { useEvaluations } from '../hooks/useEvaluations';
import { NINE_BOX_CONFIGS } from '../utils/nineBox';

interface EvaluationsListProps {
  onSelectEvaluation: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const EvaluationsList: React.FC<EvaluationsListProps> = ({
  onSelectEvaluation,
  onOpenCreateModal
}) => {
  const [selectedCycle, setSelectedCycle] = useState('دوره بهار ۱۴۰۳');
  const { data: evaluations, isLoading, error } = useEvaluations(selectedCycle);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100">ارزیابی‌های عملکرد پرسنل</h2>
          <p className="text-xs text-slate-400 mt-0.5">مشاهده، ثبت نمرات، کنترل اوزان و تولید برنامه کوچینگ هوشمند</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none"
          >
            <option value="دوره بهار ۱۴۰۳">دوره بهار ۱۴۰۳</option>
            <option value="دوره تابستان ۱۴۰۳">دوره تابستان ۱۴۰۳</option>
            <option value="دوره پاییز ۱۴۰۲">دوره پاییز ۱۴۰۲</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">در حال بارگذاری ارزیابی‌ها از Cloudflare D1...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          خطا در دریافت لیست ارزیابی‌ها: {(error as any).message}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-800/40 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">نام همکار</th>
                  <th className="p-4">کد پرسنلی</th>
                  <th className="p-4">واحد سازمانی</th>
                  <th className="p-4">پروفایل شغلی</th>
                  <th className="p-4 text-center">امتیاز کل (از ۱۰۰)</th>
                  <th className="p-4 text-center">جایگاه در ۹-Box</th>
                  <th className="p-4 text-center">وضعیت</th>
                  <th className="p-4 text-left">اقدامات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {evaluations?.map((ev) => {
                  const box = NINE_BOX_CONFIGS[ev.nine_box_position] || NINE_BOX_CONFIGS.core;
                  return (
                    <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-slate-100">{ev.first_name} {ev.last_name}</td>
                      <td className="p-4 font-mono text-slate-400">{ev.personnel_code}</td>
                      <td className="p-4 text-slate-300">{ev.unit}</td>
                      <td className="p-4 text-slate-300">{ev.profile_title}</td>
                      <td className="p-4 text-center font-black text-slate-100 text-sm">
                        {ev.total_score}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${box.badgeBg}`}>
                          {box.title}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.status === 'locked' ? 'bg-slate-800 text-slate-300' :
                          ev.status === 'calibrated' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {ev.status === 'locked' ? 'نهایی و قفل‌شده' :
                           ev.status === 'calibrated' ? 'کالیبره‌شده' : 'پیش‌نویس'}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <button
                          onClick={() => onSelectEvaluation(ev.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده و نمره‌دهی</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
