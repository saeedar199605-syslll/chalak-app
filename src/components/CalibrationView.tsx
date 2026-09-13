import React from 'react';
import { Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEvaluations } from '../hooks/useEvaluations';
import { computeCalibrationStats } from '../utils/calibration';

export const CalibrationView: React.FC = () => {
  const { data: evaluations } = useEvaluations();

  const scores = (evaluations || []).map(e => ({ id: e.id, score: e.total_score }));
  const stats = computeCalibrationStats(scores);

  const targets = { A: 15, B: 25, C: 45, D: 10, E: 5 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100">کالیبراسیون و توزیع نرمال نمرات</h2>
          <p className="text-xs text-slate-400 mt-0.5">پایش توزیع اجباری، رفع خطای ارفاق سرپرستان و تشخیص داده‌های پرت (Outliers)</p>
        </div>
        {stats.isInflated ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>هشدار: تورم نمره گرید A ({stats.percentages.A}٪) فراتر از سقف مجاز ۲۵٪ است.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>توزیع نمرات در محدوده متوازن و استاندارد قرار دارد.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => {
          const actualPct = stats.percentages[grade];
          const targetPct = targets[grade];
          return (
            <div key={grade} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-sm">
                  گرید {grade}
                </span>
                <span className="text-xs font-bold text-slate-300">{stats.distribution[grade]} نفر</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>واقعی: <strong className="text-slate-100">{actualPct}٪</strong></span>
                  <span>تارگت: ~{targetPct}٪</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${actualPct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats.outliers.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>موارد مشکوک به انحراف شدید (Z-Score &gt; 2.0)</span>
          </h3>
          <div className="space-y-2">
            {stats.outliers.map(o => (
              <div key={o.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">شناسه ارزیابی: <code className="font-mono text-indigo-400">{o.id}</code></span>
                <span className="text-slate-400">نمره: <strong>{o.score}</strong></span>
                <span className="font-mono font-bold text-amber-400">Z = {o.zScore}</span>
                <span className="text-slate-400">{o.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
