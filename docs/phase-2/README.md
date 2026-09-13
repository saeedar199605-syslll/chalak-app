# Phase 2 README

Additive scaffolding phase. New artifacts:
- `src/domain/formulas.ts`, `src/domain/index.ts`
- `src/contracts/index.ts`
- `src/permissions/matrix.ts`
- `migrations/0001_core.sql`
- `src/__tests__/domain.characterization.test.ts`
- `scripts/migrate-legacy-state.ts`
- `docs/phase-2/*.md`

Nothing in the original codebase (including package.json) was modified.
To run characterization tests: `npm install -D vitest && npx vitest run`.
To validate the schema locally: apply `migrations/0001_core.sql` to SQLite or
D1. See `docs/phase-2/verification.md` for the executed checks.
