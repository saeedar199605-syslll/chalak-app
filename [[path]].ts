/**
 * Cloudflare Pages Functions catch-all handler for /api/*
 * Runs the whole backend (state sync + Gemini AI proxy) on the Cloudflare edge runtime.
 *
 * Routes handled here:
 *   GET/POST  /api/state                 -> app state sync (KV backed, graceful in-memory fallback)
 *   GET       /api/health                -> health check
 *   POST      /api/gemini/feedback       -> supervisor comment refinement + competency feedback
 *   POST      /api/gemini/coaching       -> individual development plan (IDP) coaching feedback
 *   POST      /api/gemini/bias-check     -> evaluator bias / tone audit before finalizing
 *   POST      /api/gemini/nine-box-analysis -> 9-box talent matrix strategic analysis
 */

interface Env {
  GEMINI_API_KEY?: string;
  CHALAK_DB?: KVNamespace;
  [key: string]: any;
}

// Minimal KV type (avoids requiring @cloudflare/workers-types at build time)
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface EventContext<EnvType, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: EnvType;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<
  EnvType = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<EnvType, Params, Data>) => Response | Promise<Response>;

const GEMINI_MODEL = 'gemini-2.5-flash';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json; charset=utf-8',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

/**
 * Call the Gemini REST API forcing a JSON response, and parse it.
 * Throws on any transport/parse error so callers can use their fallbacks.
 */
async function callGeminiJson(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as any;
  if (data.error) {
    throw new Error(data.error.message || 'Gemini API error');
  }

  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response text returned from Gemini API');
  }

  // Strip accidental markdown code fences before parsing
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const rawPath = (params.path as string[]) || [];
  const path = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '');

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

  // ---- Health check ----
  if (path === 'health' || url.pathname === '/api/health') {
    return json({
      status: 'ok',
      runtime: 'cloudflare-pages',
      timestamp: new Date().toISOString(),
    });
  }

  // ---- State sync (KV backed, graceful fallback) ----
  if (path === 'state' || url.pathname === '/api/state') {
    const KV = env.CHALAK_DB;
    if (request.method === 'GET') {
      if (KV) {
        try {
          const data = await KV.get('app_state');
          return new Response(data || '{}', { status: 200, headers: corsHeaders });
        } catch {
          return new Response('{}', { status: 200, headers: corsHeaders });
        }
      }
      return new Response('{}', { status: 200, headers: corsHeaders });
    }
    if (request.method === 'POST') {
      if (KV) {
        try {
          const body = await request.text();
          await KV.put('app_state', body);
          return json({ success: true, persisted: 'kv' });
        } catch (err: any) {
          return json({ success: true, fallback: 'client_storage', error: err?.message });
        }
      }
      return json({ success: true, fallback: 'client_storage' });
    }
    return json({ error: 'Method not allowed' }, 405);
  }

  // ---- Gemini AI proxy endpoints ----
  if (path.startsWith('gemini/')) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const apiKey = env.GEMINI_API_KEY || '';
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // ===== gemini/feedback =====
    if (path === 'gemini/feedback') {
      const {
        employeeName = 'همکار',
        jobTitle = 'پرسنل فنی/تولیدی',
        supervisorComment = '',
        competencyScores = {},
        targetRole = 'توسعه در شغل فعلی',
      } = body;

      const buildFallback = () => ({
        refinedComment: supervisorComment
          ? 'همکار محترم در طول دوره ارزیابی تلاش‌های موثری داشته است. با تمرکز بیشتر بر بهبود دقت فرآیندی و رعایت استانداردهای کیفیت و ایمنی، پتانسیل دستیابی به نتایج برجسته‌تر کاملاً مشهود است.'
          : 'عملکرد کلی همکار رضایت‌بخش است و با هدف‌گذاری دقیق‌تر در شاخص‌های کمی و انضباط فرآیندی، رشد چشمگیری محقق خواهد شد.',
        competencyFeedback: {
          quantitative: 'حفظ راندمان تولید و تلاش جهت بهینه‌سازی زمان‌بندی تحویل',
          quality: 'دقت مضاعف در کنترل کیفیت قطعات و کاهش دوباره‌کاری',
          behavioral: 'تقویت تعامل سازنده با اعضای تیم و پذیرش بازخوردها',
          safetyHse: 'رعایت کامل دستورالعمل‌های حفاظت فردی و HSE در محیط کار',
          leadershipTeam: 'مشارکت فعال در انتقال تجربیات فنی به نیروهای جدید',
        },
        strengths: ['پایبندی به زمان‌بندی کاری و مسئولیت‌پذیری', 'مهارت فنی در انجام وظایف محوله'],
        actionPlan: [
          'شرکت در کارگاه بازآموزی فرآیندهای کیفی و HSE',
          'تعریف یک پروژه بهبود کوچک در ایستگاه کاری برای دوره آتی',
        ],
        isFallback: true,
      });

      if (!apiKey) return json(buildFallback());

      const prompt = `
        شما یک مشاور ارشد توسعه شایستگی و مربیگری عملکرد منابع انسانی هستید.
        متن نظرات سرپرست در ارزیابی عملکرد را تحلیل کرده و پیشنهادهای بازخورد حرفه‌ای را بر اساس ۵ بعد شایستگی تدوین نمایید.

        - نام پرسنل: ${employeeName}
        - عنوان شغلی: ${jobTitle}
        - نقش/جایگاه هدف: ${targetRole}
        - متن خام نظر سرپرست: "${supervisorComment || 'نظری ثبت نشده است'}"
        - وضعیت شایستگی‌های پنج‌گانه (۱ تا ۵): نتایج کمی (K): ${competencyScores?.K || '۳'} | کیفیت (Q): ${competencyScores?.Q || '۳'} | رفتار سازمانی (B): ${competencyScores?.B || '۳'} | ایمنی/HSE (S): ${competencyScores?.S || '۳'} | رهبری/کار تیمی (L): ${competencyScores?.L || '۳'}

        متن نظر سرپرست را به بازخوردی مربی‌منشانه و انگیزشی بازنویسی کنید (refinedComment)، برای هر بعد یک توصیه ارتقا بدهید، حداقل ۳ اقدام عملی برای IDP و نقاط قوت را مشخص کنید.
        خروجی دقیقاً یک JSON با این ساختار باشد:
        {"refinedComment": "...", "competencyFeedback": {"quantitative": "...", "quality": "...", "behavioral": "...", "safetyHse": "...", "leadershipTeam": "..."}, "strengths": ["..."], "actionPlan": ["..."]}
      `;

      try {
        const parsed = await callGeminiJson(
          apiKey,
          prompt,
          'You are a master corporate HR feedback specialist and executive coach. Return structured JSON in fluent Persian.'
        );
        return json(parsed);
      } catch {
        return json(buildFallback());
      }
    }

    // ===== gemini/coaching =====
    if (path === 'gemini/coaching') {
      const { employeeName = 'همکار', jobTitle = 'شاغل', period = 'جاری', scores, note = '' } = body;

      if (!scores || !Array.isArray(scores)) {
        return json({ error: 'ماتریس امتیازات برای پردازش هوش مصنوعی نامعتبر است.' }, 400);
      }

      const buildFallback = () => ({
        feedback: {
          strengths: [
            'پایبندی به انضباط کاری و مسئولیت‌پذیری در انجام وظایف محوله',
            'تسلط فنی مناسب بر فرآیندهای کاری و پیگیری اهداف',
            'تعامل سازنده با همکاران و پذیرش بازخوردهای سرپرست',
          ],
          developmentAreas: [
            'تقویت دقت و کاهش دوباره‌کاری در فرآیندهای کیفی',
            'مدیریت زمان و اولویت‌بندی وظایف در ساعات پیک کاری',
          ],
          actionItems: [
            'گذراندن یک دوره آموزشی تخصصی مرتبط با شغل در نیم‌سال آتی',
            'تعریف و اجرای یک پروژه بهبود کوچک در ایستگاه کاری با شاخص سنجش مشخص',
            'برگزاری جلسات بازخورد منظم ماهانه با سرپرست مستقیم',
          ],
          summary:
            'همکار گرامی، عملکرد شما در این دوره نشان‌دهنده تعهد و توانمندی فنی ارزشمندی است. با تمرکز بر حوزه‌های بهبود پیشنهادی و اجرای برنامه‌های توسعه، مسیر رشد چشمگیری پیش روی شماست.',
        },
        isFallback: true,
      });

      if (!apiKey) return json(buildFallback());

      const prompt = `
        به عنوان یک متخصص ارشد منابع انسانی، مربی سازمانی و روانشناس صنعتی، کارنامه عملکرد پرسنل زیر را بررسی کرده و یک برنامه توسعه فردی (IDP) و بازخورد رشددهنده به زبان فارسی روان، سازنده و مربی‌منشانه تهیه کنید.

        - نام: ${employeeName}
        - عنوان شغلی: ${jobTitle}
        - دوره ارزیابی: ${period}

        امتیازات ثبت شده (مقیاس ۱ تا ۵):
        ${scores.map((s: any) => `- شاخص [${s.code}] ${s.name} (دسته: ${s.category}) | امتیاز سرپرست: ${s.value} از ۵ | خودارزیابی: ${s.self} از ۵ | مستند: ${s.doc || 'ندارد'}`).join('\n')}

        یادداشت سرپرست: "${note || 'توضیحی ثبت نشده است'}"

        شاخص‌های با امتیاز ۴ یا ۵ را نقطه قوت و شاخص‌های با امتیاز ۱ یا ۲ را فرصت بهبود تحلیل کنید. حداقل ۳ اقدام عملیاتی و قابل سنجش و یک خلاصه انگیزشی ارائه دهید.
        خروجی دقیقاً یک JSON با این ساختار باشد (بدون بلاک کد اضافی):
        {"feedback": {"strengths": ["..."], "developmentAreas": ["..."], "actionItems": ["..."], "summary": "..."}}
      `;

      try {
        const parsed = await callGeminiJson(
          apiKey,
          prompt,
          'You are an elite organizational psychologist, HR executive, and corporate performance coach. You speak fluent, professional Persian and design realistic IDPs. Always return valid JSON.'
        );
        // Normalize: ensure a `feedback` wrapper exists
        if (parsed && parsed.feedback) return json(parsed);
        if (parsed && parsed.strengths) return json({ feedback: parsed });
        return json(buildFallback());
      } catch {
        return json(buildFallback());
      }
    }

    // ===== gemini/bias-check =====
    if (path === 'gemini/bias-check') {
      const { employeeName = 'همکار', jobTitle = 'پرسنل', period = 'جاری', note = '', scores = [] } = body;

      if (!note && (!scores || scores.length === 0)) {
        return json({ error: 'محتوایی برای ارزیابی سوگیری یافت نشد.' }, 400);
      }

      const buildFallback = () => {
        const hasExtremeScores =
          scores.length > 0 &&
          (scores.every((s: any) => s.value === 5) || scores.every((s: any) => s.value === 1));
        const isShortNote = note.trim().length > 0 && note.trim().length < 15;

        const biases: any[] = [];
        if (hasExtremeScores) {
          biases.push({
            type: 'halo_horns',
            title: 'احتمال خطای هاله (Halo/Horns Effect)',
            severity: 'medium',
            description: 'تمام نمرات ثبت شده یکدست هستند. شایستگی‌ها معمولاً توزیع متفاوتی دارند.',
            highlightSnippet: 'نمرات یکنواخت در تمام ابعاد',
          });
        }
        if (isShortNote) {
          biases.push({
            type: 'lack_of_evidence',
            title: 'توضیحات بسیار مختصر و فاقد شواهد عینی',
            severity: 'low',
            description: 'توضیحات ارزیابی عملکرد برای ارائه بازخورد اثربخش بسیار کوتاه است.',
            highlightSnippet: note,
          });
        }

        return {
          integrityScore: biases.length === 0 ? 92 : 75,
          hasWarnings: biases.length > 0,
          biasesDetected: biases,
          suggestedRevision: note
            ? 'عملکرد همکار در طول دوره به طور کلی مورد بررسی قرار گرفت. در حوزه نتایج کمی شاخص‌ها محقق گردید و در خصوص رفتارهای شغلی و ایمنی، توصیه به ارتقای تعاملات تیمی و رعایت دقیق‌تر رویه‌ها می‌گردد.'
            : 'توضیحی جهت بازنویسی وارد نشده است.',
          coachingAdvice:
            'پیشنهاد می‌شود در جلسه بازخورد، ابتدا بر دستاوردها و نقاط قوت تکیه نموده و سپس با ارائه مصادیق مشخص، برنامه‌های بهبود را مطرح فرمایید.',
          fallback: true,
        };
      };

      if (!apiKey) return json(buildFallback());

      const prompt = `
        شما یک متخصص ارشد روانشناسی سازمانی و ممیزی سوگیری‌های رفتاری در ارزیابی عملکرد هستید.
        متن توضیحات سرپرست و الگوی نمره‌دهی او را قبل از نهایی شدن فرم به دقت تحلیل کنید.

        - نام ارزیابی‌شونده: ${employeeName}
        - عنوان شغلی: ${jobTitle}
        - دوره: ${period}
        - یادداشت سرپرست: """${note || '(هیچ یادداشتی نوشته نشده است)'}"""
        - ماتریس نمرات (۱ تا ۵):
        ${(scores || []).map((s: any) => `- [${s.code || 'Criterion'}] ${s.name || ''}: امتیاز ${s.value} از ۵ | خودارزیابی: ${s.self || '-'} | مستند: ${s.doc || 'ندارد'}`).join('\n')}

        سوگیری‌ها را بررسی کنید: خطای هاله/شاخ، سوگیری تازگی، ارفاق/سخت‌گیری افراطی، لحن نامناسب، فقدان شواهد عینی، کلیشه‌سازی.
        یک امتیاز سلامت و بی‌طرفی از ۰ تا ۱۰۰ محاسبه کنید (بالای ۸۵ سالم). یک بازنویسی حرفه‌ای و یک توصیه به ارزیاب ارائه دهید.
        خروجی دقیقاً یک JSON با این ساختار باشد:
        {"integrityScore": 0, "hasWarnings": false, "biasesDetected": [{"type": "halo_horns|recency|leniency_strictness|inappropriate_tone|lack_of_evidence|generic", "title": "...", "severity": "high|medium|low", "description": "...", "highlightSnippet": "..."}], "suggestedRevision": "...", "coachingAdvice": "..."}
      `;

      try {
        const parsed = await callGeminiJson(
          apiKey,
          prompt,
          'You are an HR Bias & Ethics auditor for corporate performance reviews. Respond with precise Persian JSON analyzing cognitive biases, tone, halo effect, and constructive rewrites.'
        );
        return json({
          integrityScore: parsed.integrityScore ?? 85,
          hasWarnings: parsed.hasWarnings ?? false,
          biasesDetected: parsed.biasesDetected ?? [],
          suggestedRevision: parsed.suggestedRevision || '',
          coachingAdvice: parsed.coachingAdvice || '',
        });
      } catch {
        return json(buildFallback());
      }
    }

    // ===== gemini/nine-box-analysis =====
    if (path === 'gemini/nine-box-analysis') {
      const { boxesSummary = [], totalHeadcount = 0, period = 'جاری' } = body;

      const buildFallback = () => ({
        executiveSummary:
          'توزیع استعدادهای سازمان نشان‌دهنده یک هسته باثبات از پرسنل مجرب در رده‌های میانی است. با توجه به حضور پرسنل با پتانسیل بالا در واحدهای فنی، سرمایه‌گذاری در مسیرهای شایستگی مدیریتی و جانشین‌پروری فوریت دارد.',
        talentHealthScore: 84,
        boxRecommendations: [
          {
            boxId: 'star',
            boxTitle: 'ستارگان سازمان (عملکرد عالی - پتانسیل عالی)',
            headcount: 2,
            strategicGuidance: 'سرمایه کلیدی آینده سازمان؛ با پروژه‌های تحول‌آفرین و بسته‌های جبران خدمت رقابتی حفظ شوند.',
            individualCoachingTips: ['واگذاری نقش مربیگری نیروهای جوان‌تر', 'تعریف پروژه‌های بین‌رشته‌ای', 'گفت‌وگوی شفاف در مورد مسیر شغلی آینده'],
            recommendedActions: ['قرارگیری در صدر کاندیداهای جانشین‌پروری', 'اعطای پاداش شایستگی و ارتقای گرید'],
          },
          {
            boxId: 'high_potential',
            boxTitle: 'پتانسیل رهبری (عملکرد متوسط - پتانسیل بالا)',
            headcount: 3,
            strategicGuidance: 'ظرفیت رهبری بالا اما نیازمند تثبیت در شاخص‌های کمی و فنی.',
            individualCoachingTips: ['تمرکز بر مدیریت زمان و اولویت‌بندی', 'بازخورد مستمر ماهانه از سرپرست'],
            recommendedActions: ['حضور در دوره‌های تخصصی حل مسئله و رهبری اجرایی'],
          },
          {
            boxId: 'core',
            boxTitle: 'هسته قابل اتکا (عملکرد خوب - پتانسیل متوسط)',
            headcount: 4,
            strategicGuidance: 'ستون فقرات عملیات روزمره؛ تداوم تولید وابسته به آن‌هاست.',
            individualCoachingTips: ['ارج‌نهادن به ثبات و وفاداری سازمانی', 'به‌روزرسانی دانش فنی'],
            recommendedActions: ['آموزش‌های مهارتی تکمیلی و بازآموزی استانداردهای کیفی'],
          },
          {
            boxId: 'underperformer',
            boxTitle: 'نیازمند بهبود / در معرض ریسک (عملکرد پایین)',
            headcount: 1,
            strategicGuidance: 'ریشه‌یابی فوری علت افت عملکرد (ابهام شغلی، انگیزش یا عدم تناسب مهارت).',
            individualCoachingTips: ['جلسه مربیگری فشرده برای شفاف‌سازی انتظارات', 'بررسی موانع و ارگونومی کاری'],
            recommendedActions: ['تدوین برنامه بهبود عملکرد ۹۰ روزه (PIP)', 'ارزیابی مجدد پس از دوره بازنگری'],
          },
        ],
        successionAndRetention: [
          'ایجاد برنامه مربیگری اختصاصی برای نیروهای ستاره و پتانسیل بالا',
          'تعریف مسیر رشد دوگانه (تخصصی-فنی / مدیریتی) برای حفظ نخبگان',
        ],
        riskInterventions: [
          'تدوین فوری برنامه بهبود عملکرد (PIP) با شاخص‌های کمی و ملموس',
          'جابجایی درون‌سازمانی در صورت عدم تناسب شغل با توانمندی فرد',
        ],
        isFallback: true,
      });

      if (!apiKey) return json(buildFallback());

      const prompt = `
        به عنوان یک مشاور ارشد استعدادهای انسانی و مشاور مدیرعامل، ماتریس ۹ خانه‌ای استعداد کارخانه را تحلیل کنید.

        دوره ارزیابی: ${period}
        تعداد کل ارزیابی‌شوندگان: ${totalHeadcount} نفر
        توزیع کارکنان در ۹ خانه ماتریس:
        ${JSON.stringify(boxesSummary, null, 2)}

        یک تحلیل کلان مدیریتی، نمره سلامت سبد استعداد (۰ تا ۱۰۰)، توصیه‌های تفکیکی برای هر خانه، و راهبردهای جانشین‌پروری و اقدامات ریسک ارائه دهید.
        خروجی دقیقاً یک JSON با این ساختار باشد:
        {"executiveSummary": "...", "talentHealthScore": 0, "boxRecommendations": [{"boxId": "...", "boxTitle": "...", "headcount": 0, "strategicGuidance": "...", "individualCoachingTips": ["..."], "recommendedActions": ["..."]}], "successionAndRetention": ["..."], "riskInterventions": ["..."]}
      `;

      try {
        const parsed = await callGeminiJson(
          apiKey,
          prompt,
          'You are an elite Talent Management Director and Executive Coach. Analyze 9-Box talent matrix data and produce actionable strategic HR recommendations in fluent Persian JSON.'
        );
        return json(parsed);
      } catch {
        return json(buildFallback());
      }
    }

    // Unknown gemini sub-route
    return json({ error: 'Endpoint not found' }, 404);
  }

  return json({ error: 'Endpoint not found' }, 404);
};
