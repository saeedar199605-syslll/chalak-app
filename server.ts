/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse incoming JSON payloads
app.use(express.json({ limit: '20mb' }));

// Database Persistence File
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

// In-Memory State Store
let memoryState: Record<string, any> = {};

// Load persisted state if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    memoryState = JSON.parse(raw);
    console.log('Loaded database state from file storage.');
  } catch (e) {
    console.error('Failed to parse database state file:', e);
  }
}

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

// API: State sync endpoint (GET & POST)
app.get('/api/state', (req, res) => {
  res.json(memoryState);
});

app.post('/api/state', (req, res) => {
  try {
    memoryState = req.body || {};
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryState, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err: any) {
    console.error('State save error:', err);
    res.status(500).json({ error: 'Failed to persist state', details: err.message });
  }
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
      model: 'gemini-3.7-flash',
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

// API: AI-Powered Evaluator Bias & Tone Pre-Finalization Checker
app.post('/api/gemini/bias-check', async (req, res) => {
  try {
    const { employeeName, jobTitle, period, note, scores } = req.body;

    if (!note && (!scores || scores.length === 0)) {
      return res.status(400).json({ error: 'محتوایی برای ارزیابی سوگیری یافت نشد.' });
    }

    const ai = getGeminiClient();

    const prompt = `
      شما یک متخصص ارشد روانشناسی سازمانی، داوری عملکرد و ممیزی سوگیری‌های رفتاری در فرآیندهای ارزیابی عملکرد کارکنان هستید.
      وظیفه شما این است که متن توضیحات سرپرست/مدیر ارزیاب و الگوی نمره‌دهی او را قبل از نهایی شدن فرم، به دقت بررسی و آنالیز کنید.

      اطلاعات پرونده ارزیابی:
      - نام ارزیابی‌شونده: ${employeeName || 'همکار'}
      - عنوان شغلی: ${jobTitle || 'پرسنل'}
      - دوره: ${period || 'جاری'}

      توضیحات و یادداشت ثبت‌شده توسط سرپرست/مدیر:
      """
      ${note || '(هیچ یادداشتی نوشته نشده است)'}
      """

      ماتریس نمرات ثبت‌شده توسط سرپرست (مقیاس ۱ تا ۵):
      ${(scores || []).map((s: any) => `- [${s.code || 'Criterion'}] ${s.name || ''}: امتیاز ${s.value} از ۵ | خودارزیابی کارمند: ${s.self || '-'} | مستند ثبت‌شده: ${s.doc || 'ندارد'}`).join('\n')}

      انواع سوگیری‌ها و خطاهایی که باید بررسی و کشف کنید:
      ۱. لحن نامناسب، تحقیرآمیز، تهاجمی یا مبهم (Inappropriate / Harsh Tone)
      ۲. خطای هاله / شاخ (Halo / Horns Effect): دادن نمره یکدست بالا (همه ۵) یا یکدست پایین (همه ۱) بدون تفکیک شایستگی‌ها صرفاً بر اساس یک حس کلی مثبت یا منفی
      ۳. سوگیری تازگی (Recency Bias): قضاوت کل دوره ۶ ماهه صرفاً بر اساس یک رخداد مثبت یا منفی در هفته‌های اخیر
      ۴. سوگیری ارفاق یا سخت‌گیری افراطی (Leniency / Strictness Bias): نمرات غیرواقعی بدون پشتیبانی مستندات
      ۵. فقدان شواهد عینی و اتکا به ادعاهای ذهنی (Lack of Evidence / Subjective Judgments): عباراتی مانند «کلاً ضعیف است» یا «همیشه بی‌دقت است» بدون ذکر مثال ملموس
      ۶. کلیشه‌سازی یا تعمیم‌های ناروا

      دستورالعمل خروجی:
      - یک امتیاز سلامت و بی‌طرفی از ۰ تا ۱۰۰ محاسبه کنید (integrityScore). بالای ۸۵ یعنی سالم، زیر ۸۵ یعنی دارای هشدار و نیازمند اصلاح.
      - در صورتی که سوگیری یا لحن نامناسبی وجود دارد، هشدار دقیق همراه با قطعه متن مربوطه و توضیح شفاف ارائه دهید.
      - یک پیشنهاد بازنویسی حرفه‌ای (suggestedRevision) ارائه دهید که همان منظور را به شکلی سازنده، حرفه‌ای، محترمانه و مبتنی بر شواهد بیان کند.
      - یک توصیه به ارزیاب (coachingAdvice) برای هدایت مکالمه حضوری بنویسید.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an HR Bias & Ethics auditor for corporate performance reviews. Respond with precise, insightful Persian (Farsi) JSON analyzing cognitive biases, evaluator tone, halo effect, and constructive rewrites.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            integrityScore: {
              type: Type.INTEGER,
              description: "امتیاز بی‌طرفی و سلامت ارزیابی بین ۰ تا ۱۰۰"
            },
            hasWarnings: {
              type: Type.BOOLEAN,
              description: "آیا سوگیری یا لحن نامناسب شناسایی شد یا خیر"
            },
            biasesDetected: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "یکی از: halo_horns, recency, leniency_strictness, inappropriate_tone, lack_of_evidence, generic"
                  },
                  title: {
                    type: Type.STRING,
                    description: "عنوان سوگیری به فارسی روان، مانند «خطای هاله (Halo Effect)» یا «لحن کلی و فاقد مصداق عینی»"
                  },
                  severity: {
                    type: Type.STRING,
                    description: "شدت: high, medium, low"
                  },
                  description: {
                    type: Type.STRING,
                    description: "توضیح تحلیلی علت شناسایی این سوگیری در ارزیابی جاری"
                  },
                  highlightSnippet: {
                    type: Type.STRING,
                    description: "بخشی از متن یا نمرات که نشانه سوگیری است"
                  }
                },
                required: ["type", "title", "severity", "description"]
              },
              description: "لیست خطاهای شناختی یا سوگیری‌های شناسایی شده"
            },
            suggestedRevision: {
              type: Type.STRING,
              description: "پیشنهاد بازنویسی حرفه‌ای و مربی‌منشانه متن ارزیاب به فارسی استاندارد و شفاف"
            },
            coachingAdvice: {
              type: Type.STRING,
              description: "توصیه عملیاتی به ارزیاب جهت مدیریت جلسه بازخورد با همکار"
            }
          },
          required: ["integrityScore", "hasWarnings", "biasesDetected", "suggestedRevision", "coachingAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const parsed = JSON.parse(text.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.error("Gemini Bias Check Error:", error);
    
    // Heuristic fallback for offline/test environments
    const { note = '', scores = [] } = req.body || {};
    const hasExtremeScores = scores.length > 0 && (scores.every((s: any) => s.value === 5) || scores.every((s: any) => s.value === 1));
    const isShortNote = note.trim().length > 0 && note.trim().length < 15;
    
    const biases: any[] = [];
    if (hasExtremeScores) {
      biases.push({
        type: 'halo_horns',
        title: 'احتمال خطای هاله (Halo/Horns Effect)',
        severity: 'medium',
        description: 'تمام نمرات ثبت شده یکدست هستند. شایستگی‌ها معمولاً در بخش‌های مختلف توزیع متفاوتی دارند.',
        highlightSnippet: 'نمرات یکنواخت در تمام ابعاد'
      });
    }
    if (isShortNote) {
      biases.push({
        type: 'lack_of_evidence',
        title: 'توضیحات بسیار مختصر و فاقد شواهد عینی',
        severity: 'low',
        description: 'توضیحات ارزیابی عملکرد برای ارائه بازخورد اثربخش به همکار بسیار کوتاه است.',
        highlightSnippet: note
      });
    }

    return res.json({
      integrityScore: biases.length === 0 ? 92 : 75,
      hasWarnings: biases.length > 0,
      biasesDetected: biases,
      suggestedRevision: note ? `عملکرد همکار در طول دوره به طور کلی مورد بررسی قرار گرفت. در حوزه نتایج کمی شاخص‌ها محقق گردید و در خصوص رفتارهای شغلی و ایمنی، توصیه به ارتقای تعاملات تیمی و رعایت دقیق‌تر رویه‌ها می‌گردد.` : 'توضیحی جهت بازنویسی وارد نشده است.',
      coachingAdvice: 'پیشنهاد می‌شود در جلسه بازخورد، ابتدا بر دستاوردها و نقاط قوت تکیه نموده و سپس با ارائه مصادیق مشخص، برنامه‌های بهبود را مطرح فرمایید.',
      fallback: true
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
