const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  /items: ProfileItem\[\];\n\}/g,
  "items: ProfileItem[];\n  baseRewardAmount?: number;\n}"
);

fs.writeFileSync('src/types.ts', code);
console.log('Fixed JobProfile type');
