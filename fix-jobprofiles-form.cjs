const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

code = code.replace(/<\/form>/g, '</div>');

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('Fixed form tag');
