export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, supervisorComment, competencyScores, targetRole } = body;
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    const prompt = `
        به عنوان متخصص ارزیابی عملکرد سازمانی، نظر زیر را حرفه ای کن:
        - نام: ${employeeName || 'نامشخص'}
        - عنوان: ${jobTitle || 'نامشخص'}
        - نظر مدیر: "${supervisorComment || 'بدون نظر'}"
        - نمرات: K:${competencyScores?.K}, Q:${competencyScores?.Q}, B:${competencyScores?.B}, S:${competencyScores?.S}, L:${competencyScores?.L}
        
        خروجی JSON با کلیدهای:
        refinedComment (متن اصلاح شده),
        competencyFeedback (شامل quantitative, quality, behavioral, safetyHse, leadershipTeam),
        strengths (آرایه),
        actionPlan (آرایه).
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await response.json();
    if(data.error) throw new Error(data.error.message);
    
    const textResult = data.candidates[0].content.parts[0].text;
    return new Response(textResult, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, isFallback: true }), { status: 500 });
  }
}