import { describe, it, expect } from 'vitest';
import { computeCalibrationStats } from '../src/utils/calibration';

describe('Calibration & Normal Distribution Engine', () => {
  it('correctly calculates mean, standard deviation, and grade percentages', () => {
    const scores = [
      { id: '1', score: 95 }, // A
      { id: '2', score: 85 }, // B
      { id: '3', score: 70 }, // C
      { id: '4', score: 50 }, // D
      { id: '5', score: 30 }  // E
    ];
    const stats = computeCalibrationStats(scores);
    expect(stats.mean).toBe(66);
    expect(stats.percentages.A).toBe(20);
    expect(stats.percentages.B).toBe(20);
    expect(stats.percentages.C).toBe(20);
    expect(stats.percentages.D).toBe(20);
    expect(stats.percentages.E).toBe(20);
    expect(stats.isInflated).toBe(false);
  });

  it('flags inflation when Grade A exceeds 25%', () => {
    const scores = [
      { id: '1', score: 95 },
      { id: '2', score: 92 },
      { id: '3', score: 90 },
      { id: '4', score: 70 }
    ];
    const stats = computeCalibrationStats(scores);
    expect(stats.percentages.A).toBe(75);
    expect(stats.isInflated).toBe(true);
  });

  it('detects statistical outliers when |Z-Score| >= 2.0', () => {
    // 9 people with score 70, and 1 person with score 10
    const scores = [
      ...Array(9).fill(0).map((_, i) => ({ id: `e${i}`, score: 70 })),
      { id: 'outlier', score: 10 }
    ];
    const stats = computeCalibrationStats(scores);
    const outlier = stats.outliers.find(o => o.id === 'outlier');
    expect(outlier).toBeDefined();
    expect(outlier!.zScore).toBeLessThan(-2.0);
  });
});
