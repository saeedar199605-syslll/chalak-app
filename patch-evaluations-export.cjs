const fs = require('fs');

let code = fs.readFileSync('src/components/Evaluations.tsx', 'utf-8');

// add import for xlsx
if (!code.includes("import * as XLSX")) {
    code = code.replace("import { calculateKpiScore,", "import * as XLSX from 'xlsx';\nimport { calculateKpiScore,");
}
if (!code.includes("import { calculateFinalScore } from '../utils/formulaEngine';")) {
   code = code.replace(/(import { Evaluation, Employee,[^}]*} from '\.\.\/types';)/, "import { calculateFinalScore } from '../utils/formulaEngine';\n$1");
}


// add export function
if (!code.includes("const handleExportToExcel = () => {")) {
  const exportFunc = `
  const handleExportToExcel = () => {
    if (evaluations.length === 0) {
      alert('هیچ ارزیابی برای خروجی وجود ندارد.');
      return;
    }
    const exportRows = evaluations.map(ev => {
      const emp = employees.find(e => e.id === ev.empId);
      const prof = profiles.find(p => p.id === ev.profileId);
      const score = calculateFinalScore(ev, profiles);
      return {
        'کد پرسنلی': emp?.code || '---',
        'نام و نام خانوادگی': emp?.name || '---',
        'سمت شغلی': prof?.title || '---',
        'دوره ارزیابی': ev.period,
        'وضعیت پرونده': ev.status === 'locked' ? 'نهایی و بسته شده' : ev.status === 'calibrated' ? 'کالیبره شده' : 'پیش‌نویس / در جریان',
        'نمره نهایی عملکرد (۱ تا ۱۰۰)': score,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ارزیابی‌ها');
    XLSX.writeFile(workbook, \`Evaluations_Export_\${Date.now()}.xlsx\`);
  };
`;
  code = code.replace("const [quickCalcInputs, setQuickCalcInputs] = useState<Record<string, number>>({});", "const [quickCalcInputs, setQuickCalcInputs] = useState<Record<string, number>>({});\n" + exportFunc);
}

// add button in UI
const buttonJSX = `
              <button
                type="button"
                onClick={handleExportToExcel}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-indigo-500/30 transition-all cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                <span>خروجی اکسل نمرات</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
`;

code = code.replace(`<button\n                type="button"\n                onClick={() => setIsExcelModalOpen(true)}`, buttonJSX);

fs.writeFileSync('src/components/Evaluations.tsx', code);
console.log('Evaluations.tsx patched with Export to Excel');
