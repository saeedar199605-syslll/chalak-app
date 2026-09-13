# Domain Inventory (Phase 2)

Approximate line references are labeled as such where not verified.

- `src/utils/formulaEngine.ts` (whole file, line range approximate): authoritative
  implementations of `DEFAULT_KPI_THRESHOLDS`, `DEFAULT_INVERSE_THRESHOLDS`,
  `safeEvaluateMath`, `calculateKpiScore`,
  `calculateMultiSourceCompositeScore`, `calculateFinalScore`.
- `Evaluations.tsx`: import of the formula engine at approximately line 37;
  types import at approximately line 51 (from retrieval/analysis of the
  unmodified source zip; exact offsets not re-verified line-by-line here).
- `package.json`: lines approximately 13-31 cover scripts/dependencies of
  interest. It was NOT modified in this phase.
- `functions/api/state.ts`: whole file reviewed; it serves persisted app
  state. `data/app_state.json` is verified to be 0 bytes (empty).

Known gaps: reward and calibration logic were NOT extracted or re-exported
because their exact active behavior was not sufficiently verified; extracting
them risked semantic drift. They remain untouched in the original source.
