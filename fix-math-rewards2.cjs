const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

code = code.replace(
  /const getMultiplier = \(score: number\) => \{[\s\S]*?return m \? m\.multiplier : 0;\n  \};/,
  `const getMultiplier = (score: number) => {
    // If score is 100, we want it to match the top bracket (maxScore=100)
    // For other brackets like 80-89.99, checking score <= m.maxScore is sufficient as long as we define maxScore correctly
    const m = config.multipliers.find(m => score >= m.minScore && score <= (m.maxScore === 100 ? 100 : m.maxScore));
    return m ? m.multiplier : 0;
  };`
);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('Math bounds fixed.');
