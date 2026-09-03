export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.CHALAK_DB;
  if (!KV) {
    return new Response(JSON.stringify({ error: "دیتابیس KV متصل نیست." }), { status: 500 });
  }

  if (request.method === 'GET') {
    const data = await KV.get('app_state');
    return new Response(data || '{}', {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const currentStateRaw = await KV.get('app_state');
      let currentState = currentStateRaw ? JSON.parse(currentStateRaw) : {};
      
      const body = await request.json();
      const sanitized = {};
      
      // Simple prototype pollution prevention
      for (const key of Object.keys(body)) {
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          sanitized[key] = body[key];
        }
      }
      
      const newState = { ...currentState, ...sanitized };
      await KV.put('app_state', JSON.stringify(newState));
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}