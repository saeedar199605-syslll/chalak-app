const fs = require('fs');

let engine = fs.readFileSync('src/utils/formulaEngine.ts', 'utf-8');

if (!engine.includes('calculateFinalScore')) {
  engine += `
// Single source of truth for evaluation final score
import { Evaluation, JobProfile } from '../types';

export const SCALE_FACTOR = 20;

export function calculateFinalScore(ev: Evaluation, profiles?: JobProfile[]): number {
  if (!ev || !ev.scores || !Array.isArray(ev.scores)) return 0;
  
  const scoredItems = ev.scores.filter(s => s.value > 0);
  if (!scoredItems.length) return 0;

  // If profiles are provided and the evaluation is not locked/calibrated, use the live weights from the profile.
  // Otherwise, use the snapshot weights saved inside the evaluation.
  let profile = profiles ? profiles.find(p => p.id === ev.profileId) : undefined;
  let useLiveWeights = profile && (ev.status === 'draft' || ev.status === 'in_progress');

  let totalWeight = 0;
  let weightedSum = 0;

  scoredItems.forEach(s => {
    let weight = s.weight;
    if (useLiveWeights && profile) {
      const profItem = profile.items.find(pi => pi.criterionId === s.cid);
      if (profItem && profItem.weight) {
        weight = profItem.weight;
      }
    }
    totalWeight += weight;
    weightedSum += (s.value * weight);
  });

  if (totalWeight === 0) return 0;
  
  const avg5 = weightedSum / totalWeight;
  return Math.round(avg5 * SCALE_FACTOR * 10) / 10;
}
`;
  fs.writeFileSync('src/utils/formulaEngine.ts', engine);
  console.log('Added calculateFinalScore to formulaEngine.ts');
}
