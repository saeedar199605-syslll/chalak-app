const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(/LifeBuoy,  LifeBuoy,/g, "LifeBuoy,");
code = code.replace(/import \{ LifeBuoy,  \n  LayoutDashboard,/g, "import { LifeBuoy, LayoutDashboard,");
code = code.replace(/import \{ LifeBuoy,\s*LifeBuoy,/g, "import { LifeBuoy,");

// Add permission to items interface or use type casting
code = code.replace(
/const menuGroups = \[/g,
`type MenuItem = { id: string, label: string, icon: any, roles?: string[], permission?: string };
  type MenuGroup = { title: string, items: MenuItem[] };
  
  const menuGroups: MenuGroup[] = [`
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
