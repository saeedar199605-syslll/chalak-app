import { Hono } from 'hono';
import { Env, UserSession, WorkspaceEvent } from '../types';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { recalculateEvaluation } from '../services/scoring';
import { logAudit } from '../services/audit';
import { generateCoachingPlan } from '../services/gemini';

const evaluations = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();
evaluations.use('*', authMiddleware());

// Helper to broadcast event via Durable Object
async function broadcastEvent(env: Env, event: WorkspaceEvent) {
  try {
    const doId = env.REALTIME_ROOM.idFromName(event.workspaceId);
    const room = env.REALTIME_ROOM.get(doId);
    await room.fetch('https://dummy/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch (e) {
    console.error('DO broadcast failed:', e);
  }
}

evaluations.get('/', async (c) => {
  const user = c.get('user');
  const cycle = c.req.query('cycle');
  const status = c.req.query('status');

  let sql = `
    SELECT e.*, emp.first_name, emp.last_name, emp.personnel_code, emp.unit, jp.title as profile_title
    FROM evaluations e
    JOIN employees emp ON e.employee_id = emp.id
    JOIN job_profiles jp ON e.profile_id = jp.id
    WHERE e.workspace_id = ?
  `;
  const params: any[] = [user.workspaceId];

  // RBAC Filter
  if (user.role === 'employee') {
    sql += ` AND emp.user_id = ?`;
    params.push(user.userId);
  }

  if (cycle) {
    sql += ` AND e.cycle = ?`;
    params.push(cycle);
  }
  if (status) {
    sql += ` AND e.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY e.updated_at DESC`;
  const { results: evals } = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: evals,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString(), total: evals.length }
  });
});

evaluations.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const ev: any = await c.env.DB.prepare(`
    SELECT e.*, emp.first_name, emp.last_name, emp.personnel_code, emp.unit, jp.title as profile_title
    FROM evaluations e
    JOIN employees emp ON e.employee_id = emp.id
    JOIN job_profiles jp ON e.profile_id = jp.id
    WHERE e.id = ? AND e.workspace_id = ?
  `).bind(id, user.workspaceId).first();

  if (!ev) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'ارزیابی یافت نشد.' } }, 404);
  }

  // Get scores
  const { results: scores } = await c.env.DB.prepare(`
    SELECT es.*, c.title as criterion_title, c.code as criterion_code, c.category as criterion_category
    FROM evaluation_scores es
    JOIN criteria c ON es.criterion_id = c.id
    WHERE es.evaluation_id = ?
  `).bind(id).all();

  return c.json({
    success: true,
    data: { ...ev, scores },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

evaluations.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const id = body.id || `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const employeeId = body.employee_id || body.empId;
  const profileId = body.profile_id || body.profileId;
  const cycle = body.cycle || body.period || 'دوره بهار ۱۴۰۳';

  // Prevent duplicate evaluation in same cycle
  const existing = await c.env.DB.prepare(`
    SELECT id FROM evaluations WHERE employee_id = ? AND cycle = ? AND workspace_id = ?
  `).bind(employeeId, cycle, user.workspaceId).first();

  if (existing) {
    return c.json({
      success: false,
      error: { code: 'DUPLICATE_EVALUATION', message: 'برای این پرسنل در این دوره قبلا ارزیابی ثبت شده است.' }
    }, 400);
  }

  // Fetch job profile criteria to seed scores
  const { results: profileCriteria } = await c.env.DB.prepare(`
    SELECT * FROM job_profile_criteria WHERE job_profile_id = ?
  `).bind(profileId).all();

  await c.env.DB.prepare(`
    INSERT INTO evaluations (
      id, employee_id, evaluator_id, profile_id, cycle, status, stage,
      total_score, performance_level, potential_level, nine_box_position,
      workspace_id, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'draft', 'supervisor_review', 0.0, 'low', 'low', 'underperformer', ?, 1, datetime('now'), datetime('now'))
  `).bind(id, employeeId, user.userId, profileId, cycle, user.workspaceId).run();

  // Insert initial empty score rows
  for (const pc of profileCriteria as any[]) {
    const scoreId = `es_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await c.env.DB.prepare(`
      INSERT INTO evaluation_scores (
        id, evaluation_id, criterion_id, weight, self_score, manager_score, final_score
      ) VALUES (?, ?, ?, ?, 0.0, 0.0, 0.0)
    `).bind(scoreId, id, pc.criterion_id, pc.weight).run();
  }

  const createdEvent: WorkspaceEvent = {
    eventId: crypto.randomUUID(),
    type: 'evaluation.created',
    entity: 'evaluation',
    entityId: id,
    workspaceId: user.workspaceId,
    version: 1,
    operation: 'created',
    changedBy: { userId: user.userId, name: user.name },
    payload: { id, employeeId, cycle },
    createdAt: new Date().toISOString()
  };

  await broadcastEvent(c.env, createdEvent);
  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'evaluation',
    entityId: id,
    action: 'CREATE',
    newValue: { employeeId, cycle, profileId }
  });

  return c.json({
    success: true,
    data: { id, employee_id: employeeId, profile_id: profileId, cycle, version: 1 },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  }, 201);
});

// Update evaluation scores with Optimistic Locking & Recalculation
evaluations.put('/:id/scores', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const incomingVersion = Number(body.version || 1);
  const rawScores: any[] = Array.isArray(body.scores) ? body.scores : [];

  // 1. Fetch current evaluation record & verify version for Optimistic Locking
  const currentEval: any = await c.env.DB.prepare(`
    SELECT * FROM evaluations WHERE id = ? AND workspace_id = ?
  `).bind(id, user.workspaceId).first();

  if (!currentEval) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'ارزیابی یافت نشد.' } }, 404);
  }

  if (currentEval.status === 'locked') {
    return c.json({
      success: false,
      error: { code: 'EVALUATION_LOCKED', message: 'این ارزیابی قفل شده و امکان تغییر نمرات وجود ندارد.' }
    }, 403);
  }

  if (currentEval.version !== incomingVersion) {
    return c.json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'این رکورد توسط کاربر دیگری بهینه‌سازی شده است. لطفا آخرین تغییرات را بازیابی نمایید.',
        details: [{ currentVersion: currentEval.version, yourVersion: incomingVersion }]
      }
    }, 409);
  }

  // 2. Fetch criteria details to enrich calculation items
  const { results: criteriaList } = await c.env.DB.prepare(`
    SELECT id, code, category FROM criteria WHERE workspace_id = ?
  `).bind(user.workspaceId).all();
  const critMap = new Map((criteriaList as any[]).map(c => [c.id, c]));

  // 3. Prepare calculation payload and update database
  const calcItems = rawScores.map(s => {
    const meta = critMap.get(s.criterion_id || s.cid) || {};
    return {
      cid: s.criterion_id || s.cid,
      weight: Number(s.weight) || 0,
      value: Number(s.manager_score ?? s.value ?? 0),
      self: Number(s.self_score ?? s.self ?? 0),
      category: meta.category,
      code: meta.code,
      doc: s.evidence || s.doc || ''
    };
  });

  // Pure mathematical recalculation on backend (Do not trust client total score)
  const calcResult = recalculateEvaluation(calcItems);

  // Update evaluation_scores rows
  for (const s of rawScores) {
    const criterionId = s.criterion_id || s.cid;
    const managerScore = Number(s.manager_score ?? s.value ?? 0);
    const selfScore = Number(s.self_score ?? s.self ?? 0);
    const finalScore = managerScore > 0 ? managerScore : selfScore;
    const evidence = s.evidence || s.doc || null;
    const comment = s.comment || null;

    await c.env.DB.prepare(`
      INSERT INTO evaluation_scores (
        id, evaluation_id, criterion_id, weight, self_score, manager_score, final_score, evidence, comment, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(evaluation_id, criterion_id) DO UPDATE SET
        self_score = excluded.self_score,
        manager_score = excluded.manager_score,
        final_score = excluded.final_score,
        evidence = excluded.evidence,
        comment = excluded.comment,
        updated_at = datetime('now')
    `).bind(
      `es_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      id,
      criterionId,
      Number(s.weight) || 0,
      selfScore,
      managerScore,
      finalScore,
      evidence,
      comment
    ).run();
  }

  // 4. Increment version and update evaluation master row
  const nextVersion = currentEval.version + 1;
  await c.env.DB.prepare(`
    UPDATE evaluations SET
      total_score = ?,
      performance_level = ?,
      potential_level = ?,
      nine_box_position = ?,
      version = ?,
      updated_at = datetime('now')
    WHERE id = ? AND workspace_id = ?
  `).bind(
    calcResult.totalScore,
    calcResult.performanceLevel,
    calcResult.potentialLevel,
    calcResult.nineBoxPosition,
    nextVersion,
    id,
    user.workspaceId
  ).run();

  // 5. Broadcast real-time event
  const updatedEvent: WorkspaceEvent = {
    eventId: crypto.randomUUID(),
    type: 'evaluation.updated',
    entity: 'evaluation',
    entityId: id,
    workspaceId: user.workspaceId,
    version: nextVersion,
    operation: 'updated',
    changedBy: { userId: user.userId, name: user.name },
    payload: { id, totalScore: calcResult.totalScore, nineBoxPosition: calcResult.nineBoxPosition, version: nextVersion },
    createdAt: new Date().toISOString()
  };

  await broadcastEvent(c.env, updatedEvent);
  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'evaluation',
    entityId: id,
    action: 'UPDATE_SCORES',
    oldValue: { totalScore: currentEval.total_score, version: currentEval.version },
    newValue: { totalScore: calcResult.totalScore, version: nextVersion }
  });

  return c.json({
    success: true,
    data: {
      id,
      version: nextVersion,
      totalScore: calcResult.totalScore,
      performanceLevel: calcResult.performanceLevel,
      potentialLevel: calcResult.potentialLevel,
      nineBoxPosition: calcResult.nineBoxPosition,
      grade: calcResult.grade,
      hasSafetyVeto: calcResult.hasSafetyVeto,
      missingEvidenceCount: calcResult.missingEvidenceCount,
      selfManagerGap: calcResult.selfManagerGap
    },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

// AI Coaching generation endpoint
evaluations.post('/:id/coaching', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const apiKey = c.env.GEMINI_API_KEY;

  if (!apiKey) {
    return c.json({
      success: false,
      error: { code: 'GEMINI_NOT_CONFIGURED', message: 'کلید ارتباطی هوش مصنوعی Gemini تنظیم نشده است.' }
    }, 500);
  }

  // Fetch evaluation and employee details
  const ev: any = await c.env.DB.prepare(`
    SELECT e.*, emp.first_name, emp.last_name, jp.title as job_title
    FROM evaluations e
    JOIN employees emp ON e.employee_id = emp.id
    JOIN job_profiles jp ON e.profile_id = jp.id
    WHERE e.id = ? AND e.workspace_id = ?
  `).bind(id, user.workspaceId).first();

  if (!ev) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'ارزیابی یافت نشد.' } }, 404);
  }

  const { results: scores } = await c.env.DB.prepare(`
    SELECT es.*, c.title as criterion_title
    FROM evaluation_scores es
    JOIN criteria c ON es.criterion_id = c.id
    WHERE es.evaluation_id = ?
  `).bind(id).all();

  const plan = await generateCoachingPlan(apiKey, {
    employeeName: `${ev.first_name} ${ev.last_name}`,
    jobTitle: ev.job_title,
    cycle: ev.cycle,
    scores: (scores as any[]).map(s => ({
      criterionTitle: s.criterion_title,
      score: s.manager_score,
      selfScore: s.self_score,
      doc: s.evidence
    }))
  });

  const coachingId = `coach_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await c.env.DB.prepare(`
    INSERT INTO coaching_sessions (id, evaluation_id, generated_by, ai_model, result_json)
    VALUES (?, ?, ?, ?, ?)
  `).bind(coachingId, id, user.userId, plan.model, JSON.stringify(plan)).run();

  await logAudit(c.env.DB, {
    userId: user.userId,
    workspaceId: user.workspaceId,
    entityType: 'coaching_session',
    entityId: coachingId,
    action: 'GENERATE_AI_COACHING',
    newValue: { evaluationId: id }
  });

  return c.json({
    success: true,
    data: { id: coachingId, ...plan },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

export { evaluations };
