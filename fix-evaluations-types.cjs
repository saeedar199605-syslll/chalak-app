const fs = require('fs');

['src/components/Evaluations.tsx', 'src/components/MyEvaluation.tsx', 'src/components/Reports.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(
    /const evaluateFormula = \(formula, variables\) => \{/g,
    "const evaluateFormula = (formula: string, variables: Record<string, number>) => {"
  );
  fs.writeFileSync(file, code);
});
console.log('Fixed types in evaluateFormula');
