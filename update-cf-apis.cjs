const fs = require('fs');

const biasCheck = `import { GoogleGenAI, Type } from '@google/genai';

export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;
    const { employeeName, jobTitle, period, note, scores } = body;

    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const prompt = \`
      شما یک متخصص ارشد روانشناسی سازمانی، داوری عملکرد و ممیزی سوگیری‌های رفتاری در فرآیندهای ارزیابی عملکرد کارکنان هستید.
      اطلاعات پرونده ارزیابی:
      - نام ارزیابی‌شونده: \${employeeName || 'همکار'}
      - عنوان شغلی: \${jobTitle || 'پرسنل'}
      - دوره: \${period || 'جاری'}
      توضیحات و یادداشت ثبت‌شده توسط سرپرست/مدیر:
      """
      \${note || '(هیچ یادداشتی نوشته نشده است)'}
      """
      ماتریس نمرات ثبت‌شده توسط سرپرست (مقیاس ۱ تا ۵):
      \${(scores || []).map((s: any) => \`- [\${s.code || 'Criterion'}] \${s.name || ''}: امتیاز \${s.value} از ۵ | خودارزیابی کارمند: \${s.self || '-'} | مستند ثبت‌شده: \${s.doc || 'ندارد'}\`).join('\\n')}
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an HR Bias & Ethics auditor. Respond with JSON.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            integrityScore: { type: Type.INTEGER },
            hasWarnings: { type: Type.BOOLEAN },
            biasesDetected: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  highlightSnippet: { type: Type.STRING }
                },
                required: ["type", "title", "severity", "description"]
              }
            },
            suggestedRevision: { type: Type.STRING },
            coachingAdvice: { type: Type.STRING }
          },
          required: ["integrityScore", "hasWarnings", "biasesDetected", "suggestedRevision", "coachingAdvice"]
        }
      }
    });

    const parsed = JSON.parse(response.text() || "{}");
    parsed.analyzedAt = new Date().toISOString();
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
`;
fs.writeFileSync('functions/api/gemini/bias-check.ts', biasCheck);

const nineBox = `import { GoogleGenAI, Type } from '@google/genai';

export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as any;
    const { matrixData, employees } = body;

    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    const summaryData = matrixData.map((d: any) => ({
      name: d.name,
      role: d.jobFamily || d.role,
      performance: d.performance,
      potential: d.potential,
      box: d.boxIndex
    }));

    const prompt = \`
      شما یک مشاور ارشد منابع انسانی (HR) هستید. 
      داده‌های ماتریس ۹ گانه (9-Box Grid):
      \${JSON.stringify(summaryData, null, 2)}
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            talentHealthScore: { type: Type.INTEGER },
            boxRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  boxId: { type: Type.STRING },
                  boxTitle: { type: Type.STRING },
                  headcount: { type: Type.INTEGER },
                  strategicGuidance: { type: Type.STRING },
                  individualCoachingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["boxId", "boxTitle", "strategicGuidance", "individualCoachingTips", "recommendedActions"]
              }
            },
            successionAndRetention: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskInterventions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["executiveSummary", "talentHealthScore", "boxRecommendations", "successionAndRetention", "riskInterventions"]
        }
      }
    });

    const parsed = JSON.parse(response.text() || "{}");
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
`;
fs.writeFileSync('functions/api/gemini/nine-box-analysis.ts', nineBox);

console.log('CF APIs updated.');
