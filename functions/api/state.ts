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
    const body = await request.text();
    await KV.put('app_state', body);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
