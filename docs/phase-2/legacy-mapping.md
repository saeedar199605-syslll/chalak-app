# Legacy Mapping (Phase 2)

`scripts/migrate-legacy-state.ts` reads a legacy JSON state file from argv,
handles empty files (verified: `data/app_state.json` is 0 bytes / empty),
parses JSON, validates the root is an object, and recursively summarizes ONLY
key names, types, and counts - never values. Output is deterministic
(sorted keys). With `--out`, it writes a migration-plan JSON containing
metadata (including `unmappedFields`) and the shape tree; it contains no
source values and performs no D1 writes.

PII note: no source values or PII were copied into Phase 2 artifacts; the
original `data/app_state.json` is empty anyway.
