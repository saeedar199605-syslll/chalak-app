const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');
code = code.replace(/evalStatus === 'finalized'/g, "(evalStatus as string) === 'finalized'");
fs.writeFileSync('src/components/Employees.tsx', code);
