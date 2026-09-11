const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(/icon:\s*roles: \['admin', 'supervisor', 'employee'\] \}/g, "icon: LifeBuoy, roles: ['admin', 'supervisor', 'employee'] }");

fs.writeFileSync('src/components/Sidebar.tsx', code);
