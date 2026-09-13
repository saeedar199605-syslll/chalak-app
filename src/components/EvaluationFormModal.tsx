import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEvaluationDetails, useUpdateScoresMutation, useGenerateCoachingMutation } from '../hooks/useEvaluations';
import { calculateWeightedScore, NEED_DOCUMENT_SCORES } from '../utils/scoring';

interface EvaluationFormModalProps {
  evaluationId: string;
  onClose: () => void;
}

export const EvaluationFormModal: React.FC<EvaluationFormModalProps> = ({ evaluationId, onClose }) => {
  const { data: ev, isLoading } = useEvaluationDetails(evaluationId);
  const updateMutation = useUpdateScoresMutation();
  const coachingMutation = useGenerateCoachingMutation();

  const [scores, setScores] = useState<any[]>([]);
  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    if (ev?.scores) {
      setScores(ev.scores);
    }
  }, [ev]);

  if (isLoading || !ev) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-slate-300 text-sm">
          در حال بارگذاری اطلاعات ارزیابی...
        </div>
      </div>
    );
  }

  const calcResult = calculateWeightedScore(scores.map(s => ({
    cid: s.criterion_id,
    weight: Number(s.weight),
    value: Number(s.manager_score ?? 0),
    self: Number(s.self_score ?? 0),
    category: s.criterion_category,
    code: s.criterion_code,
    doc: s.evidence
  })));

  const handleScoreChange = (idx: number, field: 'manager_score' | 'self_score' | 'evidence', val: any) => {
    const updated = [...scores];
    updated[idx] = { ...updated[idx], [field]: val };
    setScores(updated);
  };

  const handleSave = async () => {
    setConflictError(null);
    try {
      await updateMutation.mutateAsync({
        id: ev.id,
        version: ev.version,
        scores
      });
      onClose();
    } catch (err: any) {
      if (err.code === 'CONFLICT') {
        setConflictError('این رکورد در لحظات اخیر توسط کاربر دیگری ذخیره شده است. صفحه را رفرش کنید.');
      } else {
        setConflictError(err.message || 'خطا در ثبت نمرات.');
      }
    }
  };

  const handleCoaching = async () => {
    try {
      await coachingMutation.mutateAsync(ev.id);
    } catch (err: any) {
      alert(err.message || 'خطا در فراخوانی مدل کوچینگ Gemini');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-100">
              فرم ارزیابی عملکرد: {ev.first_name} {ev.last_name} ({ev.personnel_code})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              پروفایل: {ev.profile_title} | نسخه دیتابیس D1: {ev.version}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {conflictError && (
          <div className="m-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{conflictError}</span>
          </div>
        )}

        {/* Scoring Items Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-400">نمره کل محاسباتی:</span>
              <div className="text-2xl font-black text-slate-100 mt-1">{calcResult.totalScore} از ۱۰۰</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">رتبه کیفی:</span>
              <div className="text-xl font-black text-indigo-400 mt-1">گرید {calcResult.grade}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">جایگاه ۹-Box:</span>
              <div className="text-sm font-bold text-emerald-400 mt-2">{calcResult.nineBoxPosition}</div>
            </div>
          </div>

          <div className="space-y-4">
            {scores.map((s, idx) => {
              const isBoundary = NEED_DOCUMENT_SCORES.includes(Math.round(s.manager_score));
              const needsDoc = isBoundary && (!s.evidence || s.evidence.trim().length < 5);

              return (
                <div key={s.criterion_id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {s.criterion_code}
                      </span>
                      <span className="text-sm font-bold text-slate-200">{s.criterion_title}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      وزن شاخص: <strong className="text-slate-200">{s.weight}٪</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400">نمره سرپرست (۱ تا ۵):</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={s.manager_score || ''}
                        onChange={(e) => handleScoreChange(idx, 'manager_score', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-center text-sm outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400">خودارزیابی کارمند:</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={s.self_score || ''}
                        onChange={(e) => handleScoreChange(idx, 'self_score', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 font-bold text-center text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      مستندات و شواهد عینی عملکرد {isBoundary && <span className="text-amber-400">(الزامی برای نمرات ۱، ۲ و ۵)</span>}:
                    </label>
                    <input
                      type="text"
                      value={s.evidence || ''}
                      onChange={(e) => handleScoreChange(idx, 'evidence', e.target.value)}
                      placeholder="مثال: شماره گزارش MES یا لاگ QC ثبت‌شده در سامانه..."
                      className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-xs text-slate-200 outline-none ${
                        needsDoc ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-slate-900/90">
          <button
            onClick={handleCoaching}
            disabled={coachingMutation.isPending}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{coachingMutation.isPending ? 'در حال تولید تحلیل Gemini...' : 'تولید برنامه کوچینگ هوشمند (Gemini)'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200">
              انصراف
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{updateMutation.isPending ? 'در حال ذخیره در D1...' : 'ذخیره قطعی نمرات'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
