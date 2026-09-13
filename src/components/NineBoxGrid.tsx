import React from 'react';
import { NINE_BOX_CONFIGS } from '../utils/nineBox';
import { useEvaluations } from '../hooks/useEvaluations';

export const NineBoxGrid: React.FC = () => {
  const { data: evaluations } = useEvaluations();

  const matrixLayout = [
    ['enigma', 'high_potential', 'star'],
    ['dilemma', 'core', 'high_performer'],
    ['underperformer', 'effective_worker', 'trusted_expert']
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-100">ماتریس ۹ خانه عملکرد و پتانسیل (9-Box Grid)</h2>
        <p className="text-xs text-slate-400 mt-0.5">دسته‌بندی پرسنل بر اساس تلفیق شایستگی‌های رفتاری-رهبری و عملکرد عملیاتی</p>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-4 border border-slate-800 rounded-3xl shadow-xl">
        {matrixLayout.flat().map((boxKey) => {
          const box = NINE_BOX_CONFIGS[boxKey];
          const employeesInBox = evaluations?.filter(e => e.nine_box_position === boxKey) || [];

          return (
            <div
              key={boxKey}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between min-h-[160px] hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${box.badgeBg}`}>
                    {box.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {employeesInBox.length} نفر
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {box.strategy}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{box.perfLabel}</span>
                <span>{box.potLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
