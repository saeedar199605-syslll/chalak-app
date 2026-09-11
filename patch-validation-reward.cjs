const fs = require('fs');
let code = fs.readFileSync('src/utils/validation.ts', 'utf-8');

code = code.replace(
  /family: z\.string\(\)\.min\(1, 'خانواده شغلی الزامی است\.'\)\.max\(50\),/,
  "family: z.string().min(1, 'خانواده شغلی الزامی است.').max(50),\n  baseRewardAmount: z.number().optional(),"
);

code = code.replace(
  /locked: Boolean\(data\.locked\ ||\ data\['قفل شده'\]\),/,
  "locked: Boolean(data.locked || data['قفل شده']),\n    baseRewardAmount: data.baseRewardAmount ? Number(data.baseRewardAmount) : undefined,"
);

fs.writeFileSync('src/utils/validation.ts', code);
console.log('patched validation');
