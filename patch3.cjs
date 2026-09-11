const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');

code = code.replace(
/const evalObj = evaluations.find\(e => e.employeeId === empId && e.period === CURRENT_ACTIVE_PERIOD\);/g,
'const evalObj = evaluations.find(e => e.empId === empId && e.period === CURRENT_ACTIVE_PERIOD);'
);

code = code.replace(
/return evalObj.status;/g,
'return evalObj.stage || evalObj.status;'
);

code = code.replace(
/evalStatus === 'self_eval' \? 'خودارزیابی' :/g,
"evalStatus === 'self_review' ? 'خودارزیابی' :"
);

code = code.replace(
/evalStatus === 'manager_eval' \? 'ارزیابی مدیر' :/g,
"evalStatus === 'supervisor_review' ? 'ارزیابی سرپرست' :\n                       evalStatus === 'hr_approval' ? 'تایید منابع انسانی' :\n                       evalStatus === 'peer_review' ? 'ارزیابی همتا' :\n                       evalStatus === 'locked' ? 'بسته شده' :\n                       evalStatus === 'calibrated' ? 'کالیبره شده' :"
);

code = code.replace(
/evalStatus === 'calibration' \? 'کالیبراسیون' :/g,
"evalStatus === 'calibration_review' ? 'کالیبراسیون' :"
);

fs.writeFileSync('src/components/Employees.tsx', code);
