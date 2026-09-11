const fs = require('fs');

let code = fs.readFileSync('src/components/RewardCalculationCenter.tsx', 'utf-8');

// 1. Add manualOverrides state
if (!code.includes("const [manualOverrides, setManualOverrides] = useState")) {
  code = code.replace("const [selectedPeriod, setSelectedPeriod] = useState<string>('all');", "const [selectedPeriod, setSelectedPeriod] = useState<string>('all');\n  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});");
}

// 2. Inject manual override into displayData useMemo
if (!code.includes("const override = manualOverrides[`${ev.empId}_${ev.period}`];")) {
  code = code.replace("const finalReward = evaluateFormula(config.formula || 'baseAmount * multiplier', { score, baseAmount, multiplier });", "let finalReward = evaluateFormula(config.formula || 'baseAmount * multiplier', { score, baseAmount, multiplier });\n      const override = manualOverrides[`${ev.empId}_${ev.period}`];\n      if (override !== undefined) finalReward = override;");
}

// 3. Make Final Reward cell an input in Preview table
const tdCode = `
                          <td className="px-4 py-3 text-left font-black text-teal-400 font-mono text-base">
                            <input 
                              type="number" 
                              value={d.finalReward}
                              onChange={(e) => setManualOverrides({ ...manualOverrides, [\`\${d.empId}_\${d.period}\`]: Number(e.target.value) })}
                              className="bg-slate-900 border border-slate-700 text-teal-400 font-mono text-left px-2 py-1 rounded w-32 focus:border-teal-500 outline-none"
                            />
                          </td>
`;
code = code.replace(/<td className="px-4 py-3 text-left font-black text-teal-400 font-mono text-base">\n\s*\{new Intl\.NumberFormat\('fa-IR'\)\.format\(d\.finalReward\)\}\n\s*<\/td>/, tdCode);

// 4. Update the Batch History delete button to ALSO clear evaluations
const deleteCode = `
                        onClick={() => {
                          if (!confirm('آیا از حذف این تاریخچه و پاکسازی مبلغ پاداش پرسنل مربوطه اطمینان دارید؟')) return;
                          // Clear finalReward for all records in this batch
                          if (onBulkUpdateEvaluations) {
                             const evalsToUpdate = batch.records.map((r: any) => {
                               const ev = evaluations.find(e => e.empId === r.empId && e.period === r.period);
                               if (ev) return { ...ev, finalReward: undefined };
                               return null;
                             }).filter(Boolean);
                             if(evalsToUpdate.length > 0) onBulkUpdateEvaluations(evalsToUpdate);
                          }
                          const updated = batchHistory.filter(b => b.id !== batch.id);
                          db.saveMiscData('pe_reward_batch_history', updated);
                          setBatchHistory(updated);
                        }}
`;
code = code.replace(/onClick=\{\(\) => \{\n\s*const updated = batchHistory\.filter\(b => b\.id !== batch\.id\);\n\s*db\.saveMiscData\('pe_reward_batch_history', updated\);\n\s*setBatchHistory\(updated\);\n\s*\}\}/, deleteCode);

fs.writeFileSync('src/components/RewardCalculationCenter.tsx', code);
console.log('Patched RewardCalculationCenter.tsx');
