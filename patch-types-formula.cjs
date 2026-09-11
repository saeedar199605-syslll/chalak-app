const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

if (!code.includes('formula?: string')) {
  code = code.replace(
    /export interface RewardConfig \{/,
    "export interface RewardConfig {\n  formula?: string;"
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('patched');
}
