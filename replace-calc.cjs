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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace the definition
  content = content.replace(/const calculateScore = \(ev: Evaluation\) => \{[\s\S]*?\n\s*\};\n/g, '');
  content = content.replace(/const calculateScore = \(ev\) => \{[\s\S]*?\n\s*\};\n/g, '');
  
  // Replace calls
  // Be careful if some pass profiles
  content = content.replace(/calculateScore\(/g, 'calculateFinalScore(');

  // Add import if not present
  if (!content.includes('calculateFinalScore')) {
    if (content.includes("from '../utils/formulaEngine'")) {
       content = content.replace(/import \{([^}]+)\} from '\.\.\/utils\/formulaEngine';/, (match, group) => {
         if (!group.includes('calculateFinalScore')) {
           return `import { ${group}, calculateFinalScore } from '../utils/formulaEngine';`;
         }
         return match;
       });
    } else {
       content = content.replace(/(import .* from '\.\.\/types';)/, "$1\nimport { calculateFinalScore } from '../utils/formulaEngine';");
    }
  }

  // Pass profiles to calculateFinalScore if available in scope
  // For Reports, Evaluations, RewardCalculationCenter, Calibration, Dashboard: they usually have `profiles`
  content = content.replace(/calculateFinalScore\(ev\)/g, 'calculateFinalScore(ev, profiles)');
  content = content.replace(/calculateFinalScore\(activeEval\)/g, 'calculateFinalScore(activeEval, profiles)');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
