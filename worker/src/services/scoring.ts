export interface ScoreCalcItem {
  cid: string;
  weight: number;
  value: number; // 1-5 manager score
  self?: number; // 1-5 self score
  category?: 'K' | 'Q' | 'B' | 'S' | 'L';
  code?: string;
  doc?: string;
}

export interface RecalculatedEvaluationResult {
  totalScore: number; // 0 to 100
  avg5: number;       // 1.0 to 5.0
  performanceLevel: 'low' | 'medium' | 'high';
  potentialLevel: 'low' | 'medium' | 'high';
  nineBoxPosition: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  hasSafetyVeto: boolean;
  missingEvidenceCount: number;
  selfManagerGap: number;
}

export const MANDATORY_SAFETY_CODE = 'S-01';
export const NEED_DOCUMENT_SCORES = [1, 2, 5];

export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'E';
}

export function recalculateEvaluation(scores: ScoreCalcItem[]): RecalculatedEvaluationResult {
  const scoredItems = scores.filter(s => s.value > 0);
  if (scoredItems.length === 0) {
    return {
      totalScore: 0,
      avg5: 0,
      performanceLevel: 'low',
      potentialLevel: 'low',
      nineBoxPosition: 'underperformer',
      grade: 'E',
      hasSafetyVeto: false,
      missingEvidenceCount: 0,
      selfManagerGap: 0
    };
  }

  const totalWeight = scoredItems.reduce((acc, curr) => acc + curr.weight, 0);
  const weightedSum = scoredItems.reduce((acc, curr) => acc + (curr.value * curr.weight), 0);
  const avg5 = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const totalScore = Math.round(avg5 * 20 * 10) / 10; // Scaled to 100 with 1 decimal place

  // Check mandatory safety indicator S-01
  const safetyItem = scores.find(s => s.code === MANDATORY_SAFETY_CODE || s.category === 'S');
  const hasSafetyVeto = Boolean(safetyItem && safetyItem.value > 0 && safetyItem.value <= 1.5);

  // Check documentation requirements for boundary scores 1, 2, and 5
  let missingEvidenceCount = 0;
  for (const s of scores) {
    if (NEED_DOCUMENT_SCORES.includes(Math.round(s.value))) {
      if (!s.doc || s.doc.trim().length < 5) {
        missingEvidenceCount++;
      }
    }
  }

  // Calculate self vs manager score gap
  let totalGap = 0;
  let gapCount = 0;
  for (const s of scores) {
    if (s.value > 0 && s.self !== undefined && s.self > 0) {
      totalGap += Math.abs(s.value - s.self);
      gapCount++;
    }
  }
  const selfManagerGap = gapCount > 0 ? Math.round((totalGap / gapCount) * 10) / 10 : 0;

  // Potential calculation based on Behavioral (B) and Leadership (L) categories
  const potentialItems = scores.filter(s => s.category === 'B' || s.category === 'L');
  const potentialAvg5 = potentialItems.length > 0
    ? potentialItems.reduce((sum, s) => sum + (s.value || 3), 0) / potentialItems.length
    : avg5 * 0.95;
  const potentialScore100 = Math.round(potentialAvg5 * 20 * 10) / 10;

  // Bucketing: Performance
  let performanceLevel: 'low' | 'medium' | 'high' = 'medium';
  if (totalScore >= 83) performanceLevel = 'high';
  else if (totalScore < 65) performanceLevel = 'low';

  // Bucketing: Potential
  let potentialLevel: 'low' | 'medium' | 'high' = 'medium';
  if (potentialScore100 >= 82) potentialLevel = 'high';
  else if (potentialScore100 < 65) potentialLevel = 'low';

  // 9-Box Matrix determination
  let nineBoxPosition = 'core';
  if (potentialLevel === 'high' && performanceLevel === 'high') nineBoxPosition = 'star';
  else if (potentialLevel === 'high' && performanceLevel === 'medium') nineBoxPosition = 'high_potential';
  else if (potentialLevel === 'high' && performanceLevel === 'low') nineBoxPosition = 'enigma';
  else if (potentialLevel === 'medium' && performanceLevel === 'high') nineBoxPosition = 'high_performer';
  else if (potentialLevel === 'medium' && performanceLevel === 'medium') nineBoxPosition = 'core';
  else if (potentialLevel === 'medium' && performanceLevel === 'low') nineBoxPosition = 'dilemma';
  else if (potentialLevel === 'low' && performanceLevel === 'high') nineBoxPosition = 'trusted_expert';
  else if (potentialLevel === 'low' && performanceLevel === 'medium') nineBoxPosition = 'effective_worker';
  else if (potentialLevel === 'low' && performanceLevel === 'low') nineBoxPosition = 'underperformer';

  return {
    totalScore,
    avg5: Math.round(avg5 * 100) / 100,
    performanceLevel,
    potentialLevel,
    nineBoxPosition,
    grade: getGrade(totalScore),
    hasSafetyVeto,
    missingEvidenceCount,
    selfManagerGap
  };
}
