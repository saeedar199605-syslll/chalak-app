# D1 Schema (Phase 2)

`migrations/0001_core.sql` creates the full core schema for SQLite/D1:
workspaces, departments, users, sessions, roles, user_roles, employees,
criteria, job_profiles, job_profile_criteria, evaluation_cycles, evaluations,
evaluation_scores, evaluation_status_history, coaching_sessions, audit_logs,
workspace_events, idempotency_keys, files, backups, export_jobs.

Conventions: TEXT primary keys, INTEGER `version` with CHECK >= 0, ISO-8601
TEXT timestamps, FKs with `PRAGMA foreign_keys = ON`, unique constraints
(e.g. UNIQUE(cycle_id, employee_id) on evaluations, UNIQUE(workspace_id, email)
on users), CHECK constraints, and per-workspace indexes. Roles admin /
supervisor / employee are seeded with INSERT OR IGNORE. The SQL was validated
against an in-memory SQLite database (see verification.md and
phase-2-report.json). No SQL functions unsupported by SQLite were used.
