import { Context, Next } from 'hono';
import { UserRole, UserSession, Env } from '../types';

// Simple HMAC-SHA256 JWT implementation without external dependencies
async function signJwt(payload: any, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const b64Payload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const data = `${b64Header}.${b64Payload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${b64Sig}`;
}

async function verifyJwt(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [b64Header, b64Payload, b64Sig] = parts;

    const enc = new TextEncoder();
    const data = `${b64Header}.${b64Payload}`;

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Base64Url decode signature
    let rawSig = b64Sig.replace(/-/g, '+').replace(/_/g, '/');
    while (rawSig.length % 4) rawSig += '=';
    const sigBytes = Uint8Array.from(atob(rawSig), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    let rawPayload = b64Payload.replace(/-/g, '+').replace(/_/g, '/');
    while (rawPayload.length % 4) rawPayload += '=';
    const payload = JSON.parse(atob(rawPayload));

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export { signJwt, verifyJwt };

export function authMiddleware() {
  return async (c: Context<{ Bindings: Env; Variables: { user: UserSession } }>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Look for cookie
      const cookie = c.req.header('Cookie') || '';
      const match = cookie.match(/chalak_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'لطفا ابتدا وارد سیستم شوید.' }
      }, 401);
    }

    const secret = c.env.JWT_SECRET || 'default_jwt_secret_must_change_in_prod';
    const payload = await verifyJwt(token, secret);

    if (!payload || !payload.userId) {
      return c.json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'نشست کاربری نامعتبر یا منقضی شده است.' }
      }, 401);
    }

    c.set('user', {
      userId: payload.userId,
      username: payload.username,
      name: payload.name,
      role: payload.role,
      workspaceId: payload.workspaceId || 'default_org',
      departmentId: payload.departmentId
    });

    await next();
  };
}

export function requireRoles(roles: UserRole[]) {
  return async (c: Context<{ Bindings: Env; Variables: { user: UserSession } }>, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'احراز هویت انجام نشده است.' }
      }, 401);
    }

    if (user.role === 'admin') {
      // Admin has full access to all endpoints
      await next();
      return;
    }

    if (!roles.includes(user.role)) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'شما دسترسی لازم برای این عملیات را ندارید.'
        }
      }, 403);
    }

    await next();
  };
}
