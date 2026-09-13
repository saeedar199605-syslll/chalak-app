import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import { auth } from './routes/auth';
import { employees } from './routes/employees';
import { criteria } from './routes/criteria';
import { jobProfiles } from './routes/jobProfiles';
import { evaluations } from './routes/evaluations';
import { reports } from './routes/reports';
import { backups } from './routes/backups';
import { ws } from './routes/ws';

export { WorkspaceRoom } from './durable-objects/WorkspaceRoom';

const app = new Hono<{ Bindings: Env }>();

// Security Headers & CORS
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self'; connect-src 'self' wss: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  await next();
});

app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400
}));

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'cloudflare-workers',
    version: '2.0.0'
  });
});

// Route Mounting
app.route('/api/auth', auth);
app.route('/api/employees', employees);
app.route('/api/criteria', criteria);
app.route('/api/job-profiles', jobProfiles);
app.route('/api/evaluations', evaluations);
app.route('/api/reports', reports);
app.route('/api/backups', backups);
app.route('/api/ws', ws);

// Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled Worker Error:', err);
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: c.env.ENVIRONMENT === 'production' ? 'خطای غیرمنتظره در سرور رخ داده است.' : err.message
    },
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
  }, 500);
});

// 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'مسیر مورد نظر یافت نشد.' },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  }, 404);
});

export default app;
