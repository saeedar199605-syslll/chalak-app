const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(/import \{ LifeBuoy,\s*Employee, UserRole \}/g, "import { Employee, UserRole }");

code = code.replace(
/import \{/g,
"import { LifeBuoy, "
);

// wait, the previous replace might have duplicated LifeBuoy.
code = code.replace(/import \{ LifeBuoy, LifeBuoy, /g, "import { LifeBuoy, ");
code = code.replace(/import \{ LifeBuoy,  Employee/g, "import { Employee");
code = code.replace(/import \{ LifeBuoy,\n  Employee/g, "import {\n  Employee");


// Adding Support tab to the menuGroups
const supportMenu = `
    {
      title: 'پشتیبانی',
      items: [
        { id: 'support', label: currentUser.role === 'admin' ? 'مدیریت تیکت‌ها' : 'پشتیبانی و ارتباط با مدیر', icon: LifeBuoy, roles: ['admin', 'supervisor', 'employee'] }
      ]
    }
  ];`;
code = code.replace(/\]\s*\}\s*\];/g, "]\n    }," + supportMenu);


// Apply Granular Permissions (RBAC) to menu rendering logic
// Currently it filters by roles. I'll add logic to check permissions too.
code = code.replace(
/const menuGroups = \[/g,
`const hasPerm = (perm: string) => currentUser.role === 'admin' || currentUser.permissions?.includes(perm);
  
  const menuGroups = [`
);

code = code.replace(
/\{ id: 'criteria', label: 'بانک شاخص‌ها و فرمول‌های KPI', icon: Calculator, roles: \['admin'\] \},/,
`{ id: 'criteria', label: 'بانک شاخص‌ها و فرمول‌های KPI', icon: Calculator, roles: ['admin', 'supervisor', 'employee'], permission: 'manage_criteria' },`
);

code = code.replace(
/\{ id: 'employees', label: 'مدیریت کارکنان', icon: Users, roles: \['admin', 'supervisor'\] \},/,
`{ id: 'employees', label: 'مدیریت کارکنان', icon: Users, roles: ['admin', 'supervisor', 'employee'], permission: 'manage_users' },`
);

code = code.replace(
/\{ id: 'reports', label: 'تحلیل‌ها و ماتریس ۹-Box', icon: TrendingUp, roles: \['admin', 'supervisor'\] \},/,
`{ id: 'reports', label: 'تحلیل‌ها و ماتریس ۹-Box', icon: TrendingUp, roles: ['admin', 'supervisor', 'employee'], permission: 'view_all_reports' },`
);

// In the render loop, it filters by role:
code = code.replace(
/const visibleItems = group\.items\.filter\(item => item\.roles\.includes\(currentUser\.role\)\);/g,
`const visibleItems = group.items.filter(item => {
              if (item.permission && !hasPerm(item.permission)) return false;
              if (item.roles && !item.roles.includes(currentUser.role)) return false;
              return true;
            });`
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
