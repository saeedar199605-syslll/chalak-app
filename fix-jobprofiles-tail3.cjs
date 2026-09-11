const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

code = code.replace(
  /      \)\}\n      <\/div>\n    <\/div>\n  \);\n\}/,
  "      )}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('Fixed tail');
