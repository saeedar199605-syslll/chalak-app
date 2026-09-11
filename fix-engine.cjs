const fs = require('fs');
let content = fs.readFileSync('src/utils/formulaEngine.ts', 'utf-8');

content = content.replace("ev.status === 'in_progress'", "ev.status === 'draft'");
content = content.replace("profItem.criterionId", "profItem.cid");

fs.writeFileSync('src/utils/formulaEngine.ts', content);
console.log('Fixed formulaEngine.ts');
