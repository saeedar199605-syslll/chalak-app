# Permission Matrix (Phase 2)

`src/permissions/matrix.ts` defines roles (admin, supervisor, employee),
resources (workspace, users, employees, evaluations, jobProfiles, rewards,
audit) and actions (read, create, update, delete, submit, approve, export).
`can()` denies by default. The matrix is intentionally conservative: for
example employees get read/submit on evaluations only, and row-level scoping
(e.g. employee sees own evaluation) must be enforced by callers. This module
is not yet wired into any enforcement point.
