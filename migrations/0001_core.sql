-- Phase 2 - Core D1/SQLite schema (additive scaffolding).
-- Text IDs, integer versions, ISO-8601 text timestamps.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  UNIQUE (workspace_id, email)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('admin', 'supervisor', 'employee'))
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  PRIMARY KEY (user_id, role_id, workspace_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  department_id TEXT,
  user_id TEXT,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS criteria (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('direct', 'inverse')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS job_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS job_profile_criteria (
  job_profile_id TEXT NOT NULL,
  criteria_id TEXT NOT NULL,
  weight REAL NOT NULL CHECK (weight >= 0),
  PRIMARY KEY (job_profile_id, criteria_id),
  FOREIGN KEY (job_profile_id) REFERENCES job_profiles(id),
  FOREIGN KEY (criteria_id) REFERENCES criteria(id)
);

CREATE TABLE IF NOT EXISTS evaluation_cycles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  cycle_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  evaluator_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (cycle_id) REFERENCES evaluation_cycles(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id),
  UNIQUE (cycle_id, employee_id)
);

CREATE TABLE IF NOT EXISTS evaluation_scores (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL,
  criteria_id TEXT NOT NULL,
  value REAL NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
  FOREIGN KEY (criteria_id) REFERENCES criteria(id),
  UNIQUE (evaluation_id, criteria_id)
);

CREATE TABLE IF NOT EXISTS evaluation_status_history (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
  FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  coach_id TEXT,
  scheduled_at TEXT NOT NULL,
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (coach_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workspace_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  created_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (key, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 0),
  created_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 0),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'done', 'failed')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_departments_workspace ON departments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_workspace ON user_roles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_employees_workspace ON employees(workspace_id);
CREATE INDEX IF NOT EXISTS idx_criteria_workspace ON criteria(workspace_id);
CREATE INDEX IF NOT EXISTS idx_job_profiles_workspace ON job_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cycles_workspace ON evaluation_cycles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_workspace ON evaluations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_scores_evaluation ON evaluation_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_history_evaluation ON evaluation_status_history(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_coaching_workspace ON coaching_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_events_workspace ON workspace_events(workspace_id);

INSERT OR IGNORE INTO roles (id, name) VALUES ('role_admin', 'admin');
INSERT OR IGNORE INTO roles (id, name) VALUES ('role_supervisor', 'supervisor');
INSERT OR IGNORE INTO roles (id, name) VALUES ('role_employee', 'employee');
