/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Lightbulb, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight,
  Target,
  ArrowUpRight,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Evaluation, Employee, JobProfile, Criterion, getGrade } from '../types';

interface NineBoxAIAnalysisProps {
  evaluations: Evaluation[];
  employees: Employee[];
  profiles: JobProfile[];
  criteria: Criterion[];
}

export interface NineBoxResult {
  executiveSummary: string;
  talentHealthScore: number;
  boxRecommendations: {
    boxId: string;
    boxTitle: string;
    headcount: number;
    strategicGuidance: string;
    individualCoachingTips: string[];
    recommendedActions: string[];
  }[];
  successionAndRetention: string[];
  riskInterventions: string[];
  isFallback?: boolean;
}

export const NineBoxAIAnalysis: React.FC<NineBoxAIAnalysisProps> = ({
  evaluations,
  employees,
  profiles,
  criteria
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NineBoxResult | null>(null);
  const [activeBoxTab, setActiveBoxTab] = useState<string>('star');

  // Compute 9-Box mapping for employees
  const ratedEvals = evaluations.filter(e => e.scores.some(s => s.value > 0));

  // Box definitions
  const BOX_CONFIGS = [
    // Row 1: High Potential
    { id: 'enigma', row: 0, col: 0, title: 'معما / پتانسیل کشف‌نشده (Enigma)', perfLabel: 'پایین', potLabel: 'بالا', color: 'amber', bg: 'bg-amber-950/20 border-amber-500/30' },
    { id: 'high_potential', row: 0, col: 1, title: 'ستاره در حال رشد (Growth Star)', perfLabel: 'متوسط', potLabel: 'بالا', color: 'teal', bg: 'bg-teal-950/20 border-teal-500/30' },
    { id: 'star', row: 0, col: 2, title: 'ستارگان برتر سازمان (Super Star)', perfLabel: 'عالی', potLabel: 'بالا', color: 'emerald', bg: 'bg-emerald-950/30 border-emerald-500/40' },
    
    // Row 2: Medium Potential
    { id: 'dilemma', row: 1, col: 0, title: 'نیروی پرریسک / مشروط (Dilemma)', perfLabel: 'پایین', potLabel: 'متوسط', color: 'rose', bg: 'bg-rose-950/20 border-rose-500/30' },
    { id: 'core', row: 1, col: 1, title: 'ستون‌های اصلی سازمان (Core Player)', perfLabel: 'متوسط', potLabel: 'متوسط', color: 'blue', bg: 'bg-blue-950/20 border-blue-500/30' },
    { id: 'high_performer', row: 1, col: 2, title: 'متخصصین با عملکرد عالی (High Performer)', perfLabel: 'عالی', potLabel: 'متوسط', color: 'cyan', bg: 'bg-cyan-950/20 border-cyan-500/30' },
    
    // Row 3: Low Potential
    { id: 'underperformer', row: 2, col: 0, title: 'نیازمند بهبود فوری / خطر (Risk / Underperformer)', perfLabel: 'پایین', potLabel: 'پایین', color: 'red', bg: 'bg-red-950/30 border-red-500/40' },
    { id: 'effective_worker', row: 2, col: 1, title: 'مجری باثبات / وظیفه‌شناس (Effective)', perfLabel: 'متوسط', potLabel: 'پایین', color: 'slate', bg: 'bg-slate-900 border-slate-700/50' },
    { id: 'trusted_expert', row: 2, col: 2, title: 'استادکار / کارشناس خبره (Trusted Master)', perfLabel: 'عالی', potLabel: 'پایین', color: 'indigo', bg: 'bg-indigo-950/20 border-indigo-500/30' },
  ];

  // Map each employee to a box
  const getEmployeeBoxData = () => {
    const boxMap: Record<string, { emp: Employee; eval: Evaluation; score: number; potentialScore: number; jobTitle: string }[]> = {};
    BOX_CONFIGS.forEach(b => {
      boxMap[b.id] = [];
    });

    ratedEvals.forEach(ev => {
      const emp = employees.find(e => e.id === ev.empId);
      if (!emp) return;
      const prof = profiles.find(p => p.id === emp.profileId);

      // Calculate performance score (0 - 100)
      const validScores = ev.scores.filter(s => s.value > 0);
      const avgScore = validScores.length > 0
        ? (validScores.reduce((sum, s) => sum + s.value, 0) / validScores.length) * 20
        : 60;

      // Calculate potential score based on behavioral (B) and leadership/team (L)
      const potentialScores = ev.scores.filter(s => {
        const c = criteria.find(cr => cr.id === s.cid);
        return c && (c.cat === 'B' || c.cat === 'L' || (c.code || '').startsWith('B') || (c.code || '').startsWith('L'));
      });
      const potentialAvg = potentialScores.length > 0
        ? (potentialScores.reduce((sum, s) => sum + s.value, 0) / potentialScores.length) * 20
        : (avgScore * 0.95);

      // Determine Performance Bucket (Low < 65, Medium 65-82, High >= 83)
      let perfBucket: 'low' | 'med' | 'high' = 'med';
      if (avgScore >= 83) perfBucket = 'high';
      else if (avgScore < 65) perfBucket = 'low';

      // Determine Potential Bucket (Low < 65, Medium 65-82, High >= 83)
      let potBucket: 'low' | 'med' | 'high' = 'med';
      if (potentialAvg >= 82) potBucket = 'high';
      else if (potentialAvg < 65) potBucket = 'low';

      // Map to box ID
      let assignedBox = 'core';
      if (potBucket === 'high' && perfBucket === 'high') assignedBox = 'star';
      else if (potBucket === 'high' && perfBucket === 'med') assignedBox = 'high_potential';
      else if (potBucket === 'high' && perfBucket === 'low') assignedBox = 'enigma';
      else if (potBucket === 'med' && perfBucket === 'high') assignedBox = 'high_performer';
      else if (potBucket === 'med' && perfBucket === 'med') assignedBox = 'core';
      else if (potBucket === 'med' && perfBucket === 'low') assignedBox = 'dilemma';
      else if (potBucket === 'low' && perfBucket === 'high') assignedBox = 'trusted_expert';
      else if (potBucket === 'low' && perfBucket === 'med') assignedBox = 'effective_worker';
      else if (potBucket === 'low' && perfBucket === 'low') assignedBox = 'underperformer';

      boxMap[assignedBox].push({
        emp,
        eval: ev,
        score: Math.round(avgScore),
        potentialScore: Math.round(potentialAvg),
        jobTitle: prof?.title || 'عنوان شغلی'
      });
    });

    return boxMap;
  };

  const boxMapping = getEmployeeBoxData();

  const handleRunAIAnalysis = async () => {
    setLoading(true);
    try {
      const summaryPayload = BOX_CONFIGS.map(b => ({
        boxId: b.id,
        boxTitle: b.title,
        performanceLevel: b.perfLabel,
        potentialLevel: b.potLabel,
        headcount: boxMapping[b.id].length,
        employees: boxMapping[b.id].map(item => ({
          name: item.emp.name,
          unit: item.emp.unit,
          jobTitle: item.jobTitle,
          performanceScore: item.score,
          potentialScore: item.potentialScore
        }))
      }));

      const res = await fetch('/api/gemini/nine-box-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxesSummary: summaryPayload,
          totalHeadcount: ratedEvals.length,
          period: 'سال ۱۴۰۵'
        })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('9-Box AI analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and AI Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100">ماتریس ۹ خانه‌ای استعداد و تحلیل هوشمند (9-Box Grid)</h2>
              <p className="text-xs text-indigo-300 mt-0.5">ترسیم همزمان عملکرد فعلی در برابر پتانسیل رشد سازمانی همراه با مربیگری Gemini AI</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            این ماتریس استاندارد بین‌المللی، پرسنل را در ۹ بخش استراتژیک موقعیت‌یابی کرده و با اتکا به مدل زبانی، برنامه‌های ارتقا، مربیگری و جانشین‌پروری تفکیکی ارائه می‌دهد.
          </p>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-slate-100 font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/20 shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
              <span>در حال پردازش هوشمند ماتریس با هوش مصنوعی...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تحلیل ماتریس ۹ خانه با Gemini AI</span>
            </>
          )}
        </button>
      </div>

      {/* 9-BOX VISUAL GRID */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Target className="w-4 h-4 text-teal-400" />
            <span>جانمایی زنده پرسنل در ماتریس ۹ تایی کارخانه ({ratedEvals.length} پرونده فعال)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ستارگان و پتانسیل بالا</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> هسته باثبات</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> نیازمند مربیگری و بهبود</span>
          </div>
        </div>

        {/* The 3x3 Grid with Axes */}
        <div className="relative pt-6 pr-8">
          {/* Y Axis Label (Potential) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>پتانسیل و شایستگی رهبری ➔</span>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            {BOX_CONFIGS.map(box => {
              const empsInBox = boxMapping[box.id] || [];
              const isSelected = activeBoxTab === box.id;

              return (
                <div
                  key={box.id}
                  onClick={() => setActiveBoxTab(box.id)}
                  className={`min-h-[140px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    box.bg
                  } ${isSelected ? 'ring-2 ring-teal-400 shadow-lg' : 'hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{box.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">عملکرد: {box.perfLabel} • پتانسیل: {box.potLabel}</p>
                    </div>
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-800 text-teal-300">
                      {empsInBox.length} نفر
                    </span>
                  </div>

                  {/* Avatars / Names inside this Box */}
                  <div className="mt-3 flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                    {empsInBox.length > 0 ? (
                      empsInBox.map((item, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-200 flex items-center gap-1.5"
                          title={`${item.emp.name} (${item.jobTitle}) - نمره: ${item.score}٪`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          <span className="font-medium truncate max-w-[90px]">{item.emp.name}</span>
                          <span className="font-mono text-[9px] text-slate-400">{item.score}٪</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-600 italic py-2">موردی ثبت نشده</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X Axis Label (Performance) */}
          <div className="text-center pt-3 text-xs font-bold text-teal-400 flex items-center justify-center gap-1.5">
            <span>عملکرد محقق‌شده و کارایی شغلی ➔</span>
            <ArrowUpRight className="w-3.5 h-3.5 rotate-45" />
          </div>
        </div>
      </div>

      {/* GEMINI AI DEEP STRATEGIC REPORT */}
      {analysisResult && (
        <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100">گزارش راهبردی و مربیگری هوشمند ماتریس استعداد (Gemini AI)</h3>
                <p className="text-[11px] text-slate-400">تحلیل عمیق سبد انسانی و توصیه‌های مربیگری به تفکیک دسته‌های شغلی</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-900/80 border border-slate-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                <span className="text-slate-400">شاخص سلامت سبد استعداد:</span>
                <span className="font-mono font-black text-teal-400 text-sm">{analysisResult.talentHealthScore} از ۱۰۰</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Quote */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed space-y-1.5">
            <p className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>خلاصه مدیریتی مشاور ارشد منابع انسانی:</span>
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {analysisResult.executiveSummary}
            </p>
          </div>

          {/* Detailed Box-by-Box Recommendations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>توصیه‌های مربیگری و برنامه توسعه به تفکیک دسته‌های ماتریس ۹ تایی:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.boxRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      {rec.boxTitle}
                    </h5>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {rec.headcount} پرسنل
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-teal-400">راهبرد مدیریتی: </strong>
                    {rec.strategicGuidance}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">توصیه‌های مربیگری فردی (Coaching Tips):</span>
                    <ul className="text-[10px] text-slate-300 space-y-1 pr-3 list-disc list-inside">
                      {rec.individualCoachingTips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold text-indigo-400">اقدامات سازمانی پیشنهادی:</span>
                    <ul className="text-[10px] text-slate-300 space-y-1 pr-3 list-disc list-inside">
                      {rec.recommendedActions.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Succession and Risk Interventions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Award className="w-4 h-4" />
                <span>برنامه جانشین‌پروری و حفظ نخبگان (Retention & Succession)</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pr-3 list-disc list-inside">
                {analysisResult.successionAndRetention.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>برنامه بهبود عملکرد و مدیریت ریسک افت (Risk Mitigation & PIP)</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pr-3 list-disc list-inside">
                {analysisResult.riskInterventions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NineBoxAIAnalysis;
