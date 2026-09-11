const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

// I will rebuild the component render from the original logic.
// The issue is around line 351: `return (\n    <div className="space-y-6 text-right" dir="rtl">\n      {/* Header */}`

const properHeaderAndModal = `
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-400 p-2 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </span>
            مدیریت پروفایل‌های شغلی
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            تعریف شناسنامه ارزیابی برای هر شغل
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingId(null);
              setFormTitle('');
              setFormCode('');
              setFormFamily('');
              setFormBaseReward(undefined);
              setSelectedItems([]);
              setErrorMsg('');
              setIsModalOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            افزودن پروفایل جدید
          </button>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-slate-200">{p.title}</h3>
                 <div className="text-xs text-slate-400 mt-1 space-y-1">
                   <p>کد: <span className="font-mono text-teal-400">{p.code}</span></p>
                   <p>خانواده شغلی: {p.family}</p>
                   {p.baseRewardAmount ? <p className="text-emerald-400">ضریب پایه: {new Intl.NumberFormat('fa-IR').format(p.baseRewardAmount)} ریال</p> : null}
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => {
                    setEditingId(p.id);
                    setFormTitle(p.title);
                    setFormCode(p.code);
                    setFormFamily(p.family);
                    setFormBaseReward(p.baseRewardAmount);
                    setSelectedItems([...(p.items || [])]);
                    setErrorMsg('');
                    setIsModalOpen(true);
                 }} className="text-blue-400 hover:text-blue-300 text-xs">ویرایش</button>
                 <button onClick={() => onDeleteProfile(p.id)} className="text-rose-400 hover:text-rose-300 text-xs">حذف</button>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="font-black text-slate-100">{editingId ? 'ویرایش پروفایل' : 'افزودن پروفایل جدید'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">بستن</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 text-sm text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-300">عنوان شغلی</label>
                  <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: سرپرست تولید" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-300">کد شغلی</label>
                  <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: PRD-01" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-300">خانواده شغلی</label>
                  <input type="text" value={formFamily} onChange={e => setFormFamily(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مثال: تولید، مهندسی..." />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-300">ضریب ریالی (مبلغ پایه پاداش به ریال)</label>
                  <input type="number" value={formBaseReward || ''} onChange={e => setFormBaseReward(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 rounded-xl border bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="مبلغ پیش‌فرض (اختیاری)" />
                </div>
              </div>
`;

// Get the code before return
const beforeReturn = code.substring(0, code.indexOf('  return (\n    <div className="space-y-6 text-right" dir="rtl">\n      {/* Header */}'));

// Get the code from the Criterion Selector part
let afterCriterion = code.substring(code.indexOf('{/* Criterion Selector & Weighting list */}'));

code = beforeReturn + properHeaderAndModal + afterCriterion;

// Need to fix the bottom of the modal since I replaced it
code = code.replace(/document\.body\n      \)\}\n    <\/div>\n  \);\n\}/g, ''); // Clear the end to avoid duplication

const endOfFile = `
              {errorMsg && (
                <div className="mt-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300 font-bold">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors">انصراف</button>
              <button onClick={editingId ? handleConfirmUpdate : handleConfirmAdd} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-teal-900/50 transition-all">{editingId ? 'ذخیره تغییرات' : 'ثبت پروفایل جدید'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
`;

// The problem is `afterCriterion` has some closing divs from the messed up replacement
code = code.substring(0, code.indexOf('{/* Add / Edit Modal */}')) || code; 
if(code.indexOf('              {/* Criterion Selector & Weighting list */}') !== -1){
    let c = code.substring(0, code.indexOf('{/* Criterion Selector & Weighting list */}'));
    let part2 = code.substring(code.indexOf('{/* Criterion Selector & Weighting list */}'));
    // Truncate part2 where the modal footer begins
    part2 = part2.substring(0, part2.indexOf('<div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300 leading-relaxed">') !== -1 ? part2.indexOf('<div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300 leading-relaxed">') : part2.length);
    code = c + part2 + endOfFile;
} else {
    // Just append
    code += endOfFile;
}

fs.writeFileSync('src/components/JobProfiles.tsx', code);
console.log('Done rewriting.');
