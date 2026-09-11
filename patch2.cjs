const fs = require('fs');
let code = fs.readFileSync('src/components/Employees.tsx', 'utf-8');

// Replace emp.name with <HighlightText text={emp.name} highlight={searchTerm} />
code = code.replace(/<h4 className="font-bold text-slate-100 truncate">\{emp.name\}<\/h4>/g, '<h4 className="font-bold text-slate-100 truncate"><HighlightText text={emp.name} highlight={searchTerm} /></h4>');
code = code.replace(/<h3 className="text-sm font-bold text-slate-100">\{emp.name\}<\/h3>/g, '<h3 className="text-sm font-bold text-slate-100"><HighlightText text={emp.name} highlight={searchTerm} /></h3>');

// Replace emp.unit with <HighlightText text={emp.unit} highlight={searchTerm} />
code = code.replace(/<span className="text-\[10px\] text-slate-400 truncate block">\{emp.unit\}<\/span>/g, '<span className="text-[10px] text-slate-400 truncate block"><HighlightText text={emp.unit} highlight={searchTerm} /></span>');
// Grid view unit
code = code.replace(/<Building2 className="w-3.5 h-3.5" \/>\s*\{emp.unit\}/g, '<Building2 className="w-3.5 h-3.5" /> <HighlightText text={emp.unit} highlight={searchTerm} />');


// Replace emp.code
code = code.replace(/<div>\{emp.code\}<\/div>/g, '<div><HighlightText text={emp.code} highlight={searchTerm} /></div>');
code = code.replace(/<p className="text-\[10px\] text-slate-500 font-mono mt-0.5">\{emp.code\}/g, '<p className="text-[10px] text-slate-500 font-mono mt-0.5"><HighlightText text={emp.code} highlight={searchTerm} />');


// Profile Title
// Grid view
code = code.replace(/<Layers className="w-3.5 h-3.5" \/>\s*\{profile\?.title \|\| 'بدون پروفایل'\}/g, '<Layers className="w-3.5 h-3.5" /> <HighlightText text={profile?.title || \'بدون پروفایل\'} highlight={searchTerm} />');
// Table view
code = code.replace(/<div className="text-xs text-slate-200 truncate">\s*\{profile\?.title \|\| <span className="text-slate-500 text-\[10px\]">بدون پروفایل<\/span>\}\s*<\/div>/g, 
`<div className="text-xs text-slate-200 truncate">
                      {profile?.title ? <HighlightText text={profile.title} highlight={searchTerm} /> : <span className="text-slate-500 text-[10px]">بدون پروفایل</span>}
                    </div>`);

fs.writeFileSync('src/components/Employees.tsx', code);
