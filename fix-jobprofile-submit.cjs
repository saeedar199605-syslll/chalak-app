const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

code = code.replace(
  /family: formFamily \|\| 'عمومی',\n      items: selectedItems,\n      locked: false/,
  "family: formFamily || 'عمومی',\n      items: selectedItems,\n      locked: false,\n      baseRewardAmount: formBaseReward"
);

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('Fixed JobProfiles submit');
