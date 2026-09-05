export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  const { request, env } = context;
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "کلید API تعریف نشده است." }), { status: 500 });
  }

  try {
    const body = await request.json();
    const prompt = `شما یک متخصص روانشناسی سازمانی و داوری عملکرد هستید.
متن و نمرات ارزیابی را بررسی کنید تا سوگیری یا خطای هاله‌ای نداشته باشد.
اطلاعات: ${body.employeeName}
یادداشت سرپرست: ${body.note}
ماتریس نمرات: ${JSON.stringify(body.scores)}`;

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
    return new Response(JSON.stringify({ error: "خطا در بررسی سوگیری" }), { status: 500 });
  }
};
