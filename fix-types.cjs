const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

if (!code.includes('baseRewardAmount?: number')) {
  code = code.replace(
    /family: string;\n\}/g,
    "family: string;\n  baseRewardAmount?: number;\n}"
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('Fixed JobProfile type');
}
