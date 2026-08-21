/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  HelpCircle, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Info, 
  Save, 
  ClipboardCopy 
} from 'lucide-react';
import { Employee, Evaluation, JobProfile, Criterion, getGrade, GRADE_DETAILS } from '../types';

interface MyEvaluationProps {
  currentUser: Employee;
  evaluations: Evaluation[];
  profiles: JobProfile[];
  criteria: Criterion[];
  onUpdateEvaluation: (id: string, updatedEv: Evaluation) => void;
  onAddEvaluation: (empId: string, period: string) => void;
  theme: 'dark' | 'light';
}

export default function MyEvaluation({
  currentUser,
  evaluations,
  profiles,
  criteria,
  onUpdateEvaluation,
  onAddEvaluation,
  theme
}: MyEvaluationProps) {
  const [period] = useState('نیمه اول ۱۴۰۵');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find or create evaluation for this employee
  let userEval = evaluations.find(e => e.empId === currentUser.id && e.period === period);
  const userProfile = profiles.find(p => p.id === currentUser.profileId);

  const handleSelfScoreChange = (criterionId: string, scoreValue: number) => {
    if (!userEval) {
      // Need to initialize evaluation first
      if (!userProfile) return;
      const initialScores = userProfile.items.map(item => ({
        cid: item.cid,
        weight: item.weight,
        value: 0,
        self: item.cid === criterionId ? scoreValue : 0,
        doc: ''
      }));

      const newEval: Evaluation = {
        id: `eval-${Math.random().toString(36).substring(2, 9)}`,
        empId: currentUser.id,
        profileId: currentUser.profileId,
        period,
        status: 'draft',
        scores: initialScores,
        created: Date.now()
      };
      
      onUpdateEvaluation(newEval.id, newEval);
      return;
    }

    // Update existing evaluation scores
    const updatedScores = userEval.scores.map(s => {
      if (s.cid === criterionId) {
        return { ...s, self: scoreValue };
      }
      return s;
    });

    onUpdateEvaluation(userEval.id, { ...userEval, scores: updatedScores });
  };

  const handleSaveSelfAssessment = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const calculateOverallScore = (ev: Evaluation) => {
    const scoredItems = ev.scores.filter(s => s.value > 0);
    if (!scoredItems.length) return 0;
    const totalWeight = scoredItems.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = scoredItems.reduce((acc, curr) => acc + (curr.value * curr.weight), 0);
    const avg5 = weightedSum / totalWeight;
    return Math.round(avg5 * 20 * 10) / 10; // Out of 100
  };

  const calculateSelfScoreAvg = (ev: Evaluation) => {
    const scoredItems = ev.scores.filter(s => s.self > 0);
    if (!scoredItems.length) return 0;
    const totalWeight = scoredItems.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = scoredItems.reduce((acc, curr) => acc + (curr.self * curr.weight), 0);
    const avg5 = weightedSum / totalWeight;
    return Math.round(avg5 * 20 * 10) / 10;
  };

  if (!userProfile) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-red-400 font-bold">هیچ پروفایل شغلی فعالی برای شناسه پرسنلی شما تعریف نشده است.</p>
        <p className="text-xs text-slate-500">لطفاً جهت تخصیص پروفایل با واحد منابع انسانی تماس بگیرید.</p>
      </div>
    );
  }

  const finalScore = userEval ? calculateOverallScore(userEval) : 0;
  const selfScoreAvg = userEval ? calculateSelfScoreAvg(userEval) : 0;
  const grade = getGrade(finalScore);
  const gradeDetail = GRADE_DETAILS[grade];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Welcome & Info */}
      <div className={`p-5 rounded-3xl border flex justify-between items-center flex-wrap gap-4 ${
        theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-100">پنل خودارزیابی و کارنامه توسعه فردی</h1>
            <p className="text-xs text-slate-400 mt-1">
              همکار گرامی: <span className="text-teal-400 font-bold">{currentUser.name}</span> • سمت شغلی: <span className="font-bold">{userProfile.title}</span> • واحد: {currentUser.unit}
            </p>
          </div>
        </div>
        <div className="bg-slate-950/60 px-4 py-2 rounded-xl text-xs border border-slate-800 font-bold text-teal-400">
          دوره ارزیابی: {period}
        </div>
      </div>

      {/* Grid: Self-assessment input & Score indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: 2/3 - Self-Assessment Scoring Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200">ثبت و ویرایش خودارزیابی</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">دیدگاه خود را نسبت به عملکرد فردی در هر یک از شاخص‌ها ثبت کنید.</p>
              </div>

              <button
                onClick={handleSaveSelfAssessment}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره خودارزیابی</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>خودارزیابی شما با موفقیت در پایگاه داده اصفهان چالاک ذخیره شد. این نمرات مبنای گفتگو با سرپرست خواهد بود.</span>
              </div>
            )}

            <div className="space-y-4">
              {userProfile.items.map((item, idx) => {
                const crit = criteria.find(c => c.id === item.cid);
                if (!crit) return null;

                const currentSelfScore = userEval?.scores.find(s => s.cid === item.cid)?.self || 0;

                return (
                  <div 
                    key={item.cid}
                    className={`p-4 rounded-2xl border transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-400">
                            {crit.code}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200">{crit.name}</h4>
                          <span className="text-[10px] text-slate-500">(ضریب: {item.weight}٪)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{crit.def}</p>
                        {crit.source && (
                          <p className="text-[9px] text-slate-500 font-mono mt-1">منبع داده: {crit.source}</p>
                        )}
                      </div>

                      {/* Score Selector (1-5) */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-slate-400">خودارزیابی شما</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSelfScoreChange(item.cid, val)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all score-btn cursor-pointer ${
                                currentSelfScore === val
                                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10 font-black'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: 1/3 - Official Scorecard & AI IDP */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Official Performance Result */}
          <div className={`p-6 rounded-3xl border space-y-5 ${
            theme === 'dark' ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold text-slate-200">کارنامه نهایی رسمی</h3>
            
            {userEval && (userEval.status === 'locked' || userEval.status === 'calibrated') ? (
              <div className="space-y-4">
                <div className="text-center py-5 bg-teal-500/10 border border-teal-500/20 rounded-2xl relative overflow-hidden">
                  <span className="text-[10px] text-teal-400 block font-bold">امتیاز نهایی رسمی (مورد تایید کالیبراسیون)</span>
                  <div className="text-4xl font-black text-slate-100 mt-2 font-mono">{finalScore}٪</div>
                  
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${gradeDetail?.color}`}>
                      رتبه {grade} ({gradeDetail?.label})
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>میانگین ارزیابی شما:</span>
                    <span className="font-bold text-slate-200">{selfScoreAvg}٪</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ثبت مستندات و تفاهم:</span>
                    <span className="text-emerald-400 font-bold">نهایی و قفل‌شده</span>
                  </div>
                </div>

                {userEval.note && (
                  <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold">یادداشت توسعه‌ای سرپرست:</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed">{userEval.note}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-200 text-xs">ارزیابی شما هنوز تایید نهایی نشده است</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  پس از تکمیل نمرات توسط سرپرست و تایید در کمیته کالیبراسیون، کارنامه رسمی شما در این قسمت قفل و نمایش داده می‌شود.
                </p>
                {userEval && (
                  <div className="p-3 bg-slate-900/30 rounded-xl inline-block text-[10px] text-amber-300">
                    وضعیت پرونده: {userEval.status === 'draft' ? 'پیش‌نویس / در انتظار ارزیابی سرپرست' : 'کالیبره شده / در انتظار قفل نهایی'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: AI Smart Coaching & Action Items */}
          {userEval?.aiFeedback ? (
            <div className={`p-6 rounded-3xl border space-y-5 relative overflow-hidden ${
              theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/5 to-teal-500/5 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">مربیگری هوشمند هوش مصنوعی (IDP)</h3>
                  <p className="text-[9px] text-slate-500">برنامه رشد اختصاصی بر اساس نقاط قوت و ضعف عملکرد شما</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Strengths */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold block"> نقاط قوت عملکردی شما:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[10px]">
                    {userEval.aiFeedback.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Development areas */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold block"> زمینه‌های نیاز به توسعه:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[10px]">
                    {userEval.aiFeedback.developmentAreas.map((dev, i) => (
                      <li key={i}>{dev}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="space-y-2 pt-2 border-t border-slate-800/40">
                  <span className="text-[10px] text-indigo-400 font-bold block"> اقدامات عملی پیشنهادی (برنامه رشد):</span>
                  <div className="space-y-1.5">
                    {userEval.aiFeedback.actionItems.map((act, i) => (
                      <div key={i} className="flex gap-2 items-start bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                        <span className="w-4 h-4 bg-teal-500/20 text-teal-300 text-[9px] font-black rounded flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-[9px] text-slate-300 leading-relaxed">{act}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[9px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-indigo-300 block mb-1">خلاصه مربیگری:</span>
                  {userEval.aiFeedback.summary}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-6 rounded-3xl border text-center space-y-3 ${
              theme === 'dark' ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
            }`}>
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
              <h4 className="font-bold text-slate-200 text-xs">در انتظار تحلیل هوشمند برنامه توسعه فردی</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                پس از ثبت و نهایی‌سازی نمرات توسط سرپرست شما، هوش مصنوعی به صورت خودکار نمرات را بررسی کرده و برنامه مربیگری و رشد اختصاصی شما را فوراً تولید می‌کند.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
