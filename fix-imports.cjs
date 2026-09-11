const fs = require('fs');

['src/components/Evaluations.tsx', 'src/components/MyEvaluation.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  if (!code.includes('import { db }')) {
    code = code.replace(
      /from '\.\.\/types';/,
      "from '../types';\nimport { db } from '../utils/db';"
    );
  }
  if (!code.includes('RewardConfig')) {
    code = code.replace(
      /from '\.\.\/types';/,
      ", RewardConfig } from '../types';"
    );
  }
  if (!code.includes('import { useEffect')) {
    code = code.replace(
      /import React, \{ useState/g,
      "import React, { useState, useEffect"
    );
  }
  if (!code.includes('import { useMemo')) {
    code = code.replace(
      /import React, \{ useState/g,
      "import React, { useState, useMemo"
    );
  }

  fs.writeFileSync(file, code);
});
console.log('Fixed imports');
