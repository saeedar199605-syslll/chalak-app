export interface NormalDistributionResult {
  mean: number;
  stdDev: number;
  isInflated: boolean; // True if Grade A percentage > 25%
  distribution: { A: number; B: number; C: number; D: number; E: number };
  percentages: { A: number; B: number; C: number; D: number; E: number };
  outliers: Array<{ id: string; score: number; zScore: number; reason: string }>;
}

export function computeCalibrationStats(scores: Array<{ id: string; score: number }>): NormalDistributionResult {
  const valid = scores.filter(s => s.score > 0);
  if (!valid.length) {
    return {
      mean: 0,
      stdDev: 0,
      isInflated: false,
      distribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      percentages: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      outliers: []
    };
  }

  const n = valid.length;
  const values = valid.map(v => v.score);
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const outliers: Array<{ id: string; score: number; zScore: number; reason: string }> = [];

  for (const item of valid) {
    const s = item.score;
    if (s >= 90) dist.A++;
    else if (s >= 75) dist.B++;
    else if (s >= 60) dist.C++;
    else if (s >= 45) dist.D++;
    else dist.E++;

    if (stdDev > 0) {
      const zScore = (s - mean) / stdDev;
      if (Math.abs(zScore) >= 2.0) {
        outliers.push({
          id: item.id,
          score: s,
          zScore: Math.round(zScore * 100) / 100,
          reason: zScore > 0 ? 'نمره فوق‌العاده بالا نسبت به میانگین واحد' : 'نمره بسیار پایین نسبت به میانگین واحد'
        });
      }
    }
  }

  const aPercentage = Math.round((dist.A / n) * 100);

  return {
    mean: Math.round(mean * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    isInflated: aPercentage > 25,
    distribution: dist,
    percentages: {
      A: aPercentage,
      B: Math.round((dist.B / n) * 100),
      C: Math.round((dist.C / n) * 100),
      D: Math.round((dist.D / n) * 100),
      E: Math.round((dist.E / n) * 100)
    },
    outliers
  };
}
