export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  const { request, env } = context;
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "کلید API تعریف نشده است." }), { status: 500 });
  }

  try {
    const body = await request.json();
    const prompt = `شما یک متخصص ارشد منابع انسانی و مربی سازمانی هستید. 
یک برنامه توسعه فردی (IDP) تهیه کنید.
اطلاعات همکار: ${body.employeeName} - ${body.jobTitle}
نمرات: ${JSON.stringify(body.scores)}
یادداشت سرپرست: ${body.note}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    const textResult = data.candidates[0].content.parts[0].text;

    return new Response(textResult, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطا در تولید بازخورد" }), { status: 500 });
  }
};
