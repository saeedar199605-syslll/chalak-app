const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /\{currentTab === 'rewards' && currentUser\.role === 'admin' && <RewardCalculationCenter evaluations=\{evaluations\} employees=\{employees\} profiles=\{profiles\} theme=\{theme\} \/>\}/,
  "{currentTab === 'rewards' && currentUser.role === 'admin' && <RewardCalculationCenter evaluations={evaluations} employees={employees} profiles={profiles} theme={theme} onBulkUpdateEvaluations={handleBulkUpdateEvaluations} />}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx pass update patched.');
