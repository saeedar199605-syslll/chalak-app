import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { logAudit } from '../services/audit';

const jobProfiles = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();
jobProfiles.use('*', authMiddleware());

jobProfiles.get('/', async (c) => {
  const user = c.get('user');
  const { results: profiles } = await c.env.DB.prepare(`
    SELECT * FROM job_profiles WHERE workspace_id = ? ORDER BY title ASC
  `).bind(user.workspaceId).all();

  // Attach associated criteria
  const { results: associations } = await c.env.DB.prepare(`
    SELECT jpc.*, c.title as criterion_title, c.code as criterion_code, c.category as criterion_category
    FROM job_profile_criteria jpc
    JOIN criteria c ON jpc.criterion_id = c.id
    WHERE jpc.job_profile_id IN (SELECT id FROM job_profiles WHERE workspace_id = ?)
  `).bind(user.workspaceId).all();

  const fullProfiles = profiles.map((p: any) => ({
    ...p,
    items: associations
      .filter((a: any) => a.job_profile_id === p.id)
      .map((a: any) => ({
        cid: a.criterion_id,
        weight: a.weight,
        target: a.target,
        title: a.criterion_title,
        code: a.criterion_code,
        category: a.criterion_category
      }))
  }));

  return c.json({
    success: true,
    data: fullProfiles,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString(), total: fullProfiles.length }
  });
});

jobProfiles.post('/', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const id = body.id || `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Validate total weight sums to 100
  const items = Array.isArray(body.items) ? body.items : [];
  const totalWeight = items.reduce((sum: number, it: any) => sum + (Number(it.weight) || 0), 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return c.json({
      success: false,
      error: { code: 'INVALID_WEIGHTS', message: `مجموع اوزان شاخص‌ها باید ۱۰۰٪ باشد. وزن فعلی: ${totalWeight}٪` }
    }, 400);
  }

  // Insert profile
  await c.env.DB.prepare(`
    INSERT INTO job_profiles (id, title, code, family, description, locked, workspace_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.title,
    body.code || `P-${Date.now().toString(36).toUpperCase()}`,
    body.family || 'عمومی',
    body.description || null,
    body.locked ? 1 : 0,
    user.workspaceId
  ).run();

  // Insert associated criteria
  for (const it of items) {
    const jpcId = `jpc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await c.env.DB.prepare(`
      INSERT INTO job_profile_criteria (id, job_profile_id, criterion_id, weight, target)
      VALUES (?, ?, ?, ?, ?)
    `).bind(jpcId, id, it.cid, Number(it.weight), it.target || null).run();
  }

  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'job_profile',
    entityId: id,
    action: 'CREATE',
    newValue: body
  });

  return c.json({
    success: true,
    data: { id, ...body },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  }, 201);
});

export { jobProfiles };
