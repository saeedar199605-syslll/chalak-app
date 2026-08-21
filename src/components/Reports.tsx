/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  Award, 
  BarChart3, 
  Activity, 
  Building2,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { Evaluation, Employee, JobProfile, Criterion, CATEGORIES, getGrade, GRADE_DETAILS } from '../types';
import RadarChartD3, { CompetencyDimensionData } from './RadarChartD3';

interface ReportsProps {
  evaluations: Evaluation[];
  employees: Employee[];
  profiles: JobProfile[];
  criteria: Criterion[];
}

export default function Reports({
  evaluations,
  employees,
  profiles,
  criteria
}: ReportsProps) {
  // Only report evaluations that have actual scores
  const ratedEvals = evaluations.filter(ev => ev.scores.some(s => s.value > 0));

  const calculateScore = (ev: Evaluation) => {
    const scoredItems = ev.scores.filter(s => s.value > 0);
    if (!scoredItems.length) return 0;
    const totalWeight = scoredItems.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = scoredItems.reduce((acc, curr) => acc + (curr.value * curr.weight), 0);
    const avg5 = weightedSum / totalWeight;
    return Math.round(avg5 * 20 * 10) / 10;
  };

  // 1. Average score per department/unit
  const unitScores: Record<string, number[]> = {};
  ratedEvals.forEach(ev => {
    const emp = employees.find(e => e.id === ev.empId);
    if (!emp) return;
    const unitName = emp.unit || 'عمومی/نامشخص';
    if (!unitScores[unitName]) unitScores[unitName] = [];
    unitScores[unitName].push(calculateScore(ev));
  });

  const unitAverages = Object.keys(unitScores).map(unit => {
    const scores = unitScores[unit];
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return {
      unit,
      avg: Math.round(avg * 10) / 10,
      count: scores.length
    };
  });

  // 2. Average score per competency/criterion category
  const categoryScores: Record<string, { sum: number; count: number }> = {
    K: { sum: 0, count: 0 },
    Q: { sum: 0, count: 0 },
    B: { sum: 0, count: 0 },
    S: { sum: 0, count: 0 },
    L: { sum: 0, count: 0 }
  };

  ratedEvals.forEach(ev => {
    ev.scores.forEach(s => {
      if (s.value === 0) return;
      const crit = criteria.find(c => c.id === s.cid);
      if (!crit) return;
      categoryScores[crit.cat].sum += s.value;
      categoryScores[crit.cat].count += 1;
    });
  });

  const categoryAverages = Object.keys(categoryScores).map(cat => {
    const data = categoryScores[cat];
    const avg5 = data.count > 0 ? data.sum / data.count : 0;
    // Scale 1-5 to percentage (100)
    const pct = Math.round(avg5 * 20 * 10) / 10;
    return {
      cat,
      avg: pct,
      count: data.count,
      label: CATEGORIES[cat as keyof typeof CATEGORIES]
    };
  }).filter(c => c.count > 0);

  const [selectedEmpForRadar, setSelectedEmpForRadar] = useState<string>('all');

  const getRadarData = (): CompetencyDimensionData[] => {
    const targetEvals = selectedEmpForRadar === 'all'
      ? ratedEvals
      : ratedEvals.filter(e => e.empId === selectedEmpForRadar);

    const dims: {
      key: 'K' | 'Q' | 'B' | 'S' | 'L';
      label: string;
      shortLabel: string;
      sum: number;
      count: number;
      selfSum: number;
      selfCount: number;
      target: number;
    }[] = [
      { key: 'K', label: 'اهداف کمی (K)', shortLabel: 'K - کمی', sum: 0, count: 0, selfSum: 0, selfCount: 0, target: 4.2 },
      { key: 'Q', label: 'کیفیت و دقت فنی (Q)', shortLabel: 'Q - کیفی', sum: 0, count: 0, selfSum: 0, selfCount: 0, target: 4.5 },
      { key: 'B', label: 'رفتارهای سازمانی (B)', shortLabel: 'B - رفتاری', sum: 0, count: 0, selfSum: 0, selfCount: 0, target: 4.0 },
      { key: 'S', label: 'ایمنی و ۵S (S)', shortLabel: 'S - ایمنی', sum: 0, count: 0, selfSum: 0, selfCount: 0, target: 4.8 },
      { key: 'L', label: 'کار تیمی و انضباط (L)', shortLabel: 'L - رهبری', sum: 0, count: 0, selfSum: 0, selfCount: 0, target: 4.1 },
    ];

    targetEvals.forEach(ev => {
      ev.scores.forEach(s => {
        const crit = criteria.find(c => c.id === s.cid);
        if (crit) {
          const cat = crit.cat || 'K';
          const dim = dims.find(d => d.key === cat) || dims[0];
          if (s.value > 0) {
            dim.sum += s.value;
            dim.count += 1;
          }
          if (s.self && s.self > 0) {
            dim.selfSum += s.self;
            dim.selfCount += 1;
          }
        }
      });
    });

    return dims.map(d => ({
      key: d.key,
      label: d.label,
      shortLabel: d.shortLabel,
      actual: d.count > 0 ? Math.round((d.sum / d.count) * 10) / 10 : 3.8,
      target: d.target,
      self: d.selfCount > 0 ? Math.round((d.selfSum / d.selfCount) * 10) / 10 : undefined,
      description: d.label
    }));
  };

  // 3. Trigger CSV Download
  const handleExportCSV = () => {
    if (ratedEvals.length === 0) {
      alert('داده‌ای برای خروجی گرفتن موجود نیست.');
      return;
    }

    const headers = ['کارمند', 'کد پرسنلی', 'واحد سازمانی', 'پروفایل شغلی', 'دوره', 'نمره نهایی (۱۰۰)', 'رتبه عملکرد', 'وضعیت سند'];
    const rows = ratedEvals.map(ev => {
      const emp = employees.find(e => e.id === ev.empId);
      const prof = profiles.find(p => p.id === ev.profileId);
      const score = calculateScore(ev);
      const gr = getGrade(score);
      const grDetails = GRADE_DETAILS[gr];
      
      return [
        emp?.name || 'نامشخص',
        emp?.code || '',
        emp?.unit || '',
        prof?.title || '',
        ev.period,
        score.toString(),
        `${gr} (${grDetails?.label || ''})`,
        ev.status === 'locked' ? 'نهایی' : ev.status === 'calibrated' ? 'کالیبره شده' : 'پیش‌نویس'
      ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `گزارش_ارزیابی_عملکرد_${new Date().toLocaleDateString('fa-IR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">تحلیل‌ها و گزارشات سازمانی</h1>
          <p className="text-sm text-slate-400 mt-1">
            تجزیه و تحلیل نقاط قوت و ضعف دپارتمان‌ها بر مبنای طبقات شایستگی، مربیگری و موازین مصوب
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>خروجی اکسل / CSV کامل داده‌ها</span>
        </button>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Averages Gauge */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-200">میانگین امتیاز عملکرد به تفکیک دپارتمان</h3>
          </div>

          {unitAverages.length > 0 ? (
            <div className="space-y-4 pt-2">
              {unitAverages.map((item, idx) => {
                const gr = getGrade(item.avg);
                const conf = GRADE_DETAILS[gr];
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center mb-1.5 text-slate-400">
                      <span>{item.unit} <span className="text-[10px] text-slate-500">({item.count} ارزیابی)</span></span>
                      <span className="font-bold text-slate-200">{item.avg}٪ (رتبه {gr})</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900/60 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full bg-${conf.color}-500 transition-all duration-500 rounded-full`}
                        style={{ width: `${item.avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              داده‌ای جهت تحلیل دپارتمان‌ها موجود نیست. ارزیابی‌ها باید ابتدا انجام و امتیازدهی شوند.
            </div>
          )}
        </div>

        {/* Competency Categories Gauge */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">میانگین امتیاز به تفکیک ابعاد شایستگی (۱۰۰)</h3>
          </div>

          {categoryAverages.length > 0 ? (
            <div className="space-y-4 pt-2">
              {categoryAverages.map((item, idx) => {
                const score1to5 = (item.avg / 20).toFixed(1);
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center mb-1.5 text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                          item.cat === 'K' ? 'bg-blue-500/10 text-blue-300' :
                          item.cat === 'Q' ? 'bg-amber-500/10 text-amber-300' :
                          item.cat === 'B' ? 'bg-purple-500/10 text-purple-300' :
                          item.cat === 'S' ? 'bg-red-500/10 text-red-300' :
                          'bg-emerald-500/10 text-emerald-300'
                        }`}>
                          {item.cat}
                        </span>
                        <span className="font-medium text-slate-300">{item.label}</span>
                      </div>
                      <span className="font-bold text-slate-200">{item.avg}٪ (امتیاز {score1to5} از ۵)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-500 rounded-full"
                        style={{ width: `${item.avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              داده‌ای جهت تحلیل ابعاد شایستگی موجود نیست.
            </div>
          )}
        </div>

      </div>

      {/* Radar Chart 5-Dimension Competency Overview Card */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-200">نمودار عنکبوتی تعادل ۵ گانه شایستگی (D3 Radar)</h3>
              <p className="text-[11px] text-slate-400">تحلیل شکاف شایستگی میان عملکرد محقق‌شده و تارگت استاندارد تعالی</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">فیلتر پرسنل:</span>
            <select
              value={selectedEmpForRadar}
              onChange={(e) => setSelectedEmpForRadar(e.target.value)}
              className="text-xs font-bold bg-slate-900 border border-slate-700 text-teal-300 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">🏢 میانگین کل سازمان (اصفهان چالاک)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>👤 {emp.name} ({emp.unit})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
          <div className="flex justify-center">
            <RadarChartD3 
              data={getRadarData()}
              width={360}
              height={320}
              theme="dark"
            />
          </div>

          <div className="space-y-3 max-w-md text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <span>عملکرد واقعی ثبت‌شده</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                برآیند نمرات سرپرست و خودارزیابی بر اساس مقیاس ۱ تا ۵ در شاخص‌های کمی، کیفی، رفتاری، ایمنی و رهبری.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>حد آستانه و استاندارد سازمانی</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                حد مورد انتظار کارخانه جهت واجد شرایط بودن برای ارتقای رتبه و پاداش شایستگی سالانه.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Detail Results Table */}
      <div className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">کارنامه جامع ارزیابی و مربیگری سازمان</h3>

        {ratedEvals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold">
                  <th className="pb-3 text-right">نام همکار</th>
                  <th className="pb-3 text-right">کد پرسنلی</th>
                  <th className="pb-3 text-right">واحد سازمانی</th>
                  <th className="pb-3 text-right">الگوی شایستگی</th>
                  <th className="pb-3 text-center">دوره زمان</th>
                  <th className="pb-3 text-center">نمره کل</th>
                  <th className="pb-3 text-center">طبقه</th>
                  <th className="pb-3 text-center">وضعیت سند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {ratedEvals.map((ev) => {
                  const emp = employees.find(e => e.id === ev.empId);
                  const prof = profiles.find(p => p.id === ev.profileId);
                  const score = calculateScore(ev);
                  const gr = getGrade(score);
                  const grConf = GRADE_DETAILS[gr];

                  return (
                    <tr key={ev.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 font-semibold text-slate-200">{emp?.name || 'نامشخص'}</td>
                      <td className="py-3 text-slate-400 font-mono">{emp?.code}</td>
                      <td className="py-3 text-slate-400">{emp?.unit}</td>
                      <td className="py-3 text-slate-400">{prof?.title}</td>
                      <td className="py-3 text-center font-mono text-slate-400">{ev.period}</td>
                      <td className="py-3 text-center font-bold text-slate-100 text-sm">{score}٪</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${grConf.color}-500/10 text-${grConf.color}-300`}>
                          {gr} — {grConf.label}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-400">
                        {ev.status === 'locked' ? (
                          <span className="text-emerald-400 font-bold">🔒 نهایی‌شده</span>
                        ) : ev.status === 'calibrated' ? (
                          <span className="text-indigo-400 font-bold">⚖️ کالیبره</span>
                        ) : (
                          <span className="text-slate-500">✏️ پیش‌نویس</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            هیچ کارنامه‌ای برای نمایش موجود نیست. ابتدا ارزیابی‌های پرسنل را نمره‌دهی کنید.
          </div>
        )}
      </div>
    </div>
  );
}
