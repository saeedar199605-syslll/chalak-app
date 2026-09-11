export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.CHALAK_DB;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // مدیریت درخواست‌های प्रीفлайت (Preflight) CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!KV) {
    return new Response(JSON.stringify({ error: 'KV DB not bound. Please configure CHALAK_DB in Cloudflare.' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }

  try {
    if (request.method === 'GET') {
      const data = await KV.get('app_state');
      return new Response(data || '{}', {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (request.method === 'POST') {
      const clientState = await request.json();
      
      // دریافت دیتای فعلی سرور برای جلوگیری از حذف دیتای سایر کاربران (Race Condition)
      const serverStateStr = await KV.get('app_state');
      const serverState = serverStateStr ? JSON.parse(serverStateStr) : {};

      // ادغام هوشمند داده‌ها (Merge) با اولویت‌دهی به دیتای کلاینت برای رکوردهای تغییر یافته
      const mergedState = {
        ...serverState,
        ...clientState,
        pe_evaluations: mergeArrays(serverState.pe_evaluations || [], clientState.pe_evaluations || []),
        pe_employees: mergeArrays(serverState.pe_employees || [], clientState.pe_employees || []),
        pe_criteria: mergeArrays(serverState.pe_criteria || [], clientState.pe_criteria || []),
        pe_profiles: mergeArrays(serverState.pe_profiles || [], clientState.pe_profiles || []),
        pe_workshop_targets: mergeArrays(serverState.pe_workshop_targets || [], clientState.pe_workshop_targets || [])
      };

      await KV.put('app_state', JSON.stringify(mergedState));
      
      return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}

// تابع کمکی برای ادغام آرایه‌ها بر اساس ID (اولویت با دیتای جدیدتر کلاینت)
function mergeArrays(serverArr, clientArr) {
  const map = new Map();
  serverArr.forEach(item => map.set(item.id, item));
  clientArr.forEach(item => map.set(item.id, item)); // کلاینت روی سرور بازنویسی می‌شود
  return Array.from(map.values());
}
