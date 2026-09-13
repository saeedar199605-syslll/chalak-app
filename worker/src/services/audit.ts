import { D1Database } from '@cloudflare/workers-types';
import { UserSession } from '../types';

export interface AuditLogEntry {
  userId?: string;
  workspaceId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(db: D1Database, entry: AuditLogEntry): Promise<void> {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const oldJson = entry.oldValue ? JSON.stringify(entry.oldValue) : null;
    const newJson = entry.newValue ? JSON.stringify(entry.newValue) : null;

    await db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, workspace_id, entity_type, entity_id, action,
        old_value_json, new_value_json, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      id,
      entry.userId || null,
      entry.workspaceId || 'default_org',
      entry.entityType,
      entry.entityId,
      entry.action,
      oldJson,
      newJson,
      entry.ipAddress || null,
      entry.userAgent || null
    ).run();
  } catch (err) {
    console.error('Audit log failure:', err);
  }
}
