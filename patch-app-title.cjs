const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("case 'rewards'")) {
  code = code.replace(
    /case 'reports': return 'گزارشات سازمانی';/,
    "case 'reports': return 'گزارشات سازمانی';\n      case 'rewards': return 'محاسبات ریالی و پاداش';"
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx tab title patched.');
} else {
  console.log('Rewards tab title already in App.tsx');
}
