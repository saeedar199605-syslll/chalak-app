const fs = require('fs');

['src/components/Evaluations.tsx', 'src/components/MyEvaluation.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  if (!code.includes('RewardConfig')) {
    code = code.replace(
      /\} from '\.\.\/types';/,
      "  RewardConfig\n} from '../types';"
    );
    fs.writeFileSync(file, code);
  }
});
console.log('Fixed imports again');
