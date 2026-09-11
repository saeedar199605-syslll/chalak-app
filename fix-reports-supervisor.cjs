const fs = require('fs');
let code = fs.readFileSync('src/components/Reports.tsx', 'utf-8');

code = code.replace(
  /const superName = emp \? emp\.supervisorName : 'نامشخص';/g,
  "const superName = emp?.supervisorId ? employees.find(e => e.id === emp.supervisorId)?.name : 'نامشخص';"
);

fs.writeFileSync('src/components/Reports.tsx', code);
console.log('Fixed reports supervisorName');
