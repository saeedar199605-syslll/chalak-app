/**
 * Phase 2 - Conservative permission matrix.
 * Default is DENY; access must be explicitly granted. No behavior in the
 * existing app is changed by this module; it is scaffolding for enforcement.
 */
export type Role = 'admin' | 'supervisor' | 'employee';
export type Resource =
  | 'workspace'
  | 'users'
  | 'employees'
  | 'evaluations'
  | 'jobProfiles'
  | 'rewards'
  | 'audit';
export type Action =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'submit'
  | 'approve'
  | 'export';

export type Matrix = Record<Role, Partial<Record<Resource, Action[]>>>;

const A = (...actions: Action[]) => actions;

export const PERMISSION_MATRIX: Matrix = {
  admin: {
    workspace: A('read', 'create', 'update', 'delete', 'export'),
    users: A('read', 'create', 'update', 'delete'),
    employees: A('read', 'create', 'update', 'delete', 'export'),
    evaluations: A('read', 'create', 'update', 'delete', 'submit', 'approve', 'export'),
    jobProfiles: A('read', 'create', 'update', 'delete'),
    rewards: A('read', 'create', 'update', 'delete'),
    audit: A('read', 'export'),
  },
  supervisor: {
    workspace: A('read'),
    users: A('read'),
    employees: A('read', 'update'),
    evaluations: A('read', 'create', 'update', 'submit'),
    jobProfiles: A('read'),
    rewards: A('read'),
  },
  employee: {
    workspace: A('read'),
    employees: A('read'), // self-scoping must be enforced by callers
    evaluations: A('read', 'submit'),
  },
};

export function can(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  return PERMISSION_MATRIX[role]?.[resource]?.includes(action) ?? false; // deny by default
}
