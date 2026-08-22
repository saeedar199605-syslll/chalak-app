function sanitizeStatePayload(rawBody) {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return {};
  }
  const clean = {};
  for (const key of Object.keys(rawBody)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (typeof key === 'string' && key.length < 100) {
      clean[key] = rawBody[key];
    }
  }
  return clean;
}

export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.CHALAK_DB;

  if (!KV) {
    return new Response(JSON.stringify({ error: "دیتابیس KV متصل نشده است." }), { status: 500 });
  }

  if (request.method === 'GET') {
    const data = await KV.get('app_state');
    return new Response(data || '{}', {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const sanitized = sanitizeStatePayload(body);
      
      const existingRaw = await KV.get('app_state');
      const existingState = existingRaw ? JSON.parse(existingRaw) : {};
      
      const newState = { ...existingState, ...sanitized };
      await KV.put('app_state', JSON.stringify(newState));
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid Payload" }), { status: 400 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
