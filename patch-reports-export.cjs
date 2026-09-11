const fs = require('fs');
let code = fs.readFileSync('src/components/Reports.tsx', 'utf-8');

if (!code.includes('handleExportAggregatedExcel')) {
  // Add XLSX import if missing
  if (!code.includes('import * as XLSX')) {
    code = code.replace(
      /import \{ createPortal \} from 'react-dom';/,
      "import { createPortal } from 'react-dom';\nimport * as XLSX from 'xlsx';"
    );
  }

  // Add the export logic
  const logic = `
  const handleExportAggregatedExcel = () => {
    if (filteredEvals.length === 0) {
      alert('داده‌ای برای خروجی وجود ندارد.');
      return;
    }

    const exportRows = filteredEvals.map(ev => {
      const emp = employees.find(e => e.id === ev.empId);
      const prof = profiles.find(p => p.id === ev.profileId);
      const score = calculateScore(ev);
      // Determine unit and supervisor based on emp data or defaults
      const unit = emp ? emp.unit : 'نامشخص';
      const superName = emp ? emp.supervisorName : 'نامشخص';
      
      return {
        'کد پرسنلی': emp?.code || '---',
        'نام پرسنل': emp?.name || '---',
        'واحد سازمانی': unit,
        'نام سرپرست/مدیر': superName,
        'سمت سازمانی': prof?.title || '---',
        'دوره ارزیابی': ev.period,
        'نمره نهایی': score,
        'وضعیت پرونده': ev.status === 'locked' ? 'بسته شده' : ev.status === 'calibrated' ? 'کالیبره شده' : 'پیش‌نویس/جاری'
      };
    });

    // Sort by unit then supervisor
    exportRows.sort((a, b) => {
      if (a['واحد سازمانی'] < b['واحد سازمانی']) return -1;
      if (a['واحد سازمانی'] > b['واحد سازمانی']) return 1;
      if (a['نام سرپرست/مدیر'] < b['نام سرپرست/مدیر']) return -1;
      if (a['نام سرپرست/مدیر'] > b['نام سرپرست/مدیر']) return 1;
      return 0;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'گزارش تجمیعی');
    XLSX.writeFile(workbook, \`Aggregated_Report_\${selectedPeriod}_\${Date.now()}.xlsx\`);
  };
  `;

  code = code.replace(
    /const handleExportCSV = \(\) => \{/,
    logic + "\n  const handleExportCSV = () => {"
  );

  // Add the button next to export CSV
  const btnUI = `
            <button
              onClick={handleExportAggregatedExcel}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-4 h-4" /> خروجی جامع اکسل (تجمیعی)
            </button>
            <button
              onClick={handleExportCSV}`;

  code = code.replace(
    /<button\n              onClick=\{handleExportCSV\}/,
    btnUI
  );

  fs.writeFileSync('src/components/Reports.tsx', code);
  console.log('Reports export patched.');
} else {
  console.log('Reports already patched.');
}
