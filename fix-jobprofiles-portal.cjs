const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

code = code.replace(
  /              <\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      \)\}/,
  "              </div>\n            </div>\n          </div>\n        </div>,\n        document.body\n      )}"
);

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('Fixed portal');
