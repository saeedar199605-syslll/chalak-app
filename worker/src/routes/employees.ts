import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { logAudit } from '../services/audit';

const employees = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();
employees.use('*', authMiddleware());

employees.get('/', async (c) => {
  const user = c.get('user');
  const unit = c.req.query('unit');
  const search = c.req.query('search');

  let sql = `SELECT * FROM employees WHERE workspace_id = ? AND is_active = 1`;
  const params: any[] = [user.workspaceId];

  // RBAC scope: Employee can only see their own profile or peers in unit
  if (user.role === 'employee') {
    sql += ` AND (user_id = ? OR unit = (SELECT unit FROM employees WHERE user_id = ?))`;
    params.push(user.userId, user.userId);
  } else if (user.role === 'manager' || user.role === 'evaluator') {
    if (unit) {
      sql += ` AND unit = ?`;
      params.push(unit);
    }
  }

  if (search) {
    sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR personnel_code LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY last_name ASC, first_name ASC`;

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json({
    success: true,
    data: results,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString(), total: results.length }
  });
});

employees.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const emp = await c.env.DB.prepare(`
    SELECT * FROM employees WHERE id = ? AND workspace_id = ?
  `).bind(id, user.workspaceId).first();

  if (!emp) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'پرسنل مورد نظر یافت نشد.' }
    }, 404);
  }

  return c.json({
    success: true,
    data: emp,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

employees.post('/', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const id = body.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await c.env.DB.prepare(`
    INSERT INTO employees (
      id, personnel_code, first_name, last_name, job, unit,
      manager_id, user_id, department_id, profile_id, workspace_id, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.personnel_code || body.code,
    body.first_name || body.name?.split(' ')[0] || '',
    body.last_name || body.name?.split(' ').slice(1).join(' ') || '',
    body.job || body.title || 'کارشناس',
    body.unit || 'تولید',
    body.manager_id || null,
    body.user_id || null,
    body.department_id || null,
    body.profile_id || null,
    user.workspaceId,
    1
  ).run();

  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'employee',
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

employees.patch('/:id', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();

  const existing = await c.env.DB.prepare(`
    SELECT * FROM employees WHERE id = ? AND workspace_id = ?
  `).bind(id, user.workspaceId).first();

  if (!existing) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'پرسنل یافت نشد.' } }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE employees SET
      job = COALESCE(?, job),
      unit = COALESCE(?, unit),
      manager_id = COALESCE(?, manager_id),
      profile_id = COALESCE(?, profile_id),
      updated_at = datetime('now')
    WHERE id = ? AND workspace_id = ?
  `).bind(body.job, body.unit, body.manager_id, body.profile_id, id, user.workspaceId).run();

  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'employee',
    entityId: id,
    action: 'UPDATE',
    oldValue: existing,
    newValue: body
  });

  return c.json({
    success: true,
    data: { message: 'مشخصات پرسنل با موفقیت ویرایش شد.' },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

export { employees };
