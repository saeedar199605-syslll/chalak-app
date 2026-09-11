const fs = require('fs');
let code = fs.readFileSync('src/components/Reports.tsx', 'utf-8');

code = code.replace(/filteredEvals/g, 'evaluations');
code = code.replace(/\$\{selectedPeriod\}/g, 'AllPeriods');

fs.writeFileSync('src/components/Reports.tsx', code);
console.log('Fixed vars in Reports');
