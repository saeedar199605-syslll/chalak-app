const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

if (!code.includes('baseRewardAmount?: number;')) {
  code = code.replace(
    /category: 'management' \| 'operational' \| 'technical';/,
    "category: 'management' | 'operational' | 'technical';\n  baseRewardAmount?: number;"
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('types.ts patched.');
} else {
  console.log('baseRewardAmount already in types.ts');
}
