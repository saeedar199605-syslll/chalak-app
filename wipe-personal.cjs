const fs = require('fs');

let mc = fs.readFileSync('src/components/ManagementCenter.tsx', 'utf-8');
mc = mc.replace(/مهندس علی رضایی/g, 'کارمند نمونه');
mc = mc.replace(/علی رضایی/g, 'کارمند نمونه');
mc = mc.replace(/مهندس رضا کریمی/g, 'کارمند تستی');
mc = mc.replace(/ali_rezaei/g, 'emp_demo');
mc = mc.replace(/reza_karimi/g, 'emp_test');
fs.writeFileSync('src/components/ManagementCenter.tsx', mc);

let emp = fs.readFileSync('src/components/Employees.tsx', 'utf-8');
emp = emp.replace(/مهندس سعید میرزایی/g, 'کارمند نمونه');
emp = emp.replace(/مهندس علی رضایی/g, 'کارمند نمونه');
emp = emp.replace(/رضا صادقی/g, 'کارمند نمونه');
fs.writeFileSync('src/components/Employees.tsx', emp);

let exc = fs.readFileSync('src/utils/excelImportExport.ts', 'utf-8');
exc = exc.replace(/علی رضایی/g, 'کارمند نمونه');
fs.writeFileSync('src/utils/excelImportExport.ts', exc);

let lat = fs.readFileSync('src/data/latticeKickidlerSeed.ts', 'utf-8');
lat = lat.replace(/مهندس علی رضایی/g, 'کارمند نمونه');
lat = lat.replace(/سرکار خانم فاطمه سعیدی/g, 'کارمند نمونه');
lat = lat.replace(/مهندس رضا ابراهیمی/g, 'کارمند نمونه');
fs.writeFileSync('src/data/latticeKickidlerSeed.ts', lat);

console.log('Personal data wiped.');
