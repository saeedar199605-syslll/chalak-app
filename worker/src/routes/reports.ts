import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { authMiddleware } from '../middleware/auth';

const reports = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();
reports.use('*', authMiddleware());

reports.get('/dashboard', async (c) => {
  const user = c.get('user');

  const empCount: any = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM employees WHERE workspace_id = ? AND is_active = 1
  `).bind(user.workspaceId).first();

  const evalCount: any = await c.env.DB.prepare(`
    SELECT COUNT(*) as count, AVG(total_score) as avg_score FROM evaluations WHERE workspace_id = ?
  `).bind(user.workspaceId).first();

  const { results: statusDist } = await c.env.DB.prepare(`
    SELECT status, COUNT(*) as count FROM evaluations WHERE workspace_id = ? GROUP BY status
  `).bind(user.workspaceId).all();

  return c.json({
    success: true,
    data: {
      totalEmployees: empCount?.count || 0,
      totalEvaluations: evalCount?.count || 0,
      averageScore: Math.round((evalCount?.avg_score || 0) * 10) / 10,
      statusDistribution: statusDist
    },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

reports.get('/calibration', async (c) => {
  const user = c.get('user');

  const { results: evals } = await c.env.DB.prepare(`
    SELECT total_score, status FROM evaluations WHERE workspace_id = ? AND total_score > 0
  `).bind(user.workspaceId).all();

  const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const scores = (evals as any[]).map(e => e.total_score);

  for (const s of scores) {
    if (s >= 90) dist.A++;
    else if (s >= 75) dist.B++;
    else if (s >= 60) dist.C++;
    else if (s >= 45) dist.D++;
    else dist.E++;
  }

  const total = scores.length || 1;
  const mean = scores.reduce((a, b) => a + b, 0) / total;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / total;
  const stdDev = Math.sqrt(variance);

  return c.json({
    success: true,
    data: {
      distribution: dist,
      percentages: {
        A: Math.round((dist.A / total) * 100),
        B: Math.round((dist.B / total) * 100),
        C: Math.round((dist.C / total) * 100),
        D: Math.round((dist.D / total) * 100),
        E: Math.round((dist.E / total) * 100)
      },
      stats: {
        total,
        mean: Math.round(mean * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        isInflated: (dist.A / total) > 0.25
      }
    },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

reports.get('/nine-box', async (c) => {
  const user = c.get('user');
  const { results: boxes } = await c.env.DB.prepare(`
    SELECT nine_box_position, COUNT(*) as count
    FROM evaluations
    WHERE workspace_id = ? AND total_score > 0
    GROUP BY nine_box_position
  `).bind(user.workspaceId).all();

  return c.json({
    success: true,
    data: boxes,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

export { reports };
