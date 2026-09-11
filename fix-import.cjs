const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/import \{([\s\S]*?)UploadCloud,([\s\S]*?)\} from 'lucide-react';/, "import {$1$2} from 'lucide-react';");
code = code.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, "import { UploadCloud, $1} from 'lucide-react';");
fs.writeFileSync('src/App.tsx', code);
