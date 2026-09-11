const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

// Remove all occurrences of LifeBuoy in the import block, then insert it once
code = code.replace(/LifeBuoy,/g, "");
code = code.replace(/import \{/g, "import { LifeBuoy, ");

fs.writeFileSync('src/components/Sidebar.tsx', code);
