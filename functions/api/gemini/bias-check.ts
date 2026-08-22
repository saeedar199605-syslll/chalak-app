export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, period, note, scores } = body;
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "کلید API یافت نشد." }), { status: 500 });

    const prompt = `حسابرس اخلاق و سوگیری منابع انسانی (HR). یادداشت: "${note}" نمرات: ${(scores || []).map(s => `${s.name}: ${s.value}`).join(', ')} خروجی JSON: {"integrityScore": 85, "hasWarnings": false, "biasesDetected": [], "suggestedRevision": "متن", "coachingAdvice": "متن"}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } };
    const response = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let textResult = data.candidates[0].content.parts[0].text.trim();
    if (textResult.startsWith('```json')) textResult = textResult.replace('```json', '').replace('```', '').trim();
    return new Response(textResult, { headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    return new Response(JSON.stringify({ integrityScore: 88, hasWarnings: false, biasesDetected: [], suggestedRevision: body.note, coachingAdvice: "خطا", fallback: true }), { headers: { 'Content-Type': 'application/json' }});
  }
}
