import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { logAudit } from '../services/audit';

const backups = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();
backups.use('*', authMiddleware());

// Trigger full workspace backup to Cloudflare R2
backups.post('/', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');

  // Dump all workspace data from D1
  const [users, emps, crits, profiles, evals] = await Promise.all([
    c.env.DB.prepare(`SELECT * FROM users WHERE workspace_id = ?`).bind(user.workspaceId).all(),
    c.env.DB.prepare(`SELECT * FROM employees WHERE workspace_id = ?`).bind(user.workspaceId).all(),
    c.env.DB.prepare(`SELECT * FROM criteria WHERE workspace_id = ?`).bind(user.workspaceId).all(),
    c.env.DB.prepare(`SELECT * FROM job_profiles WHERE workspace_id = ?`).bind(user.workspaceId).all(),
    c.env.DB.prepare(`SELECT * FROM evaluations WHERE workspace_id = ?`).bind(user.workspaceId).all()
  ]);

  const backupPayload = {
    exportedAt: new Date().toISOString(),
    workspaceId: user.workspaceId,
    exportedBy: { userId: user.userId, name: user.name },
    schemaVersion: '2.0.0',
    data: {
      users: users.results,
      employees: emps.results,
      criteria: crits.results,
      jobProfiles: profiles.results,
      evaluations: evals.results
    }
  };

  const backupJson = JSON.stringify(backupPayload, null, 2);
  const backupId = `backup_${Date.now()}`;
  const fileName = `chalak_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const r2Key = `backups/${user.workspaceId}/${fileName}`;

  // Store in Cloudflare R2 Bucket
  await c.env.R2_BUCKET.put(r2Key, backupJson, {
    httpMetadata: { contentType: 'application/json' },
    customMetadata: {
      workspaceId: user.workspaceId,
      createdBy: user.userId
    }
  });

  // Save metadata to D1
  await c.env.DB.prepare(`
    INSERT INTO file_backups (id, workspace_id, file_name, r2_key, file_size, content_type, created_by)
    VALUES (?, ?, ?, ?, ?, 'application/json', ?)
  `).bind(backupId, user.workspaceId, fileName, r2Key, backupJson.length, user.userId).run();

  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'backup',
    entityId: backupId,
    action: 'CREATE_R2_BACKUP',
    newValue: { fileName, size: backupJson.length }
  });

  return c.json({
    success: true,
    data: { id: backupId, fileName, size: backupJson.length, createdAt: new Date().toISOString() },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  }, 201);
});

backups.get('/', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM file_backups WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 20
  `).bind(user.workspaceId).all();

  return c.json({
    success: true,
    data: results,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

backups.get('/:id/download', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const meta: any = await c.env.DB.prepare(`
    SELECT * FROM file_backups WHERE id = ? AND workspace_id = ?
  `).bind(id, user.workspaceId).first();

  if (!meta) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'فایل پشتیبان یافت نشد.' } }, 404);
  }

  const r2Object = await c.env.R2_BUCKET.get(meta.r2_key);
  if (!r2Object) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'فایل در حافظه ذخیره‌سازی R2 یافت نشد.' } }, 404);
  }

  const headers = new Headers();
  r2Object.writeHttpMetadata(headers);
  headers.set('Content-Disposition', `attachment; filename="${meta.file_name}"`);
  headers.set('Content-Type', 'application/json');

  return new Response(r2Object.body, { headers });
});

export { backups };
