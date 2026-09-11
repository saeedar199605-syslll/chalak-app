const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

// Inside JobProfiles component, generate csvHeaders dynamically based on criteria
code = code.replace(
/const exchangeConfig: DataExchangeConfig<JobProfile> = \{[\s\S]*?onImport: \(importedItems, mode\) => \{/,
`const dynamicHeaders = [
      { key: 'title', label: 'عنوان رده شغلی' },
      { key: 'code', label: 'کد شغل' },
      { key: 'family', label: 'خانواده شغلی' },
      { key: 'locked', label: 'وضعیت تصویب (بلی/خیر)', accessor: (p: JobProfile) => p.locked ? 'بلی' : 'خیر' }
    ];
    criteria.forEach(c => {
      dynamicHeaders.push({
        key: \`crit_\${c.id}\`,
        label: \`وزن معیار: \${c.name} [\${c.code}]\`,
        accessor: (p: JobProfile) => {
          const item = p.items.find(i => i.cid === c.id);
          return item ? item.weight.toString() : '';
        }
      });
    });

    const templateSampleRow: Record<string, string> = {
      'عنوان رده شغلی': 'اپراتور تراشکاری CNC', 
      'کد شغل': 'OP-CNC-01', 
      'خانواده شغلی': 'فنی مهندسی', 
      'وضعیت تصویب (بلی/خیر)': 'بلی'
    };
    if (criteria.length > 0) templateSampleRow[\`وزن معیار: \${criteria[0].name} [\${criteria[0].code}]\`] = '25';
    if (criteria.length > 1) templateSampleRow[\`وزن معیار: \${criteria[1].name} [\${criteria[1].code}]\`] = '20';

    const exchangeConfig: DataExchangeConfig<JobProfile> = {
    entityName: 'پروفایل‌های شغلی',
    entityKey: 'job_profiles',
    items: profiles,
    csvHeaders: dynamicHeaders,
    templateSampleRows: [templateSampleRow],
    onImport: (importedItems, mode) => {`
);

code = code.replace(
/let items: ProfileItem\[\] = \[\];\s+if \(Array\.isArray\(item\.items\)\) \{[\s\S]*?\}\s+const newProfile/g,
`let items: ProfileItem[] = [];
        
        // Match dynamically from columns
        criteria.forEach(c => {
          const colName1 = \`crit_\${c.id}\`;
          const colName2 = \`وزن معیار: \${c.name} [\${c.code}]\`;
          let val = item[colName1] || item[colName2];
          if (!val) {
             // Fallback search for [code] in keys
             const foundKey = Object.keys(item).find(k => k.includes(\`[\${c.code}]\`));
             if (foundKey) val = item[foundKey];
          }
          if (val && !isNaN(Number(val))) {
             items.push({ cid: c.id, weight: Number(val), isCore: false });
          }
        });

        // Optional fallback: old summary string parsing
        if (items.length === 0) {
          const summaryStr = (item.itemsSummary || item['شاخص‌ها و اوزان'] || '').toString();
          if (summaryStr) {
            const segments = summaryStr.split(/[|,;]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            segments.forEach((seg: string) => {
              const match = seg.match(/(.+?)\s*\\((\\d+)%?\\)/);
              if (match) {
                const cCode = match[1].trim();
                const w = parseInt(match[2], 10);
                const matchedCrit = criteria.find(cr => cr.code === cCode);
                if (matchedCrit && !isNaN(w)) {
                  items.push({ cid: matchedCrit.id, weight: w, isCore: false });
                }
              }
            });
          }
        }

        const newProfile`
);

fs.writeFileSync('src/components/JobProfiles.tsx', code);
