const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('RewardCalculationCenter')) {
  // Add import
  code = code.replace(
    /import ManagementCenter from '\.\/components\/ManagementCenter';/,
    "import ManagementCenter from './components/ManagementCenter';\nimport RewardCalculationCenter from './components/RewardCalculationCenter';"
  );
  
  // Add Tab content
  code = code.replace(
    /\{currentTab === 'settings' && \(/,
    "{currentTab === 'rewards' && <RewardCalculationCenter evaluations={evaluations} employees={employees} profiles={profiles} theme={theme} />}\n          {currentTab === 'settings' && ("
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx patched.');
} else {
  console.log('RewardCalculationCenter already in App.tsx');
}
