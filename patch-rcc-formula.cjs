const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

// 1. Add evaluateFormula function
if (!code.includes('evaluateFormula')) {
  const evaluateFunc = `
const evaluateFormula = (formula: string, variables: Record<string, number>) => {
  try {
    const keys = Object.keys(variables);
    const values = Object.values(variables);
    const func = new Function(...keys, \`return \${formula};\`);
    return Number(func(...values)) || 0;
  } catch (e) {
    return 0;
  }
};
`;
  code = code.replace(
    /const DEFAULT_CONFIG: RewardConfig = \{/,
    evaluateFunc + '\nconst DEFAULT_CONFIG: RewardConfig = {'
  );
}

// 2. Add formula to default config
code = code.replace(
  /coefficients: \[/,
  "formula: 'baseAmount * multiplier',\n  coefficients: ["
);

// 3. Update the calculation
code = code.replace(
  /const finalReward = baseAmount \* multiplier;/,
  "const finalReward = evaluateFormula(config.formula || 'baseAmount * multiplier', { baseAmount, multiplier, score });"
);

// 4. Add the formula builder and simulator UI to the settings tab
const formulaUI = `
            {/* Dynamic Formula Builder & Simulator */}
            <div className={\`p-5 rounded-2xl border col-span-1 lg:col-span-2 \${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}\`}>
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black text-slate-200">فرمول‌ساز داینامیک و شبیه‌ساز</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300">فرمول محاسباتی (JavaScript Valid)</label>
                  <p className="text-[10px] text-slate-400">متغیرهای مجاز: <code className="text-teal-300 bg-slate-900 px-1 rounded">baseAmount</code>, <code className="text-teal-300 bg-slate-900 px-1 rounded">multiplier</code>, <code className="text-teal-300 bg-slate-900 px-1 rounded">score</code></p>
                  <textarea
                    value={config.formula || 'baseAmount * multiplier'}
                    onChange={e => setConfig({ ...config, formula: e.target.value })}
                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-purple-500 text-left"
                    dir="ltr"
                    placeholder="مثال: (score / 100) * baseAmount * multiplier"
                  />
                </div>
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">شبیه‌ساز آنی</h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400">نمره فرضی (score)</label>
                      <input id="sim-score" type="number" defaultValue="85" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400">مبلغ پایه (baseAmount)</label>
                      <input id="sim-base" type="number" defaultValue="10000000" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400">ضریب (multiplier)</label>
                      <input id="sim-mult" type="number" defaultValue="1.2" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">نتیجه شبیه‌سازی:</span>
                    <button type="button" onClick={() => {
                      const score = Number(document.getElementById('sim-score').value) || 0;
                      const baseAmount = Number(document.getElementById('sim-base').value) || 0;
                      const multiplier = Number(document.getElementById('sim-mult').value) || 0;
                      const res = evaluateFormula(config.formula || 'baseAmount * multiplier', { score, baseAmount, multiplier });
                      alert('نتیجه فرمول: ' + new Intl.NumberFormat('fa-IR').format(res) + ' ریال');
                    }} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors">
                      محاسبه کن
                    </button>
                  </div>
                </div>
              </div>
            </div>
`;

code = code.replace(
  /\{activeTab === 'settings' && \(\n\s*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">/,
  `{activeTab === 'settings' && (\n          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">` + formulaUI
);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('patched RCC');
