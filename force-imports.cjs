const fs = require('fs');
const files = [
  'src/components/Calibration.tsx',
  'src/components/Dashboard.tsx',
  'src/components/Evaluations.tsx',
  'src/components/MyEvaluation.tsx',
  'src/components/Reports.tsx',
  'src/components/RewardCalculationCenter.tsx',
  'src/components/WorkflowManager.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  if (!content.match(/import \{.*calculateFinalScore.*\} from/)) {
    content = content.replace(/(import React[^;]*;)/, "$1\nimport { calculateFinalScore } from '../utils/formulaEngine';");
    fs.writeFileSync(f, content);
    console.log('Force added to', f);
  }
});
