const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

if (!code.includes('Calculator')) {
  code = code.replace(
    /import \{([^{}]+)\} from 'lucide-react';/,
    (match, p1) => {
      return "import {" + p1 + ", Calculator } from 'lucide-react';";
    }
  );
}

if (!code.includes("id: 'rewards'")) {
  code = code.replace(
    /\{ id: 'reports', label: 'تحلیل‌ها و ماتریس ۹-Box'([^}]+)\},/,
    "{ id: 'reports', label: 'تحلیل‌ها و ماتریس ۹-Box'$1},\n        { id: 'rewards', label: 'محاسبات ریالی پاداش', icon: Calculator, roles: ['admin'] },"
  );
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log('Sidebar.tsx patched.');
} else {
  console.log('Rewards tab already in Sidebar.tsx');
}
