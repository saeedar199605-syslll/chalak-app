/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  HelpCircle, 
  PlayCircle, 
  ShieldAlert, 
  Sparkles, 
  FileCheck2, 
  ArrowLeft, 
  Info,
  ChevronRight,
  TrendingUp,
  Brain,
  ThumbsUp
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  hasCertifiedBadge: boolean;
  onGrantBadge: () => void;
  theme: 'light' | 'dark';
}

export default function Onboarding({ onComplete, hasCertifiedBadge, onGrantBadge, theme }: OnboardingProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'خوش‌آمدگویی و معرفی دوره اصفهان چالاک',
      icon: GraduationCap,
      color: 'teal',
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-sm font-bold text-teal-400">به چرخه توسعه و ارزیابی شایستگی‌های اصفهان چالاک خوش‌آمدید!</p>
          <p>
            شرکت تولیدی و صنعتی <span className="font-bold text-teal-400">اصفهان چالاک</span> معتقد است رشد پایدار کارخانه و کیفیت قطعات ارسالی به مشتریان، در گرو توسعه، خودآگاهی و ارزیابی عادلانه عملکرد همکاران گرانقدرمان است.
          </p>
          <p>
            این سامانه پیشرو بر اساس رویکرد <span className="font-bold">مربی‌گری (Coaching)</span> و به کارگیری هوش مصنوعی پیشرفته طراحی شده است. هدف ما صرفاً مچ‌گیری یا رتبه‌بندی خشک پرسنل نیست، بلکه کشف استعدادها، برطرف کردن موانع کاری و تدوین مستمر برنامه‌های بهبود فردی (IDP) است.
          </p>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 mt-2">
            <h4 className="font-bold text-slate-200">سرفصل‌های آموزش بدو ورود ارزیابی:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>آشنایی با شایستگی‌های عمومی و تخصصی کارگاهی</li>
              <li>رعایت ضوابط ضدسوگیری و کنترل تورم نمره‌ای</li>
              <li>تکمیل خودارزیابی و مشارکت در تفاهم مربیگری</li>
              <li>دریافت برنامه اقدام هوشمند توسعه فردی از AI</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'ابعاد پنج‌گانه شایستگی و فرمول‌های سنجش',
      icon: TrendingUp,
      color: 'indigo',
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p>در شرکت اصفهان چالاک، شایستگی‌های همکاران بر اساس ۵ ستون اصلی سنجیده می‌شود:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <h4 className="font-bold text-blue-400">۱. نتایج کمی (KPI / K)</h4>
              <p className="text-[10px] text-slate-400 mt-1">تولید واقعی خط، راندمان زمانی OEE و نرخ توقفات قابل‌کنترل استخراج‌شده مستقیم از نرم‌افزار کارخانه‌ای MES.</p>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <h4 className="font-bold text-amber-400">۲. کیفیت و انطباق (Q)</h4>
              <p className="text-[10px] text-slate-400 mt-1">رعایت بی‌چون و چرای دستورالعمل‌های استاندارد کارگاهی SOP، عدم ضایعات و ثبت سوابق کنترل فرآیند.</p>
            </div>
            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
              <h4 className="font-bold text-purple-400">۳. رفتارهای شایستگی (B)</h4>
              <p className="text-[10px] text-slate-400 mt-1">انضباط کاری عالی، وقت‌شناسی حضور و غیاب، همکاری تیمی فعال و احساس مالکیت نسبت به تمیزی و ابزار ایستگاه.</p>
            </div>
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
              <h4 className="font-bold text-rose-400">۴. ایمنی و بهداشت (HSE / S)</h4>
              <p className="text-[10px] text-slate-400 mt-1">رعایت الزامات کلاه، کفش و دستکش کار، ثبت شبه‌حوادث و اجرای موازین نظام آراستگی کارگاه (5S). این بعد برای همگان <span className="text-rose-400 font-bold">اجباری</span> است.</p>
            </div>
          </div>
          <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl">
            <h4 className="font-bold text-teal-400">رهبری و توسعه تیم (L) - ویژه سرپرستان</h4>
            <p className="text-[10px] text-slate-400 mt-1">انتقال دانش فنی به پرسنل جدید، مربی‌گری همکاران ضعیف‌تر و هدایت تیم در چالش‌های عملیاتی خط تولید.</p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'قانون طلایی ضدسوگیری و مستندات اجباری',
      icon: ShieldAlert,
      color: 'rose',
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-xl">
            <h3 className="font-bold flex items-center gap-1.5 text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>پدیده تورم نمره‌ای و سلیقه‌گرایی ارزیابی‌ها</span>
            </h3>
            <p className="mt-1 text-[11px]">
              آیا می‌دانید طبق آمار، ارزیابی‌های سنتی به دلیل پدیده «هاله» یا تعارفات بین سرپرست و کارگر، نمراتی غیرواقعی (تورم نمره) دریافت می‌کنند؟ این موضوع حق نیروهای واقعاً زحمت‌کش را تضییع می‌کند.
            </p>
          </div>

          <p className="font-bold text-slate-200">شرکت اصفهان چالاک این مشکل را به کمک دو فیلتر سخت‌گیرانه برطرف کرده است:</p>
          
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">۱</div>
              <div>
                <span className="font-bold text-slate-200">الزام ثبت شواهد و توجیه کتبی:</span>
                <p className="text-slate-400 mt-0.5">اگر سرپرستی به همکاری نمره <span className="text-red-400 font-bold">۱ (غیرقابل قبول)</span>، <span className="text-orange-400 font-bold">۲ (نیازمند بهبود)</span> یا نمره نهایی عالی <span className="text-emerald-400 font-bold">۵ (فراتر از انتظار)</span> بدهد، سیستم تا زمانی که حداقل ۵ کاراکتر توضیح یا لینک سند پشتیبان (مثلاً شماره لاگ سیستم یا گزارش کیفی) ثبت نشود، پرونده را قفل نگه می‌دارد.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">۲</div>
              <div>
                <span className="font-bold text-slate-200">فرآیند کالیبراسیون سازمانی (گام ۵):</span>
                <p className="text-slate-400 mt-0.5">کمیته عالی کالیبراسیون اصفهان چالاک، کل نمرات کارگاه را به صورت توزیع نرمال (زنگوله‌ای) بررسی می‌کند. سهم کارنامه‌های رتبه عالی A نباید از ۱۵ الی ۲0 درصد فراتر رود تا از عدالت نمره‌ای مطمئن شویم.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'آزمون بدو ورود و اخذ گواهینامه ارزیابی',
      icon: Award,
      color: 'purple',
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p>
            جهت فعال‌سازی کامل امکانات مدیریتی ارزیابی، لطفاً به سوالات آزمون تایید صلاحیت ارزیابی اصفهان چالاک در کادر زیر پاسخ دهید. برای قبولی باید به هردو سوال پاسخ صحیح دهید تا نشان افتخار <span className="text-purple-400 font-bold">ارزیاب ذیصلاح اصفهان چالاک</span> را بر روی نمایه خود کسب کنید!
          </p>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            {quizSubmitted && quizScore === 2 ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-purple-300 text-sm">تبا‌ریک! آزمون بدو ورود را با موفقیت گذراندید</h4>
                <p className="text-slate-400">گواهینامه «ارزیاب معتمد اصفهان چالاک» صادر و روی پرونده شما درج شد.</p>
                <div className="inline-block bg-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded text-[10px] border border-purple-500/30">
                  🎖️ ارزیاب ذیصلاح اصفهان چالاک
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Q1 */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-200">۱. در سامانه اصفهان چالاک، ثبت مستندات توجیهی برای کدام نمره‌ها توسط سرپرست الزامی است؟</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 1, text: 'الف) فقط نمره ۵ (عالی)' },
                      { id: 2, text: 'ب) نمرات ۱ (غیرقابل قبول)، ۲ (نیازمند بهبود) و ۵ (فراتر از انتظار)' },
                      { id: 3, text: 'ج) تمامی نمرات از ۱ تا ۵ بدون استثنا' }
                    ].map(ans => (
                      <button
                        key={ans.id}
                        type="button"
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, 1: ans.id })}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedAnswers[1] === ans.id 
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 font-bold' 
                            : 'bg-slate-950 border-slate-850 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ans.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-200">۲. هدف اصلی از ابزار مربیگری هوشمند (AI Coaching) در سامانه چیست؟</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 1, text: 'الف) مچ‌گیری فنی از اپراتورها و ثبت جریمه‌های انضباطی' },
                      { id: 2, text: 'ب) تولید خودکار نمرات بدون دخالت نظر سرپرست' },
                      { id: 3, text: 'ج) تحلیل نقاط قوت و ضعف برای ارائه برنامه اقدام عملی و رشددهنده توسعه فردی (IDP)' }
                    ].map(ans => (
                      <button
                        key={ans.id}
                        type="button"
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, 2: ans.id })}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedAnswers[2] === ans.id 
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 font-bold' 
                            : 'bg-slate-950 border-slate-850 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ans.text}
                      </button>
                    ))}
                  </div>
                </div>

                {quizSubmitted && quizScore !== 2 && (
                  <p className="text-red-400 font-bold text-xs">پاسخ‌ها صحیح نیستند. لطفاً دوباره تلاش کنید!</p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const isCorrect1 = selectedAnswers[1] === 2;
                    const isCorrect2 = selectedAnswers[2] === 3;
                    const score = (isCorrect1 ? 1 : 0) + (isCorrect2 ? 1 : 0);
                    setQuizScore(score);
                    setQuizSubmitted(true);
                    if (score === 2) {
                      onGrantBadge();
                    }
                  }}
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ثبت پاسخ و ارزیابی آزمون
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(s => s.id === activeStep)!;
  const StepIcon = currentStepData.icon;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className={`p-5 rounded-3xl border flex justify-between items-center flex-wrap gap-4 ${
        theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-100 tracking-tight">آموزش بدو ورود و توانمندسازی پرسنل</h1>
            <p className="text-xs text-slate-400 mt-1">توجیه آیین‌نامه ارزیابی عملکرد و مربیگری سرمایه‌های انسانی اصفهان چالاک</p>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>ورود به سامانه کاربری</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Row layout with steps navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Steps Selector */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          {steps.map((st) => {
            const IsActive = st.id === activeStep;
            const StepIconRef = st.icon;
            
            return (
              <button
                key={st.id}
                onClick={() => setActiveStep(st.id)}
                className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                  IsActive
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-300 font-bold'
                    : 'bg-slate-900/20 border-slate-800/60 hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  IsActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  <StepIconRef className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">بخش {st.id}</span>
                  <span className="text-xs truncate block max-w-[150px]">{st.title.split(' ')[0]} ...</span>
                </div>
              </button>
            );
          })}

          <div className="p-4 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-center space-y-2 mt-4 text-[10px] text-slate-500">
            <Info className="w-5 h-5 text-slate-600 mx-auto" />
            <p className="font-bold">نیاز به راهنمایی بیشتر؟</p>
            <p>می‌توانید با داخلی ۴۰۲ (مدیریت سرمایه‌های انسانی اصفهان چالاک) تماس حاصل فرمایید.</p>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className={`lg:col-span-3 border p-6 rounded-3xl space-y-5 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">{currentStepData.title}</h3>
              <p className="text-[10px] text-slate-500">گام آموزشی {currentStepData.id} از {steps.length}</p>
            </div>
          </div>

          <div>
            {currentStepData.content}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
            <span className="text-xs text-slate-500">
              {hasCertifiedBadge ? (
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>شما گواهی‌نامه ارزیابی را دریافت کرده‌اید</span>
                </span>
              ) : (
                <span>با اتمام هر ۴ مرحله نشان ارزیاب را فعال کنید.</span>
              )}
            </span>

            <div className="flex gap-2">
              {activeStep > 1 && (
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  مرحله قبلی
                </button>
              )}
              {activeStep < steps.length ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>مرحله بعدی</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تکمیل آموزش و ورود</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
