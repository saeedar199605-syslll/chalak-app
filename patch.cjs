const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');
code = code.replace(
/  const filteredEmployees = employees.filter\(emp => \{[\s\S]*?\}\);/g,
`  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const profile = profiles.find(p => p.id === emp.profileId);
      const evalStatus = getEvaluationStatus(emp.id);
      
      const roleFa = emp.role === 'admin' ? 'ادمین' : emp.role === 'supervisor' ? 'سرپرست' : 'کارمند';
      const statusFa = evalStatus === 'not_started' ? 'ارزیابی نشده' :
                       evalStatus === 'draft' ? 'پیش‌نویس' :
                       evalStatus === 'self_eval' ? 'خودارزیابی' :
                       evalStatus === 'manager_eval' ? 'ارزیابی مدیر' :
                       evalStatus === 'calibration' ? 'کالیبراسیون' :
                       evalStatus === 'finalized' ? 'نهایی شده' : evalStatus;

      const term = searchTerm.toLowerCase();
      
      return emp.name.toLowerCase().includes(term) || 
             emp.code.toLowerCase().includes(term) || 
             emp.unit.toLowerCase().includes(term) ||
             (profile?.title || '').toLowerCase().includes(term) ||
             roleFa.includes(term) ||
             statusFa.includes(term);
    });
  }, [employees, profiles, searchTerm, evaluations]);`
);
fs.writeFileSync('src/components/Employees.tsx', code);
