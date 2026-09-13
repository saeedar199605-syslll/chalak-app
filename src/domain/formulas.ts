/**
 * Phase 2 - Domain formula compatibility re-exports.
 *
 * The authoritative implementations remain in `../utils/formulaEngine`.
 * This module only re-exports them so that domain-layer code can depend on
 * a stable `src/domain` boundary. No behavior is duplicated or changed here;
 * the formula engine stays the single source of truth.
 */
export {
  DEFAULT_KPI_THRESHOLDS,
  DEFAULT_INVERSE_THRESHOLDS,
  safeEvaluateMath,
  calculateKpiScore,
  calculateMultiSourceCompositeScore,
  calculateFinalScore,
} from '../utils/formulaEngine';
