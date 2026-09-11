const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');
code = code.replace(/evalStatus === 'calibrated'/g, "(evalStatus as string) === 'calibrated'");
code = code.replace(/evalStatus === 'calibration_review'/g, "(evalStatus as string) === 'calibration_review'");
fs.writeFileSync('src/components/Employees.tsx', code);
