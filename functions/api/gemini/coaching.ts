export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, period, scores, note } = body;
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    const prompt = `
        به عنوان مربی توسعه سازمانی، برنامه توسعه فردی (IDP) برای کارمند زیر بنویس:
        - نام: ${employeeName}
        - عنوان: ${jobTitle}
        - دوره: ${period}
        - امتیازات: ${JSON.stringify(scores)}
        - یادداشت ارزیاب: "${note}"
        
        خروجی فقط باید یک JSON شامل کلیدهای زیر باشد:
        {"feedback": {"strengths": ["..."], "developmentAreas": ["..."], "actionItems": ["..."], "summary": "..."}}
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
    const parsedData = JSON.parse(textResult.trim());
    
    return new Response(JSON.stringify(parsedData), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}