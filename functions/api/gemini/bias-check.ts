export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, period, note, scores } = body;

    if (!note && (!scores || scores.length === 0)) {
      return new Response(JSON.stringify({ error: 'اطلاعاتی برای بررسی وجود ندارد.' }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "کلید API یافت نشد." }), { status: 500 });

    const prompt = `
      به عنوان یک حسابرس اخلاق و سوگیری منابع انسانی (HR) عمل کن.
      - نام: ${employeeName || 'نامشخص'}
      - عنوان: ${jobTitle || 'نامشخص'}
      - دوره: ${period || 'نامشخص'}
      
      یادداشت ارزیاب: "${note || 'ندارد'}"
      
      نمرات:
      ${(scores || []).map(s => `- [${s.code || 'Criterion'}] ${s.name || ''}: سیستم ${s.value}`).join('\n')}

      موارد زیر را بررسی کن: لحن نامناسب، خطای هاله‌ای (Halo Effect)، خطای تاخر، سخت‌گیری/ارفاق بیش از حد.
      خروجی باید دقیقاً یک JSON با ساختار زیر باشد:
      {"integrityScore": 85, "hasWarnings": false, "biasesDetected": [{"type": "halo_horns", "title": "عنوان", "severity": "high", "description": "توضیح", "highlightSnippet": "متن"}], "suggestedRevision": "متن اصلاح شده", "coachingAdvice": "توصیه به مدیر"}
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    const response = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let textResult = data.candidates[0].content.parts[0].text.trim();
    if (textResult.startsWith('```json')) textResult = textResult.replace('```json', '').replace('```', '').trim();

    return new Response(textResult, { headers: { 'Content-Type': 'application/json' }});

  } catch (error) {
    const fallback = {
      integrityScore: 88, hasWarnings: false, biasesDetected: [],
      suggestedRevision: body.note, coachingAdvice: "سیستم هوش مصنوعی موقتاً در دسترس نیست.", fallback: true
    };
    return new Response(JSON.stringify(fallback), { headers: { 'Content-Type': 'application/json' }});
  }
}
