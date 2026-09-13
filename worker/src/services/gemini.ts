export interface CoachingAiRequest {
  employeeName: string;
  jobTitle: string;
  cycle: string;
  scores: Array<{ criterionTitle: string; score: number; selfScore?: number; doc?: string }>;
  note?: string;
}

export interface CoachingAiResponse {
  strengths: string[];
  developmentAreas: string[];
  actionItems: string[];
  managerConversationGuide: string[];
  riskFlags: string[];
  summary: string;
  model: string;
  timestamp: string;
}

export async function generateCoachingPlan(
  apiKey: string,
  req: CoachingAiRequest
): Promise<CoachingAiResponse> {
  const prompt = `شما به عنوان مربی ارشد منابع انسانی (HR Executive Coach) در سازمان صنعتی اصفهان چالاک فعالیت می‌کنید.
اطلاعات ارزیابی عملکرد زیر را تحلیل کرده و برنامه توسعه فردی (IDP) و راهنمای گفتگوی بازخورد سرپرست را تولید کنید:

نام همکار: ${req.employeeName}
سمت: ${req.jobTitle}
دوره ارزیابی: ${req.cycle}
نمرات شاخص‌ها:
${req.scores.map(s => `- ${s.criterionTitle}: نمره سرپرست ${s.score} از ۵ ${s.selfScore ? `(خودارزیابی: ${s.selfScore})` : ''} ${s.doc ? `| مستندات: ${s.doc}` : ''}`).join('\n')}

یادداشت تکمیلی: ${req.note || 'ندارد'}

خروجی را الزاما در قالب یک آبجکت JSON معتبر و بدون هیچ تگ مارک‌داون با این کلیدها برگردانید:
{
  "strengths": ["نقاط قوت"],
  "developmentAreas": ["زمینه‌های نیازمند ارتقا"],
  "actionItems": ["اقدامات عملیاتی قابل سنجش"],
  "managerConversationGuide": ["نکات و سوالات راهنما برای سرپرست در جلسه بازخورد"],
  "riskFlags": ["ریسک‌های بالقوه عملکردی یا انگیزشی"],
  "summary": "خلاصه تحلیلی جامع و حرفه‌ای"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`خطا در اتصال به سرویس هوش مصنوعی Gemini: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('پاسخی از مدل هوش مصنوعی دریافت نشد.');

  const parsed = JSON.parse(rawText);
  return {
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    developmentAreas: Array.isArray(parsed.developmentAreas) ? parsed.developmentAreas : [],
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    managerConversationGuide: Array.isArray(parsed.managerConversationGuide) ? parsed.managerConversationGuide : [],
    riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
    summary: parsed.summary || 'خلاصه مربیگری ثبت شد.',
    model: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  };
}
