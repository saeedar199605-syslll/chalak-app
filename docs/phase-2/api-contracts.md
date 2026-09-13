# API Contracts (Phase 2)

`src/contracts/index.ts` defines conservative zod schemas: IdSchema (nonempty,
max 128), VersionSchema (nonnegative int), TimestampSchema, ErrorSchema,
generic `ApiSuccessSchema` helper, `ApiErrorSchema`, `PaginationSchema`,
`EvaluationStatusSchema` (draft/submitted/approved/rejected - the source may
support more statuses; widen after verification), ScoreInput, evaluation
create/update/submit, minimal passthrough Workspace/User/Employee/Evaluation
schemas, a `RealtimeEventSchema` discriminated-union base, and
`OptimisticConflictSchema`. TS types are inferred with `z.infer`.
`z.uuid()` is deliberately avoided for compatibility. These are additive
scaffolding; no existing code path was changed to use them yet.
