export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { boxesSummary, totalHeadcount, period } = body;
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    const prompt = `
        به عنوان متخصص مدیریت استعداد، ماتریس 9-Box زیر را تحلیل کن:
        دوره: ${period}
        تعداد کل پرسنل: ${totalHeadcount}
        داده ها: ${JSON.stringify(boxesSummary)}
        
        خروجی را به فرمت JSON تولید کن با کلیدهای:
        executiveSummary, talentHealthScore, boxRecommendations, successionAndRetention, riskInterventions
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}