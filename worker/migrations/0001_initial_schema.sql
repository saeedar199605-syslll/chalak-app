-- Migration: 0001_initial_schema.sql
-- Cloudflare D1 Relational Schema for Chalak Performance & Coaching

PRAGMA foreign_keys = ON;

-- 1. Departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'hr', 'manager', 'evaluator', 'employee', 'viewer')),
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);

-- 3. Employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  personnel_code TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job TEXT NOT NULL,
  unit TEXT NOT NULL,
  manager_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  profile_id TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(personnel_code);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_workspace ON employees(workspace_id);

-- 4. Criteria table
CREATE TABLE IF NOT EXISTS criteria (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('K', 'Q', 'B', 'S', 'L')),
  description TEXT NOT NULL,
  min_score REAL NOT NULL DEFAULT 1.0,
  max_score REAL NOT NULL DEFAULT 5.0,
  is_mandatory INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  dir TEXT NOT NULL DEFAULT 'more' CHECK (dir IN ('more', 'less')),
  scoring_source TEXT NOT NULL DEFAULT 'supervisor' CHECK (scoring_source IN ('supervisor', 'mis', 'kasra', 'system', 'multi_source')),
  mis_metric_key TEXT,
  calculation_type TEXT NOT NULL DEFAULT 'ratio' CHECK (calculation_type IN ('ratio', 'inverse_ratio', 'defect_rate', 'custom_formula', 'direct_score')),
  formula_expression TEXT,
  target_value REAL,
  score_thresholds_json TEXT,
  variables_json TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_criteria_code ON criteria(code);
CREATE INDEX IF NOT EXISTS idx_criteria_category ON criteria(category);

-- 5. Job Profiles table
CREATE TABLE IF NOT EXISTS job_profiles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  family TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  locked INTEGER NOT NULL DEFAULT 0,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_job_profiles_code ON job_profiles(code);

-- 6. Job Profile Criteria table (Association & Weights)
CREATE TABLE IF NOT EXISTS job_profile_criteria (
  id TEXT PRIMARY KEY,
  job_profile_id TEXT NOT NULL REFERENCES job_profiles(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  weight REAL NOT NULL CHECK (weight >= 5.0 AND weight <= 50.0),
  target REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(job_profile_id, criterion_id)
);

CREATE INDEX IF NOT EXISTS idx_jpc_profile ON job_profile_criteria(job_profile_id);

-- 7. Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  evaluator_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  profile_id TEXT NOT NULL REFERENCES job_profiles(id) ON DELETE RESTRICT,
  cycle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calibrated', 'locked')),
  stage TEXT NOT NULL DEFAULT 'supervisor_review' CHECK (stage IN ('self_review', 'supervisor_review', 'peer_review', 'calibration_review', 'hr_approval', 'feedback_meeting', 'completed', 'rejected', 'appealed')),
  current_assignee_id TEXT REFERENCES users(id),
  total_score REAL NOT NULL DEFAULT 0.0,
  performance_level TEXT,
  potential_level TEXT,
  nine_box_position TEXT,
  submitted_at TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_evaluations_employee ON evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_cycle ON evaluations(cycle);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_workspace ON evaluations(workspace_id);

-- 8. Evaluation Scores table
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL REFERENCES criteria(id) ON DELETE RESTRICT,
  weight REAL NOT NULL,
  self_score REAL NOT NULL DEFAULT 0.0,
  manager_score REAL NOT NULL DEFAULT 0.0,
  final_score REAL NOT NULL DEFAULT 0.0,
  peer_score REAL,
  evidence TEXT,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(evaluation_id, criterion_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_evaluation ON evaluation_scores(evaluation_id);

-- 9. Coaching Sessions table
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  generated_by TEXT NOT NULL REFERENCES users(id),
  ai_model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coaching_eval ON coaching_sessions(evaluation_id);

-- 10. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_value_json TEXT,
  new_value_json TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- 11. Workspace Events (Real-time history & Reconnect sync)
CREATE TABLE IF NOT EXISTS workspace_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_workspace_version ON workspace_events(workspace_id, version);

-- 12. File Backups Metadata table (Stored in R2)
CREATE TABLE IF NOT EXISTS file_backups (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL DEFAULT 'default_org',
  file_name TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
