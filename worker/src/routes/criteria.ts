import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { logAudit } from '../services/audit';

const criteria = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();
criteria.use('*', authMiddleware());

criteria.get('/', async (c) => {
  const user = c.get('user');
  const category = c.req.query('category');

  let sql = `SELECT * FROM criteria WHERE workspace_id = ? AND is_active = 1`;
  const params: any[] = [user.workspaceId];

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY category ASC, code ASC`;
  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: results,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString(), total: results.length }
  });
});

criteria.post('/', requireRoles(['admin', 'hr']), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const id = body.id || `crit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await c.env.DB.prepare(`
    INSERT INTO criteria (
      id, code, title, category, description, min_score, max_score,
      is_mandatory, is_active, dir, scoring_source, mis_metric_key,
      calculation_type, formula_expression, target_value,
      score_thresholds_json, variables_json, workspace_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.code,
    body.title || body.name,
    body.category || body.cat,
    body.description || body.def,
    body.min_score || 1.0,
    body.max_score || 5.0,
    body.is_mandatory ? 1 : 0,
    1,
    body.dir || 'more',
    body.scoring_source || body.scoringSource || 'supervisor',
    body.mis_metric_key || body.misMetricKey || null,
    body.calculation_type || body.calculationType || 'ratio',
    body.formula_expression || body.formulaExpression || null,
    body.target_value || body.targetValue || null,
    body.scoreThresholds ? JSON.stringify(body.scoreThresholds) : null,
    body.variables ? JSON.stringify(body.variables) : null,
    user.workspaceId
  ).run();

  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'criterion',
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

export { criteria };
