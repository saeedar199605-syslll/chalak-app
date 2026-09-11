const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

code = code.replace(
  /const calculateScore = \(ev: Evaluation\) => \{/,
  "const calculateScore = (ev: Evaluation) => {\n    if (!ev || !ev.scores || !Array.isArray(ev.scores)) return 0;"
);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('Fixed edge cases');
