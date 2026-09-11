const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

// Find where formFamily is rendered and insert formBaseReward
const insertUI = `
                <div>
                  <label className={\`block text-sm font-bold mb-1 \${isDark ? 'text-slate-300' : 'text-slate-700'}\`}>خانواده شغلی</label>
                  <input
                    type="text"
                    value={formFamily}
                    onChange={e => setFormFamily(e.target.value)}
                    className={\`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 \${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'}\`}
                    placeholder="مثال: تولید، مهندسی..."
                  />
                </div>
                <div>
                  <label className={\`block text-sm font-bold mb-1 \${isDark ? 'text-slate-300' : 'text-slate-700'}\`}>ضریب ریالی (مبلغ پایه پاداش به ریال)</label>
                  <input
                    type="number"
                    value={formBaseReward || ''}
                    onChange={e => setFormBaseReward(e.target.value ? Number(e.target.value) : undefined)}
                    className={\`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 \${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'}\`}
                    placeholder="مبلغ پیش‌فرض (اختیاری)"
                  />
                </div>
`;

if (!code.includes('ضریب ریالی (مبلغ پایه پاداش به ریال)')) {
  // Try to match the formFamily block to replace it
  const regex = /<div>[\s\S]*?value=\{formFamily\}[\s\S]*?<\/div>/;
  if (regex.test(code)) {
    code = code.replace(regex, insertUI);
    fs.writeFileSync('src/components/JobProfiles.tsx', code);
    console.log('UI patched.');
  } else {
    console.log('Regex for UI failed.');
  }
} else {
  console.log('UI already patched.');
}
