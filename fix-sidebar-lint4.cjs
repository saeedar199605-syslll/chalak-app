const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(/import \{ LifeBuoy,\s*Employee, UserRole \} from '\.\.\/types';/g, "import { Employee, UserRole } from '../types';");
code = code.replace(/import \{ LifeBuoy,   LayoutDashboard,/g, "import { LifeBuoy, LayoutDashboard,");

fs.writeFileSync('src/components/Sidebar.tsx', code);
