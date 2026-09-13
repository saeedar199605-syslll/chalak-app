export type UserRole = 'admin' | 'hr' | 'manager' | 'evaluator' | 'employee' | 'viewer';

export interface UserSession {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  workspaceId: string;
  departmentId?: string;
}

export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  REALTIME_ROOM: DurableObjectNamespace;
  JWT_SECRET: string;
  SESSION_SECRET?: string;
  GEMINI_API_KEY?: string;
  ENVIRONMENT?: string;
  DEFAULT_WORKSPACE_ID?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  meta?: {
    requestId: string;
    timestamp: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface WorkspaceEvent {
  eventId: string;
  type: string;
  entity: string;
  entityId: string;
  workspaceId: string;
  version: number;
  operation: 'created' | 'updated' | 'deleted';
  changedBy: {
    userId: string;
    name: string;
  };
  payload: any;
  createdAt: string;
}
