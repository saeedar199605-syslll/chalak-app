export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { employeeName, jobTitle, period, note, scores } = body;
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    const prompt = `
        شما یک حسابرس سوگیری منابع انسانی هستید. ارزیابی زیر را بررسی کنید:
        - نام: ${employeeName}
        - عنوان: ${jobTitle}
        - متن: "${note}"
        - نمرات: ${JSON.stringify(scores)}
        
        خروجی را به صورت JSON با کلیدهای زیر تولید کنید:
        integrityScore (عدد 0 تا 100),
        hasWarnings (boolean),
        biasesDetected (آرایه شامل ابجکت هایی با type, title, severity, description, highlightSnippet),
        suggestedRevision (متن),
        coachingAdvice (متن)
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