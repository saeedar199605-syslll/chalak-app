const fs = require('fs');
let code = fs.readFileSync('src/components/MyEvaluation.tsx', 'utf-8');

if (!code.includes('pe_reward_config')) {
  // Add imports
  code = code.replace(
    /import \{ Evaluation, JobProfile, Criterion, Employee \} from '\.\.\/types';/,
    "import { Evaluation, JobProfile, Criterion, Employee, RewardConfig } from '../types';\nimport { db } from '../utils/db';"
  );
  
  // Add projection logic inside the component
  const logic = `
  const [rewardConfig, setRewardConfig] = useState<RewardConfig | null>(null);
  useEffect(() => {
    const cfg = db.getMiscData<RewardConfig>('pe_reward_config', { coefficients: [], multipliers: [] });
    setRewardConfig(cfg);
  }, []);

  const calculateScore = (ev: Evaluation) => {
    if (!ev || !ev.scores || !Array.isArray(ev.scores)) return 0;
    const scoredItems = ev.scores.filter(s => s.value > 0);
    if (!scoredItems.length) return 0;
    const totalWeight = scoredItems.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = scoredItems.reduce((acc, curr) => acc + (curr.value * curr.weight), 0);
    const avg5 = weightedSum / totalWeight;
    return Math.round(avg5 * 20 * 10) / 10;
  };

  const currentScore = userEval ? calculateScore(userEval) : 0;
  
  const projectedReward = useMemo(() => {
    if (!rewardConfig || !userProfile || currentScore === 0) return 0;
    const m = rewardConfig.multipliers.find(m => currentScore >= m.minScore && currentScore <= (m.maxScore === 100 ? 100 : m.maxScore));
    const mult = m ? m.multiplier : 0;
    let baseAmount = userProfile.baseRewardAmount;
    if (!baseAmount || baseAmount === 0) {
      const specific = rewardConfig.coefficients.find(c => c.jobFamily === userProfile.family);
      baseAmount = specific ? specific.baseAmount : (rewardConfig.coefficients.find(c => c.jobFamily === 'all')?.baseAmount || 0);
    }
    return baseAmount * mult;
  }, [currentScore, rewardConfig, userProfile]);
  `;
  
  code = code.replace(
    /const userProfile = profiles\.find\(p => p\.id === currentUser\.profileId\);/,
    "const userProfile = profiles.find(p => p.id === currentUser.profileId);" + logic
  );

  // Render the projected reward banner
  const bannerUI = `
          {projectedReward > 0 && userEval?.status !== 'draft' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-teal-400">پیش‌بینی پاداش عملکرد دوره</h4>
                <p className="text-xs text-slate-400 mt-1">بر اساس نمره نهایی {currentScore} از ۱۰۰</p>
              </div>
              <div className="text-xl font-black text-emerald-400">
                {new Intl.NumberFormat('fa-IR').format(projectedReward)} ریال
              </div>
            </div>
          )}
  `;
  
  code = code.replace(
    /<\/div>\n      <\/div>\n\n      \{userEval \? \(/,
    bannerUI + "\n      </div>\n      </div>\n\n      {userEval ? ("
  );
  
  fs.writeFileSync('src/components/MyEvaluation.tsx', code);
  console.log('MyEvaluation patched.');
} else {
  console.log('MyEvaluation already patched.');
}
