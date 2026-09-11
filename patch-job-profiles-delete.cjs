const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

const buttonJSX = `
          {selectedProfileIds.size > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف گروهی ({selectedProfileIds.size})</span>
            </button>
          )}
          <button
`;

code = code.replace(/<button\n\s*onClick=\{\(\) => \{\n\s*setEditingId\(null\);/m, buttonJSX + `            onClick={() => {\n              setEditingId(null);`);

if(!code.includes("import { Trash2 } from 'lucide-react';")) {
   code = code.replace(/import \{ PlusCircle, /m, "import { PlusCircle, Trash2, ");
}

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('JobProfiles.tsx patched with Bulk Delete button');
