export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, supervisorComment, competencyScores, targetRole } = body;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "کلید API یافت نشد." }), { status: 500 });

    const prompt = `
      شما یک متخصص منابع انسانی و مربی مدیران هستید. یادداشت زیر را که مدیر نوشته، حرفه ای و سازنده بازنویسی کنید.
      - نام: ${employeeName || 'نامشخص'}
      - عنوان: ${jobTitle || 'نامشخص'}
      - هدف: ${targetRole || 'نامشخص'}
      - یادداشت مدیر: "${supervisorComment || 'ندارد'}"
      
      نمرات شایستگی:
      K: ${competencyScores?.K || '0'}, Q: ${competencyScores?.Q || '0'}, B: ${competencyScores?.B || '0'}, S: ${competencyScores?.S || '0'}, L: ${competencyScores?.L || '0'}

      خروجی باید دقیقاً JSON باشد با فیلدهای زیر:
      {"refinedComment": "متن بازنویسی شده", "competencyFeedback": {"quantitative": "تحلیل", "quality": "تحلیل", "behavioral": "تحلیل", "safetyHse": "تحلیل", "leadershipTeam": "تحلیل"}, "strengths": ["نقطه 1"], "actionPlan": ["اقدام 1"]}
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
      refinedComment: body.supervisorComment ? `نسخه ویرایش شده: ${body.supervisorComment}` : `کارمند عملکرد قابل قبولی در وظایف محوله داشته است.`,
      competencyFeedback: {
        quantitative: "نیاز به بررسی دقیق‌تر شاخص‌های کمی.", quality: "دقت و کیفیت کار در سطح استاندارد است.", behavioral: "رفتار سازمانی مناسبی مشاهده شده است.", safetyHse: "رعایت اصول ایمنی و HSE قابل قبول است.", leadershipTeam: "پتانسیل‌های کار تیمی وجود دارد."
      },
      strengths: ["آشنایی با فرایندهای کاری"], actionPlan: ["تمرکز بر کاهش خطاهای فردی"], isFallback: true
    };
    return new Response(JSON.stringify(fallback), { headers: { 'Content-Type': 'application/json' }});
  }
}
