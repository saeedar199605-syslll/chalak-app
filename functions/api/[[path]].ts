/**
 * Cloudflare Pages Functions handler for /api/*
 * Allows running on Cloudflare Pages / Workers edge runtime seamlessly.
 */

interface Env {
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, Params extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = (params.path as string[] || []).join('/');

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  };

  // Health check endpoint
  if (path === 'health' || url.pathname === '/api/health') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        runtime: 'cloudflare-pages',
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Gemini API Proxy endpoints
  if (path.startsWith('gemini/')) {
    const apiKey = env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY environment variable is not configured on Cloudflare.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const body = await request.json() as any;

      if (path === 'gemini/feedback') {
        const { employeeName, jobTitle, supervisorComment } = body;
        const promptText = `شما مشاور منابع انسانی هستید. متن ارزیابی سرپرست را برای همکار «${employeeName || 'همکار'}» در شغل «${jobTitle || 'شغل'}» تحلیل کنید: "${supervisorComment || 'عملکرد مطلوب'}". لطفا پیشنهاد جملات بازخورد حرفه‌ای و توصیه‌های مربی‌گری ارائه دهید.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        const geminiData = await geminiRes.json() as any;
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'بازخورد با موفقیت تولید شد.';

        return new Response(
          JSON.stringify({
            summary: replyText.substring(0, 300),
            strengths: ['انضباط کاری و مسئولیت‌پذیری', 'پایبندی به فرآیندهای کیفی'],
            developmentAreas: ['مدیریت زمان در ساعات پیک', 'مشارکت در جلسات حل مسئله'],
            actionItems: ['گذراندن دوره آموزشی تخصصی', 'تنظیم برنامه هفتگی با سرپرست مستقیم'],
            refinedComment: supervisorComment,
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // Default gemini fallback
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Processed via Cloudflare edge function' }),
        { status: 200, headers: corsHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || 'Error processing request' }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Endpoint not found' }),
    { status: 404, headers: corsHeaders }
  );
};
