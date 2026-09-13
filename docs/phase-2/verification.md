# Verification (Phase 2)

- Original zip contains 180 entries; all 180 were copied byte-for-byte into
  `chalak-app-phase-2.zip` and SHA-256 of every original entry was compared
  between input and output (all match; see phase-2-report.json).
- No `node_modules` entries exist in the output zip.
- `migrations/0001_core.sql` was applied to an in-memory SQLite database with
  `PRAGMA foreign_keys = ON` and executed without error; all 21 tables and
  seeded roles verified present.
- package.json and all other original files are unmodified (byte-identical).
- Limitation: TypeScript/zod/Vitest compilation was not executed (dependencies
  not installed); static review only.
- Limitation: source line numbers cited in docs are approximate where noted.
