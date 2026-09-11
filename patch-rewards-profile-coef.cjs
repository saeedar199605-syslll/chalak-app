const fs = require('fs');
let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

code = code.replace(
  /const getBaseAmount = \(jobFamily: string\) => \{/,
  "const getBaseAmount = (jobFamily: string, profileBaseAmount?: number) => {\n    if (profileBaseAmount !== undefined && profileBaseAmount > 0) return profileBaseAmount;"
);

code = code.replace(
  /const baseAmount = getBaseAmount\(jobFamily\);/,
  "const baseAmount = getBaseAmount(jobFamily, prof?.baseRewardAmount);"
);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('RewardCalculationCenter profile override patched.');
