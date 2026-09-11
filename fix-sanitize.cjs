const fs = require('fs');
let code = fs.readFileSync('src/utils/validation.ts', 'utf-8');

code = code.replace(
  /locked: Boolean\(data\.locked\),/,
  "locked: Boolean(data.locked),\n    baseRewardAmount: data.baseRewardAmount ? Number(data.baseRewardAmount) : undefined,"
);

if (!code.includes('/**\n * @license')) {
  code = "/**\n" + code;
}

fs.writeFileSync('src/utils/validation.ts', code);
console.log('Fixed sanitize');
