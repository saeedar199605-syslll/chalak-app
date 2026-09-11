const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

// Add state for baseRewardAmount
if (!code.includes('const [formBaseReward, setFormBaseReward] = useState<number | undefined>(undefined);')) {
  code = code.replace(
    /const \[formFamily, setFormFamily\] = useState\(''\);/,
    "const [formFamily, setFormFamily] = useState('');\n  const [formBaseReward, setFormBaseReward] = useState<number | undefined>(undefined);"
  );
  
  // reset form
  code = code.replace(
    /setFormFamily\(''\);/,
    "setFormFamily('');\n    setFormBaseReward(undefined);"
  );
  
  // set editing
  code = code.replace(
    /setFormFamily\(prof\.family\);/,
    "setFormFamily(prof.family);\n    setFormBaseReward(prof.baseRewardAmount);"
  );
  
  // validate/submit
  code = code.replace(
    /family: formFamily,/,
    "family: formFamily,\n      baseRewardAmount: formBaseReward,"
  );

  fs.writeFileSync('src/components/JobProfiles.tsx', code);
  console.log('JobProfiles.tsx state patched.');
}
