const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

// I will just add an extra </div> before `    </div>\n  );\n}`
code = code.replace(
  /    <\/div>\n  \);\n\}/,
  "      </div>\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('Fixed');
