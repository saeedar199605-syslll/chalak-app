const fs = require('fs');

let rcc = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');
rcc = rcc.replace(/document\.getElementById\('sim-score'\)\.value/g, "(document.getElementById('sim-score') as HTMLInputElement).value");
rcc = rcc.replace(/document\.getElementById\('sim-base'\)\.value/g, "(document.getElementById('sim-base') as HTMLInputElement).value");
rcc = rcc.replace(/document\.getElementById\('sim-mult'\)\.value/g, "(document.getElementById('sim-mult') as HTMLInputElement).value");
fs.writeFileSync('src/components/RewardCalculationCenter.tsx', rcc);

let reports = fs.readFileSync('src/components/Reports.tsx', 'utf-8');
if (!reports.includes("import { db }")) {
  reports = reports.replace(
    /from '\.\.\/utils\/calendarExport';/,
    "from '../utils/calendarExport';\nimport { db } from '../utils/db';"
  );
  fs.writeFileSync('src/components/Reports.tsx', reports);
}

console.log('Fixed lint');
