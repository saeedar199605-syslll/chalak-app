export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.CHALAK_DB;

  // Graceful fallback for Cloudflare Pages deployments where KV binding is not yet configured
  if (!KV) {
    if (request.method === 'GET') {
      return new Response('{}', {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (request.method === 'POST') {
      return new Response(JSON.stringify({ success: true, fallback: 'client_storage' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('OK', { status: 200 });
  }

  if (request.method === 'GET') {
    const data = await KV.get('app_state');
    return new Response(data || '{}', {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    const body = await request.text();
    await KV.put('app_state', body);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
