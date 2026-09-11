const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

// We add summary calculation inside the component before return
const summaryCode = `  const { totalBudget, avgReward, eligibleCount } = useMemo(() => {
    let total = 0;
    let count = 0;
    previewData.forEach(d => {
      if (d.finalReward > 0) {
        total += d.finalReward;
        count++;
      }
    });
    return {
      totalBudget: total,
      avgReward: count > 0 ? Math.round(total / count) : 0,
      eligibleCount: count
    };
  }, [previewData]);

  const isDark = theme === 'dark';`;

code = code.replace(/const isDark = theme === 'dark';/, summaryCode);

const analyticsUI = `            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-bold text-slate-300">انتخاب دوره ارزیابی:</label>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className={\`px-3 py-1.5 rounded-lg border text-sm focus:outline-none \${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }\`}
              >
                {availablePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={\`p-4 rounded-xl border flex flex-col gap-1 \${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}\`}>
                <span className="text-xs font-bold text-slate-400">مجموع بودجه پاداش (این دوره)</span>
                <span className="text-xl font-black text-teal-400">{new Intl.NumberFormat('fa-IR').format(totalBudget)} ریال</span>
              </div>
              <div className={\`p-4 rounded-xl border flex flex-col gap-1 \${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}\`}>
                <span className="text-xs font-bold text-slate-400">میانگین پاداش پرداختی</span>
                <span className="text-xl font-black text-blue-400">{new Intl.NumberFormat('fa-IR').format(avgReward)} ریال</span>
              </div>
              <div className={\`p-4 rounded-xl border flex flex-col gap-1 \${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}\`}>
                <span className="text-xs font-bold text-slate-400">تعداد پرسنل مشمول</span>
                <span className="text-xl font-black text-emerald-400">{new Intl.NumberFormat('fa-IR').format(eligibleCount)} نفر</span>
              </div>
            </div>`;

code = code.replace(/<div className="flex items-center gap-3 mb-4">[\s\S]*?<\/select>\n            <\/div>/, analyticsUI);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('Analytics added.');
