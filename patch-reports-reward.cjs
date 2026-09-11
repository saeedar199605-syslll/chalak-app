const fs = require('fs');
let code = fs.readFileSync('src/components/Reports.tsx', 'utf-8');

const calcFuncs = `
  const rewardConfig = db.getMiscData('pe_reward_config', {
    formula: 'baseAmount * multiplier',
    coefficients: [{ jobFamily: 'all', baseAmount: 10000000 }],
    multipliers: [{ minScore: 0, maxScore: 100, multiplier: 1 }]
  });

  const evaluateFormula = (formula, variables) => {
    try {
      const keys = Object.keys(variables);
      const values = Object.values(variables);
      const func = new Function(...keys, \`return \${formula};\`);
      return Number(func(...values)) || 0;
    } catch (e) {
      return 0;
    }
  };

  const getReward = (score, jobFamily, baseRewardAmount) => {
    let baseAmount = baseRewardAmount;
    if (!baseAmount) {
      const specific = rewardConfig.coefficients.find(c => c.jobFamily === jobFamily);
      baseAmount = specific ? specific.baseAmount : (rewardConfig.coefficients.find(c => c.jobFamily === 'all')?.baseAmount || 0);
    }
    const m = rewardConfig.multipliers.find(m => score >= m.minScore && score <= (m.maxScore === 100 ? 100 : m.maxScore));
    const multiplier = m ? m.multiplier : 0;
    return evaluateFormula(rewardConfig.formula || 'baseAmount * multiplier', { score, baseAmount, multiplier });
  };
`;

code = code.replace(
  /const handleExportAggregatedExcel = \(\) => \{/,
  calcFuncs + "\n  const handleExportAggregatedExcel = () => {"
);

code = code.replace(
  /'نمره نهایی': score,/,
  "'نمره نهایی': score,\n        'مبلغ پاداش (ریال)': getReward(score, prof?.family || emp?.unit || 'all', prof?.baseRewardAmount),"
);

fs.writeFileSync('src/components/Reports.tsx', code);
console.log('patched Reports export with reward');
