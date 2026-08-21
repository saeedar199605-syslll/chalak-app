/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse incoming JSON payloads
app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment secrets. AI features will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY_FOR_BUILD',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API: Health probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: AI-Powered Performance Coaching Feedback Generator (RTL Persian-adapted)
app.post('/api/gemini/coaching', async (req, res) => {
  try {
    const { employeeName, jobTitle, period, scores, note } = req.body;

    if (!scores || !Array.isArray(scores)) {
      return res.status(400).json({ error: 'ماتریس امتیازات برای پردازش هوش مصنوعی نامعتبر است.' });
    }

    const ai = getGeminiClient();

    // Construct a rich, clear prompt explaining the HR metrics to Gemini in Persian
    const prompt = `
      به عنوان یک متخصص ارشد منابع انسانی، مربی سازمانی و روانشناس صنعتی، کارنامه عملکرد پرسنل زیر را بررسی کرده و یک برنامه توسعه فردی (IDP) و بازخورد رشددهنده به زبان فارسی روان، سازنده و مربی‌منشانه تهیه کنید.

      اطلاعات همکار:
      - نام: ${employeeName}
      - عنوان شغلی: ${jobTitle}
      - دوره ارزیابی: ${period}

      امتیازات ثبت شده (مقیاس ۱ تا ۵، که ۱ غیرقابل قبول و ۵ عالی/فراتر از انتظار است):
      ${scores.map(s => `- شاخص [${s.code}] ${s.name} (دسته: ${s.category}) | امتیاز سرپرست: ${s.value} از ۵ | خودارزیابی: ${s.self} از ۵ | مستندات ثبت شده: ${s.doc || 'ندارد'}`).join('\n')}

      یادداشت‌های سرپرست در گفت‌وگوی عملکرد:
      "${note || 'توضیحی ثبت نشده است'}"

      دستورالعمل تولید گزارش مربیگری:
      ۱. با توجه به امتیازات، شاخص‌هایی که امتیاز ۴ یا ۵ دارند را به عنوان نقاط قوت کلیدی تحلیل کنید.
      ۲. شاخص‌هایی که امتیاز ۱ یا ۲ دارند را به عنوان فرصت‌های اصلی بهبود به همراه پیشنهاد اقدامات اصلاحی بررسی کنید.
      ۳. حداقل ۳ برنامه اقدام مشخص (Action Items) عملیاتی، شفاف و قابل سنجش برای بهبود یا ارتقای فرد در نیم‌سال دوم ارائه دهید (مثلاً شرکت در ممیزی‌ها، مربیگری نیروهای تازه‌کار، اصلاح پارامترهای فنی).
      ۴. یک خلاصه لحن مربی‌منشانه و انگیزشی (Summary) ارائه دهید که نقاط قوت را بستاید و او را ترغیب به توسعه شایستگی‌ها کند.
      ۵. تمام متون حتماً فارسی سلیس، حرفه‌ای، دور از ادبیات کلیشه‌ای و کاملاً متناسب با نقش او باشند.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite organizational psychologist, HR executive, and corporate performance coach. You speak fluent, highly encouraging, and professional Persian (Farsi). Your goal is to guide employees on realistic individual development plans (IDPs) and offer high-integrity feedback based on their quantitative and qualitative assessment scores.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: {
              type: Type.OBJECT,
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "لیست حداقل ۳ نقطه قوت بر اساس نمرات بالای ارزیابی به زبان فارسی"
                },
                developmentAreas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "لیست حوزه‌های نیازمند بهبود و هدایت توسعه‌ای به زبان فارسی"
                },
                actionItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "لیست حداقل ۳ اقدام عملیاتی مشخص با سنجه‌های شفاف برای گام بعدی مربیگری فرد به زبان فارسی"
                },
                summary: {
                  type: Type.STRING,
                  description: "خلاصه مربیگری انگیزشی و جهت‌دهی شغلی به زبان فارسی سلیس"
                }
              },
              required: ["strengths", "developmentAreas", "actionItems", "summary"]
            }
          },
          required: ["feedback"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response returned from Gemini API");
    }

    const parsedData = JSON.parse(textResult.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Coaching API Error:", error);
    return res.status(500).json({ 
      error: 'خطایی در زمان تولید بازخورد مربیگری هوش مصنوعی رخ داد.',
      details: error.message 
    });
  }
});

// Configure Vite middleware in dev or static files serving in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from dist directory.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server booting. Listening on port http://0.0.0.0:${PORT}`);
  });
}

setupServer();
