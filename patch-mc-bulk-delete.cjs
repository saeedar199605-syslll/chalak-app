const fs = require('fs');

let code = fs.readFileSync('src/components/ManagementCenter.tsx', 'utf-8');

if (!code.includes('selectedEmpIds')) {
  // Add state
  const states = `
  const [userToDelete, setUserToDelete] = useState<Employee | null>(null);
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteEmpModalOpen, setIsBulkDeleteEmpModalOpen] = useState(false);

  const handleToggleSelectEmp = (id: string) => {
    const next = new Set(selectedEmpIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEmpIds(next);
  };
  const handleToggleSelectAllEmps = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmpIds(new Set(employees.map(e => e.id)));
    } else {
      setSelectedEmpIds(new Set());
    }
  };
  const handleConfirmBulkDeleteEmps = () => {
    if (selectedEmpIds.size === 0) return;
    const remaining = employees.filter(e => !selectedEmpIds.has(e.id));
    onUpdateEmployees(remaining);
    db.saveMiscData('pe_audit_logs', [
      { id: Date.now().toString(), date: new Date().toISOString(), user: currentUser.name, action: 'bulk_delete_users', details: 'حذف گروهی ' + selectedEmpIds.size + ' کاربر' },
      ...(db.getMiscData<any[]>('pe_audit_logs', []))
    ]);
    setSelectedEmpIds(new Set());
    setIsBulkDeleteEmpModalOpen(false);
  };
`;
  code = code.replace("const [userToDelete, setUserToDelete] = useState<Employee | null>(null);", states);

  // Add Bulk Delete button to header
  const buttonJSX = `
            {selectedEmpIds.size > 0 && (
              <button
                onClick={() => setIsBulkDeleteEmpModalOpen(true)}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف گروهی ({selectedEmpIds.size})</span>
              </button>
            )}
            <button
              onClick={handleExportToExcel}
`;
  code = code.replace(/<button\n\s*onClick=\{handleExportToExcel\}/, buttonJSX);

  // Add checkboxes to table
  code = code.replace(/<th className="pb-3 text-right">ردیف<\/th>/, `<th className="pb-3 text-center w-12"><input type="checkbox" checked={employees.length > 0 && selectedEmpIds.size === employees.length} onChange={handleToggleSelectAllEmps} className="rounded border-slate-700 bg-slate-800 text-teal-500 cursor-pointer w-4 h-4" /></th><th className="pb-3 text-right">ردیف</th>`);

  code = code.replace(/<td className="py-3 text-right font-mono text-slate-500">/, `<td className="py-3 text-center"><input type="checkbox" checked={selectedEmpIds.has(emp.id)} onChange={() => handleToggleSelectEmp(emp.id)} className="rounded border-slate-700 bg-slate-800 text-teal-500 cursor-pointer w-4 h-4" /></td><td className="py-3 text-right font-mono text-slate-500">`);

  // Add modal JSX
  const modalJSX = `
      {/* Bulk Delete Emps Confirmation Modal */}
      {isBulkDeleteEmpModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right" dir="rtl">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100">حذف گروهی پرسنل ({selectedEmpIds.size} نفر)</h3>
                <p className="text-[11px] text-slate-400">اطلاعات این پرسنل از سیستم حذف خواهد شد.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsBulkDeleteEmpModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDeleteEmps}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تایید و حذف گروهی</span>
              </button>
            </div>
          </div>
        </div>
      )}
`;
  code = code.replace("{userToDelete && (", modalJSX + "{userToDelete && (");

  fs.writeFileSync('src/components/ManagementCenter.tsx', code);
  console.log('Patched ManagementCenter.tsx');
}
