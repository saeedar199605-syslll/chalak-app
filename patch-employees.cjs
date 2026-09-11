const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');

if (!code.includes('import { Shield, Activity')) {
  code = code.replace(/import {/, "import { Shield, Activity, UsersRound, ");
}

// Read presence in Employees
code = code.replace(
/const \[selectedEmpIds, setSelectedEmpIds\] = useState<Set<string>>\(new Set\(\)\);/,
`const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [presence, setPresence] = useState<Record<string, number>>(() => db.getMiscData('pe_presence', {}));
  const [isBatchCreateModalOpen, setIsBatchCreateModalOpen] = useState(false);
  const [batchText, setBatchText] = useState('');

  useEffect(() => {
    const unsub = db.subscribe((key, data) => {
      if (key === 'pe_presence' && data) {
        setPresence(data);
      }
    });
    return unsub;
  }, []);

  const isOnline = (empId: string) => {
    const lastSeen = presence[empId];
    if (!lastSeen) return false;
    return (Date.now() - lastSeen) < 30000; // Online if active in last 30s
  };
`
);

// Add Batch Create handler
code = code.replace(
/const handleToggleSelectAll = \(\) => \{/,
`const handleBatchCreateSubmit = () => {
    if (!batchText.trim()) return;
    const lines = batchText.split('\\n');
    let addedCount = 0;
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const [name, code, unit, roleStr] = parts.map(p => p.trim());
        if (name && code && unit) {
          const emp = {
            name,
            code,
            unit,
            role: (roleStr === 'admin' || roleStr === 'supervisor' || roleStr === 'employee') ? roleStr : 'employee',
            username: code.toLowerCase(),
            profileId: profiles.length > 0 ? profiles[0].id : '',
            permissions: []
          };
          onAddEmployee(emp as any);
          addedCount++;
        }
      }
    });
    setIsBatchCreateModalOpen(false);
    setBatchText('');
    alert(\`\${addedCount} کاربر جدید اضافه شد.\`);
  };

  const handleToggleSelectAll = () => {`
);

// Permissions inside Modal
code = code.replace(
/const \[newEmployee, setNewEmployee\] = useState<Partial<Employee>>\(\{/,
`const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    permissions: [],`
);

const permissionsUI = `
            {/* RBAC Permissions Section */}
            <div className="md:col-span-2 mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-500" /> دسترسی‌های ویژه (RBAC)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'manage_users', label: 'مدیریت کاربران و دسترسی‌ها' },
                  { id: 'manage_evaluations', label: 'ایجاد و مدیریت دوره‌های ارزیابی' },
                  { id: 'view_all_reports', label: 'مشاهده گزارشات کل سازمان' },
                  { id: 'manage_criteria', label: 'مدیریت شاخص‌ها و فرمول‌ها' }
                ].map(perm => {
                  const hasPerm = newEmployee.permissions?.includes(perm.id) || false;
                  return (
                    <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                      <div className={\`w-4 h-4 rounded border flex items-center justify-center transition-colors \${hasPerm ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-400 dark:border-slate-600 group-hover:border-teal-500'}\`}>
                        {hasPerm && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={hasPerm}
                        onChange={(e) => {
                          const perms = newEmployee.permissions || [];
                          if (e.target.checked) {
                            setNewEmployee({...newEmployee, permissions: [...perms, perm.id]});
                          } else {
                            setNewEmployee({...newEmployee, permissions: perms.filter(p => p !== perm.id)});
                          }
                        }}
                      />
                      <span className="dark:text-slate-300 text-slate-700 group-hover:text-teal-500 transition-colors">{perm.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
`;
code = code.replace(
/\{newEmployee\.role \!== 'employee' && \(/,
`${permissionsUI}\n            {newEmployee.role !== 'employee' && (`
);

// Add Batch Add Button to Header
code = code.replace(
/<button\s+type="button"\s+onClick=\{openAddForm\}\s+className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-900\/20"\s+title="افزودن دستی پرسنل"\s+>\s*<Plus className="w-4 h-4" \/>\s*<span className="hidden sm:inline">فرد جدید<\/span>\s*<\/button>/,
`<button
              type="button"
              onClick={() => setIsBatchCreateModalOpen(true)}
              className="px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 font-bold rounded-xl flex items-center gap-2 transition-all"
              title="ساخت گروهی کاربران"
            >
              <UsersRound className="w-4 h-4" />
              <span className="hidden md:inline">ساخت گروهی</span>
            </button>
            <button
              type="button"
              onClick={openAddForm}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-900/20"
              title="افزودن دستی پرسنل"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">فرد جدید</span>
            </button>`
);

// Add Batch Create Modal
const batchModal = `
      {/* Batch Create Modal */}
      {isBatchCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <UsersRound className="w-6 h-6 text-indigo-500" /> ساخت گروهی کاربران
              </h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm mb-4 text-slate-600 dark:text-slate-400">
                شما می‌توانید لیست کاربران را به صورت متنی وارد کنید. هر کاربر در یک خط و فرمت باید به این شکل باشد: 
                <br/>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono text-indigo-500">نام و نام خانوادگی, کد پرسنلی, واحد سازمانی, نقش (اختیاری: admin/supervisor/employee)</code>
              </p>
              <textarea 
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                className="w-full h-64 p-4 rounded-xl border outline-none bg-slate-50 border-slate-300 focus:border-indigo-500 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:focus:border-indigo-500 dark:text-white font-mono text-sm leading-relaxed resize-none"
                placeholder="سعید میرزایی, EMP-1001, سالن مونتاژ, supervisor\nعلی کریمی, EMP-1002, منابع انسانی, employee"
              />
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsBatchCreateModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">انصراف</button>
              <button type="button" onClick={handleBatchCreateSubmit} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2"><Sparkles className="w-4 h-4"/> ایجاد کاربران</button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
/\{isExchangeModalOpen && \(/,
batchModal + "\n      {isExchangeModalOpen && ("
);

// Display Presence Online/Offline
// In Table view avatar
code = code.replace(
/\{emp\.name\.split\(' '\)\.map\(n => n\[0\]\)\.slice\(0, 2\)\.join\(''\)\}\n                  <\/div>/,
`{emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    {isOnline(emp.id) && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="آنلاین" />
                    )}
                  </div>`
);
// In Grid view avatar
code = code.replace(
/\{emp\.name\.split\(' '\)\.map\(n => n\[0\]\)\.slice\(0, 2\)\.join\(''\)\}\n                      <\/div>/,
`{emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        {isOnline(emp.id) && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="آنلاین" />
                        )}
                      </div>`
);


fs.writeFileSync('src/components/Employees.tsx', code);
