import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { signJwt } from '../middleware/auth';
import { logAudit } from '../services/audit';

const auth = new Hono<{ Bindings: Env; Variables: { user: UserSession } }>();

// Simple PBKDF2/SHA256 password hasher using Web Crypto
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = 'chalak_secure_salt_v1';
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { username, password } = body;

  if (!username || !password) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'نام کاربری و کلمه عبور الزامی است.' }
    }, 400);
  }

  const cleanUser = String(username).trim().toLowerCase();
  const dbUser: any = await c.env.DB.prepare(`
    SELECT * FROM users WHERE username = ? AND is_active = 1
  `).bind(cleanUser).first();

  if (!dbUser) {
    return c.json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'نام کاربری یا کلمه عبور اشتباه است.' }
    }, 401);
  }

  const hashedInput = await hashPassword(password);
  // Also support initial plain password matching if migrated, but check hashed
  if (dbUser.password_hash !== hashedInput && dbUser.password_hash !== password) {
    return c.json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'نام کاربری یا کلمه عبور اشتباه است.' }
    }, 401);
  }

  const secret = c.env.JWT_SECRET || 'default_jwt_secret_must_change_in_prod';
  const tokenPayload = {
    userId: dbUser.id,
    username: dbUser.username,
    name: dbUser.name,
    role: dbUser.role,
    workspaceId: dbUser.workspace_id || 'default_org',
    departmentId: dbUser.department_id,
    exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
  };

  const token = await signJwt(tokenPayload, secret);

  // Audit log
  await logAudit(c.env.DB, {
    userId: dbUser.id,
    workspaceId: dbUser.workspace_id || 'default_org',
    entityType: 'user',
    entityId: dbUser.id,
    action: 'LOGIN',
    ipAddress: c.req.header('cf-connecting-ip'),
    userAgent: c.req.header('user-agent')
  });

  // Set secure HttpOnly cookie
  c.header('Set-Cookie', `chalak_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800; Secure`);

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role,
        workspaceId: dbUser.workspace_id || 'default_org',
        departmentId: dbUser.department_id
      }
    },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

auth.post('/logout', async (c) => {
  c.header('Set-Cookie', `chalak_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
  return c.json({
    success: true,
    data: { message: 'با موفقیت خارج شدید.' },
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookie = c.req.header('Cookie') || '';
    const match = cookie.match(/chalak_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'وارد نشده‌اید.' } }, 401);
  }

  const { verifyJwt } = await import('../middleware/auth');
  const secret = c.env.JWT_SECRET || 'default_jwt_secret_must_change_in_prod';
  const payload = await verifyJwt(token, secret);

  if (!payload || !payload.userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'نشست منقضی شده است.' } }, 401);
  }

  const user: any = await c.env.DB.prepare(`
    SELECT id, name, username, email, role, department_id, workspace_id, is_active FROM users WHERE id = ?
  `).bind(payload.userId).first();

  if (!user || !user.is_active) {
    return c.json({ success: false, error: { code: 'USER_INACTIVE', message: 'حساب کاربری غیرفعال است.' } }, 403);
  }

  return c.json({
    success: true,
    data: user,
    meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() }
  });
});

export { auth, hashPassword };
