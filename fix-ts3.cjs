const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');
code = code.replace(/const evalStatus = getEvaluationStatus\(emp.id\);/g, "const evalStatus = getEvaluationStatus(emp.id) as string;");
code = code.replace(/\(evalStatus as string\)/g, "evalStatus");
fs.writeFileSync('src/components/Employees.tsx', code);
