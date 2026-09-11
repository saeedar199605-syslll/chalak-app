const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

// Update props
code = code.replace(
  /interface RewardCalculationCenterProps \{/,
  "interface RewardCalculationCenterProps {\n  onBulkUpdateEvaluations?: (evals: Evaluation[]) => void;"
);

code = code.replace(
  /profiles,\n  theme = 'dark'\n\}: RewardCalculationCenterProps\)/,
  "profiles,\n  theme = 'dark',\n  onBulkUpdateEvaluations\n}: RewardCalculationCenterProps)"
);

// Add persist button logic
const persistLogic = `
  const handlePersistRewards = () => {
    if (!onBulkUpdateEvaluations) return;
    if (!confirm('آیا از ثبت نهایی ارقام پاداش در پرونده‌های این دوره اطمینان دارید؟')) return;

    const updatedEvals = evaluations.map(ev => {
      const pData = previewData.find(p => p.empId === ev.empId && p.period === ev.period);
      if (pData) {
        return { ...ev, finalReward: pData.finalReward };
      }
      return ev;
    });
    
    onBulkUpdateEvaluations(updatedEvals);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };
`;

code = code.replace(/const isDark = theme === 'dark';/, persistLogic + "\n  const isDark = theme === 'dark';");

// Add button to UI
const buttonsUI = `          <button 
            onClick={handlePersistRewards}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> ثبت پاداش‌ها در پرونده
          </button>
          <button 
            onClick={handleExportExcel}`;

code = code.replace(/<button \n            onClick=\{handleExportExcel\}/, buttonsUI);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('Rewards persist patched.');
