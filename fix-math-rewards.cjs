const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

code = code.replace(
  /const getMultiplier = \(score: number\) => \{[\s\S]*?return m \? m\.multiplier : 0;\n  \};/,
  `const getMultiplier = (score: number) => {
    const m = config.multipliers.find(m => score >= m.minScore && (m.maxScore === 100 ? score <= m.maxScore : score < m.maxScore + (Number.isInteger(m.maxScore) ? 1 : 0.01)));
    return m ? m.multiplier : 0;
  };`
);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('Math bounds fixed.');
