export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  const { request, env } = context;
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "کلید API تعریف نشده است." }), { status: 500 });
  }

  try {
    const body = await request.json();
    const prompt = `شما یک مشاور ارشد توسعه شایستگی و مربیگری عملکرد منابع انسانی هستید.
اطلاعات ارزیابی:
- نام پرسنل: ${body.employeeName || 'همکار'}
- عنوان شغلی: ${body.jobTitle || 'پرسنل'}
- متن خام نظر سرپرست: "${body.supervisorComment || 'نظری ثبت نشده است'}"
- وضعیت شایستگی‌ها:
${JSON.stringify(body.competencyScores)}
لطفاً نظر سرپرست را به یک بازخورد مربی‌منشانه بازنویسی کنید و برای ابعاد پنج‌گانه پیشنهاد دهید.`;

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
    return new Response(JSON.stringify({ error: "خطا در پردازش هوش مصنوعی" }), { status: 500 });
  }
};
