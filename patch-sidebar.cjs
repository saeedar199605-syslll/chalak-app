const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(
/import \{/g,
"import { LifeBuoy, "
);

// Add support tab to NavLink rendering
code = code.replace(
/<nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">/,
`<nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        <NavLink id="support" icon={LifeBuoy} label={currentUser?.role === 'admin' ? 'تیکت‌های پشتیبانی' : 'پشتیبانی'} />`
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
