const fs = require('fs');
let code = fs.readFileSync('src/components/Evaluations.tsx', 'utf-8');

if (!code.includes('pe_reward_config')) {
  // Imports
  code = code.replace(
    /import \{ Evaluation, Employee, JobProfile, Criterion, ScoreItem \} from '\.\.\/types';/,
    "import { Evaluation, Employee, JobProfile, Criterion, ScoreItem, RewardConfig } from '../types';\nimport { db } from '../utils/db';"
  );
  
  // Logic inside the component
  const logic = `
  const [rewardConfig, setRewardConfig] = React.useState<RewardConfig | null>(null);
  React.useEffect(() => {
    const cfg = db.getMiscData<RewardConfig>('pe_reward_config', { coefficients: [], multipliers: [] });
    setRewardConfig(cfg);
  }, []);

  const projectedReward = React.useMemo(() => {
    if (!rewardConfig || !activeEval || finalScore === 0) return 0;
    const emp = employees.find(e => e.id === activeEval.empId);
    const prof = profiles.find(p => p.id === activeEval.profileId);
    if (!emp || !prof) return 0;
    
    const m = rewardConfig.multipliers.find(m => finalScore >= m.minScore && finalScore <= (m.maxScore === 100 ? 100 : m.maxScore));
    const mult = m ? m.multiplier : 0;
    
    let baseAmount = prof.baseRewardAmount;
    if (!baseAmount || baseAmount === 0) {
      const specific = rewardConfig.coefficients.find(c => c.jobFamily === prof.family);
      baseAmount = specific ? specific.baseAmount : (rewardConfig.coefficients.find(c => c.jobFamily === 'all')?.baseAmount || 0);
    }
    return baseAmount * mult;
  }, [finalScore, rewardConfig, activeEval, employees, profiles]);
  `;
  
  code = code.replace(
    /const finalScore = activeEval \? calculateScore\(activeEval\) : 0;/,
    "const finalScore = activeEval ? calculateScore(activeEval) : 0;\n" + logic
  );
  
  // UI
  const bannerUI = `
            {/* Projected Reward Banner */}
            {projectedReward > 0 && activeEval && activeEval.status !== 'draft' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-teal-400">پیش‌بینی پاداش عملکرد دوره</h4>
                  <p className="text-xs text-slate-400 mt-1">بر اساس نمره نهایی {finalScore} از ۱۰۰</p>
                </div>
                <div className="text-xl font-black text-emerald-400">
                  {new Intl.NumberFormat('fa-IR').format(projectedReward)} ریال
                </div>
              </div>
            )}
  `;
  
  // Find where finalScore is displayed
  code = code.replace(
    /<div className="flex-1 space-y-4">/,
    "<div className=\"flex-1 space-y-4\">\n" + bannerUI
  );

  fs.writeFileSync('src/components/Evaluations.tsx', code);
  console.log('Evaluations patched.');
} else {
  console.log('Evaluations already patched.');
}
