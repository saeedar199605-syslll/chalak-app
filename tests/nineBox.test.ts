import { describe, it, expect } from 'vitest';
import { calculateWeightedScore } from '../src/utils/scoring';

describe('9-Box Grid Placement Engine', () => {
  it('places employee in "star" box when both performance and potential are high', () => {
    const scores = [
      { cid: 'c1', category: 'K' as const, weight: 50, value: 5 }, // Perf
      { cid: 'c2', category: 'B' as const, weight: 25, value: 5 }, // Pot
      { cid: 'c3', category: 'L' as const, weight: 25, value: 5 }  // Pot
    ];
    const res = calculateWeightedScore(scores);
    expect(res.performanceLevel).toBe('high');
    expect(res.potentialLevel).toBe('high');
    expect(res.nineBoxPosition).toBe('star');
  });

  it('places employee in "enigma" box when performance is low but potential is high', () => {
    const scores = [
      { cid: 'c1', category: 'K' as const, weight: 60, value: 2 }, // Low perf: 2 * 20 = 40
      { cid: 'c2', category: 'B' as const, weight: 20, value: 5 }, // High pot: 5 * 20 = 100
      { cid: 'c3', category: 'L' as const, weight: 20, value: 5 }
    ];
    const res = calculateWeightedScore(scores);
    expect(res.performanceLevel).toBe('low');
    expect(res.potentialLevel).toBe('high');
    expect(res.nineBoxPosition).toBe('enigma');
  });

  it('places employee in "underperformer" box when both performance and potential are low', () => {
    const scores = [
      { cid: 'c1', category: 'K' as const, weight: 50, value: 2 },
      { cid: 'c2', category: 'B' as const, weight: 50, value: 2 }
    ];
    const res = calculateWeightedScore(scores);
    expect(res.performanceLevel).toBe('low');
    expect(res.potentialLevel).toBe('low');
    expect(res.nineBoxPosition).toBe('underperformer');
  });
});
