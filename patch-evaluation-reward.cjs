const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

if (!code.includes('finalReward?: number;')) {
  code = code.replace(
    /history\?: WorkflowTransitionLog\[\]; \/\/ Audit trail of stage movements/,
    "history?: WorkflowTransitionLog[]; // Audit trail of stage movements\n  finalReward?: number; // Calculated financial reward based on score"
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('Evaluation type patched.');
}
