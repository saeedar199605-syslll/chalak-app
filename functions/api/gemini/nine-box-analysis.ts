export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { boxesSummary, totalHeadcount, period } = body;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "کلید API یافت نشد." }), { status: 500 });

    const prompt = `
      به عنوان یک مدیر ارشد مدیریت استعداد (Talent Management Specialist) و مربی اجرایی عمل کن.
      داده های ماتریس استعداد ۹ گانه (9-Box Talent Matrix) بر اساس ارزیابی عملکرد (Performance) و پتانسیل (Potential):
      دوره: ${period || 'نامشخص'}
      تعداد کل پرسنل: ${totalHeadcount || 0}
      
      خلاصه وضعیت باکس‌ها:
      ${JSON.stringify(boxesSummary, null, 2)}
      
      خروجی باید دقیقاً JSON باشد با فیلدهای زیر:
      {"executiveSummary": "خلاصه مدیریتی", "talentHealthScore": 84, "boxRecommendations": [{"boxId": "شناسه", "boxTitle": "عنوان", "headcount": 2, "strategicGuidance": "راهنمایی", "individualCoachingTips": ["نکته 1"], "recommendedActions": ["اقدام 1"]}], "successionAndRetention": ["مورد 1"], "riskInterventions": ["مورد 1"]}
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
      executiveSummary: "پاسخ هوش مصنوعی در دسترس نیست. نمایش ساختار پایه.",
      talentHealthScore: 80,
      boxRecommendations: [
        {
          boxId: "core", boxTitle: "نیروهای کلیدی", headcount: body.totalHeadcount || 0,
          strategicGuidance: "حفظ و نگهداشت نیروهای فعلی.", individualCoachingTips: ["تشویق به مشارکت"], recommendedActions: ["حفظ روند فعلی"]
        }
      ],
      successionAndRetention: ["شناسایی افراد مستعد"], riskInterventions: ["نظارت بر افراد با پتانسیل پایین"], isFallback: true
    };
    return new Response(JSON.stringify(fallback), { headers: { 'Content-Type': 'application/json' }});
  }
}
