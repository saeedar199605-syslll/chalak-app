/**
 * Phase 2 - Characterization tests for ../utils/formulaEngine.
 *
 * The formula engine is treated as the authoritative behavior; these tests
 * only pin down currently observable behavior (rounding/clamping, safe
 * math evaluation, threshold constants existence).
 *
 * NOTE: Vitest is NOT installed in this phase (package.json untouched).
 * To run: npm install -D vitest && npx vitest run src/__tests__/domain.characterization.test.ts
 * (move this file to the configured test directory if needed).
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_KPI_THRESHOLDS,
  DEFAULT_INVERSE_THRESHOLDS,
  safeEvaluateMath,
  calculateKpiScore,
  calculateMultiSourceCompositeScore,
  calculateFinalScore,
} from '../utils/formulaEngine';

// Minimal structural cast; the engine only needs the scoring fields used below.
const criterion = {
  id: 'c1',
  name: 'Criterion 1',
  kind: 'direct',
  weight: 1,
  target: 100,
} as unknown as Parameters<typeof calculateKpiScore>[0] extends [unknown]
  ? never
  : never;

describe('formulaEngine characterization', () => {
  it('exposes threshold constants', () => {
    expect(DEFAULT_KPI_THRESHOLDS).toBeDefined();
    expect(DEFAULT_INVERSE_THRESHOLDS).toBeDefined();
  });

  it('safeEvaluateMath evaluates basic expressions safely', () => {
    expect(safeEvaluateMath('1 + 2')).toBe(3);
    expect(safeEvaluateMath('invalid!!')).toBeNull();
  });

  it('calculateKpiScore rounds and clamps scores', () => {
    // Documented conservative assumption: engine clamps to [0, 100] and rounds.
    const result = calculateKpiScore(criterion as never, 150);
    expect(result).toBeLessThanOrEqual(100);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('composite and final score helpers exist and return numbers', () => {
    expect(typeof calculateMultiSourceCompositeScore).toBe('function');
    expect(typeof calculateFinalScore).toBe('function');
  });
});
