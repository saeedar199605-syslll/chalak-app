import { describe, it, expect } from 'vitest';
import { calculateWeightedScore, getGrade } from '../src/utils/scoring';

describe('Performance Evaluation Scoring Engine', () => {
  it('correctly calculates weighted average on 100 scale', () => {
    const scores = [
      { cid: 'c1', weight: 40, value: 5 }, // 40 * 5 = 200
      { cid: 'c2', weight: 60, value: 4 }  // 60 * 4 = 240
    ];
    // sum = 440 / 100 = 4.4 avg5
    // 4.4 * 20 = 88.0 on 100 scale
    const res = calculateWeightedScore(scores);
    expect(res.totalScore).toBe(88.0);
    expect(res.avg5).toBe(4.4);
    expect(res.grade).toBe('B');
  });

  it('maps scores to correct grades A to E', () => {
    expect(getGrade(95)).toBe('A');
    expect(getGrade(90)).toBe('A');
    expect(getGrade(89.9)).toBe('B');
    expect(getGrade(75)).toBe('B');
    expect(getGrade(60)).toBe('C');
    expect(getGrade(45)).toBe('D');
    expect(getGrade(40)).toBe('E');
  });

  it('detects missing documentation for boundary scores 1, 2, and 5', () => {
    const scores = [
      { cid: 'c1', weight: 50, value: 5, doc: 'Short' }, // length 5 is border, but let's test short < 5
      { cid: 'c2', weight: 50, value: 1, doc: '' }
    ];
    const res = calculateWeightedScore([
      { cid: 'c1', weight: 50, value: 5, doc: 'ok' },
      { cid: 'c2', weight: 50, value: 1, doc: '' }
    ]);
    expect(res.missingEvidenceCount).toBe(2);
  });

  it('triggers safety veto when mandatory HSE indicator S-01 fails', () => {
    const scores = [
      { cid: 'c1', code: 'S-01', weight: 20, value: 1, doc: 'حادثه کارگاهی شدید' },
      { cid: 'c2', weight: 80, value: 5, doc: 'عملکرد تولید عالی و بی‌نقص' }
    ];
    const res = calculateWeightedScore(scores);
    expect(res.hasSafetyVeto).toBe(true);
  });

  it('computes self vs manager score gap', () => {
    const scores = [
      { cid: 'c1', weight: 50, value: 4, self: 5 }, // gap = 1
      { cid: 'c2', weight: 50, value: 3, self: 5 }  // gap = 2
    ];
    const res = calculateWeightedScore(scores);
    expect(res.selfManagerGap).toBe(1.5);
  });
});
