const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

if (!code.includes('RewardCoefficient')) {
  code += `
export interface RewardCoefficient {
  jobFamily: string; // "all" for default, or specific family like "تولید"
  baseAmount: number; // Base reward in IRR/Toman
}

export interface PerformanceMultiplier {
  minScore: number;
  maxScore: number;
  multiplier: number;
}

export interface RewardConfig {
  coefficients: RewardCoefficient[];
  multipliers: PerformanceMultiplier[];
}
`;
  fs.writeFileSync('src/types.ts', code);
  console.log('Reward types added.');
} else {
  console.log('Reward types already exist.');
}
