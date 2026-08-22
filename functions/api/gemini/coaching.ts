export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, period, scores, note } = body;
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "کلید API یافت نشد." }), { status: 500 });

    const prompt = `شما به عنوان یک مربی توسعه فردی (IDP) حرفه ای عمل می کنید...
      - نام: ${employeeName}
      - عنوان: ${jobTitle}
      - دوره: ${period}
      نمرات: ${scores.map(s => `- [${s.code}] ${s.name} | سیستم: ${s.value} خودارزیابی: ${s.self}`).join('\n')}
      یادداشت: "${note}"
      خروجی دقیقاً یک JSON باشد: {"strengths": ["..."], "developmentAreas": ["..."], "actionItems": ["..."], "summary": "..."}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } };
    const response = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let textResult = data.candidates[0].content.parts[0].text.trim();
    if (textResult.startsWith('```json')) textResult = textResult.replace('```json', '').replace('```', '').trim();
    return new Response(JSON.stringify({ feedback: JSON.parse(textResult) }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'خطا', details: error.message }), { status: 500 });
  }
}
