const fs = require('fs');
let code = fs.readFileSync('src/components/MyEvaluation.tsx', 'utf-8');

const evaluateFunc = `
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
`;

if (!code.includes('evaluateFormula')) {
  code = code.replace(
    /const projectedReward = useMemo\(\(\) => \{/,
    evaluateFunc + "\n  const projectedReward = useMemo(() => {"
  );
}

code = code.replace(
  /return baseAmount \* mult;/,
  "return evaluateFormula(rewardConfig.formula || 'baseAmount * multiplier', { score: finalScore, baseAmount, multiplier: mult });"
);

fs.writeFileSync('src/components/MyEvaluation.tsx', code);
console.log('patched MyEvaluation');
