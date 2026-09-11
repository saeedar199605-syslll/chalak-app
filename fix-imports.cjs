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
  if (!content.includes('calculateFinalScore')) {
    content = content.replace("import { Evaluation,", "import { calculateFinalScore } from '../utils/formulaEngine';\nimport { Evaluation,");
    if (!content.includes('calculateFinalScore')) {
      content = content.replace("import { Employee,", "import { calculateFinalScore } from '../utils/formulaEngine';\nimport { Employee,");
    }
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
