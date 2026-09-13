# Formula Characterization (Phase 2)

The formula engine (`src/utils/formulaEngine.ts`, whole file) remains the
single source of truth; `src/domain/formulas.ts` only re-exports.

Characterization tests live in `src/__tests__/domain.characterization.test.ts`
and import the engine directly. They pin:
- presence of `DEFAULT_KPI_THRESHOLDS` and `DEFAULT_INVERSE_THRESHOLDS`,
- `safeEvaluateMath` on a valid and an invalid expression,
- `calculateKpiScore` rounding/clamping (conservative bounds [0, 100]).

Limitation: the exact clamp bounds and rounding digits in the engine were not
independently re-verified beyond reading the source; tests assert conservative
bounds only. Vitest is not installed; run
`npm install -D vitest && npx vitest run` to execute. package.json untouched.
