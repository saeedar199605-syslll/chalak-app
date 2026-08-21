/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Criterion, JobProfile, Employee, Evaluation } from './types';

export const SEED_CRITERIA: Criterion[] = [
  // نتایج کمی (K)
  {
    id: 'crit-k1',
    code: 'K-01',
    cat: 'K',
    name: 'تحقق خروجی نسبت به هدف',
    def: 'درصد دستیابی به اهداف تولید هفتگی و ماهانه تعیین شده در سیستم WMS/MES',
    source: 'گزارش سیستم MES',
    method: 'نسبت کل تولید تایید شده به هدف تعیین شده (درصد)',
    dir: 'more'
  },
  {
    id: 'crit-k2',
    code: 'K-04',
    cat: 'K',
    name: 'نرخ ضایعات و دوباره‌کاری',
    def: 'درصد قطعات ضایع شده یا نیازمند دوباره‌کاری از کل تولید خط',
    source: 'ثبت کارپوشه QC / ضایعات ایستگاه',
    method: 'نسبت اقلام رد شده به کل اقلام خروجی (معکوس)',
    dir: 'less'
  },
  {
    id: 'crit-k3',
    code: 'K-06',
    cat: 'K',
    name: 'اثربخشی کلی تجهیزات (OEE)',
    def: 'میزان بهره‌وری، دسترس‌پذیری و کیفیت ماشین‌آلات در زمان کارکرد',
    source: 'لاگ دیجیتال ماشین (MES)',
    method: 'درصد تحقق بهره‌وری کل خط (درصد)',
    dir: 'more'
  },
  {
    id: 'crit-k4',
    code: 'K-07',
    cat: 'K',
    name: 'نرخ توقفات قابل‌کنترل',
    def: 'مجموع زمان توقفات خط ناشی از خطای اپراتوری، دیرکرد مواد یا خطای تنظیمات',
    source: 'ثبت سیستم مانیتورینگ توقفات خط',
    method: 'معکوس مجموع ساعات توقف غیرمجاز در ماه',
    dir: 'less'
  },
  {
    id: 'crit-k5',
    code: 'K-09',
    cat: 'K',
    name: 'پوشش بازرسی طبق برنامه',
    def: 'درصد انجام ممیزی‌ها و تست‌های محصول طبق چک‌لیست مدون کنترل کیفیت',
    source: 'کارتابل کنترل کیفیت (QC Log)',
    method: 'تعداد بازرسی‌های ثبت شده به برنامه‌ریزی مصوب',
    dir: 'more'
  },
  {
    id: 'crit-k6',
    code: 'K-10',
    cat: 'K',
    name: 'به‌موقع بودن تصمیم‌گیری ترخیص/توقف محموله',
    def: 'میانگین زمان سپری شده برای اعلام نظر فنی در خصوص محموله‌های بلاتکلیف',
    source: 'سامانه یکپارچه انبار و کیفیت',
    method: 'درصد تصمیم‌گیری‌های انجام شده زیر استاندارد زمانی ۶۰ دقیقه',
    dir: 'more'
  },
  {
    id: 'crit-k7',
    code: 'K-11',
    cat: 'K',
    name: 'زمان تعویض و راه‌اندازی (Changeover)',
    def: 'مدت زمان خاموشی دستگاه برای تغییر قالب، تعویض ابزار یا تنظیم سایز جدید تولید',
    source: 'لاگ عملیاتی راه‌اندازان تولید',
    method: 'معکوس میانگین زمان تعویض قالب در ماه (دقیقه)',
    dir: 'less'
  },

  // کیفیت و انطباق (Q)
  {
    id: 'crit-q1',
    code: 'Q-01',
    cat: 'Q',
    name: 'رعایت دقیق استانداردهای SOP',
    def: 'میزان انطباق گام‌های کاری با دستورالعمل‌های استاندارد عملیاتی مصوب خط',
    source: 'نتایج ممیزی دوره‌ای سرپرست براساس چک‌لیست BARS',
    method: 'ممیزی تصادفی ماهیانه با سنجه ۵ سطحی رفتاری'
  },
  {
    id: 'crit-q2',
    code: 'Q-03',
    cat: 'Q',
    name: 'صحت و کامل‌بودن ثبت داده‌های کیفی',
    def: 'دقت ثبت سوابق کیفی، ابعاد، عیوب و نتایج در سامانه یکپارچه سازمان بدون خطای اعتبارسنجی',
    source: 'بازرسی نمونه‌ای پرونده‌های کنترل فرآیند',
    method: 'چک‌لیست تطبیقی سوابق ثبت‌شده'
  },
  {
    id: 'crit-q3',
    code: 'Q-04',
    cat: 'Q',
    name: 'رعایت دستورالعمل فنی تنظیمات اولیه',
    def: 'دقت در اعمال پارامترهای فنی کالیبراسیون دستگاه طبق کارت مشخصات محصول',
    source: 'لاگ فنی راه‌اندازی قالب',
    method: 'چک‌لیست راه‌اندازی بدون انحراف پارامتری'
  },
  {
    id: 'crit-q4',
    code: 'Q-05',
    cat: 'Q',
    name: 'رعایت اصول نظام آراستگی (5S)',
    def: 'پاکیزه‌سازی، سازماندهی، انضباط و مرتب‌سازی ابزار و ایستگاه کاری قبل، حین و بعد از شیفت',
    source: 'امتیاز ممیزی هفتگی واحد HSE & 5S',
    method: 'میانگین نمره ممیزی‌های تصادفی ۵اس'
  },

  // ایمنی (S) - الزامی
  {
    id: 'crit-s1',
    code: 'S-01',
    cat: 'S',
    name: 'رعایت اصول ایمنی، بهداشت و موازین HSE',
    def: 'استفاده مستمر از تجهیزات حفاظت فردی (کلاه، دستکش، عینک) و گزارش‌دهی شرایط ناایمن و شبه‌حوادث',
    source: 'سیستم ثبت تخلفات ایمنی / چک‌لیست ناظر HSE',
    method: 'ارزیابی رفتاری بر اساس پرونده عدم‌انطباق (HSE Incident Rate)'
  },

  // رفتارهای شایستگی (B)
  {
    id: 'crit-b1',
    code: 'B-01',
    cat: 'B',
    name: 'نظم، تعهد کاری و انضباط حضور',
    def: 'کارت‌زنی دقیق، حضور به موقع در ایستگاه کاری و پاسخگویی سریع در تعویض شیفت',
    source: 'گزارش سیستم حضور و غیاب',
    method: 'امتیازدهی رفتاری با کسر نمره بابت تاخیرهای غیرموجه'
  },
  {
    id: 'crit-b2',
    code: 'B-03',
    cat: 'B',
    name: 'مسئولیت‌پذیری و دقت فنی در انجام وظایف',
    def: 'احساس مالکیت نسبت به ایستگاه، مراقبت اصولی از ماشین‌آلات و پاسخگویی مسئولانه در زمان رخداد خطا',
    source: 'فرم ارزیابی ۳۶۰ درجه و نظرسنجی همکاران',
    method: 'سنجش شاخص‌های تعهد و پاسخگویی رفتاری'
  },

  // رهبری و مدیریت (L)
  {
    id: 'crit-l1',
    code: 'L-01',
    cat: 'L',
    name: 'مربیگری و توسعه مهارت‌های تیم',
    def: 'تلاش فعالانه برای آموزش اپراتورهای تازه‌کار و ارتقای سطح دانش فنی اعضای خط تولید',
    source: 'پرونده آموزش‌های ثبت‌شده درون‌واحدی',
    method: 'تعداد ساعات آموزش ارائه شده و پیشرفت مهارت کارآموزان'
  }
];

export const SEED_PROFILES: JobProfile[] = [
  {
    id: 'prof-1',
    title: 'اپراتور خط تولید',
    code: 'B1',
    family: 'مشاغل کارگاهی (تولیدی)',
    locked: true,
    items: [
      { cid: 'crit-k3', weight: 20 }, // راندمان OEE
      { cid: 'crit-k4', weight: 15 }, // توقفات قابل‌کنترل
      { cid: 'crit-k2', weight: 15 }, // نرخ ضایعات
      { cid: 'crit-q1', weight: 15 }, // رعایت SOP
      { cid: 'crit-q4', weight: 10 }, // رعایت 5S
      { cid: 'crit-s1', weight: 15 }, // ایمنی (HSE) - الزامی
      { cid: 'crit-b1', weight: 10 }, // نظم و تعهد
    ]
  },
  {
    id: 'prof-2',
    title: 'اپراتور کنترل کیفیت (QC)',
    code: 'B3',
    family: 'مشاغل کارگاهی (کیفی)',
    locked: true,
    items: [
      { cid: 'crit-k5', weight: 25 }, // پوشش بازرسی طبق برنامه (بالای سقف مجاز ۲۵٪ نیست)
      { cid: 'crit-k6', weight: 15 }, // به‌موقع بودن محموله
      { cid: 'crit-q1', weight: 15 }, // رعایت SOP
      { cid: 'crit-q2', weight: 15 }, // صحت ثبت داده‌ها
      { cid: 'crit-s1', weight: 15 }, // ایمنی - الزامی
      { cid: 'crit-b2', weight: 15 }, // مسئولیت‌پذیری فنی
    ]
  },
  {
    id: 'prof-3',
    title: 'اپراتور تنظیم و راه‌اندازی (Setup)',
    code: 'B5',
    family: 'مشاغل فنی تخصصی',
    locked: false,
    items: [
      { cid: 'crit-k7', weight: 25 }, // زمان تعویض قالب
      { cid: 'crit-k4', weight: 15 }, // توقفات قابل‌کنترل
      { cid: 'crit-k2', weight: 10 }, // ضایعات
      { cid: 'crit-q1', weight: 15 }, // رعایت SOP
      { cid: 'crit-q3', weight: 10 }, // رعایت رویه تنظیم اولیه
      { cid: 'crit-s1', weight: 15 }, // ایمنی - الزامی
      { cid: 'crit-b2', weight: 10 }, // مسئولیت‌پذیری
    ]
  }
];

export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin',
    name: 'مدیریت ارشد منابع انسانی',
    code: 'ADMIN-001',
    profileId: 'prof-3',
    unit: 'ستاد مرکزی اصفهان چالاک',
    role: 'admin',
    username: 'admin'
  },
  {
    id: 'emp-1',
    name: 'مهندس علی رضایی',
    code: 'EMP-1001',
    profileId: 'prof-1', // اپراتور خط تولید
    unit: 'سالن ماشین‌کاری ۱',
    role: 'supervisor',
    username: 'ali'
  },
  {
    id: 'emp-2',
    name: 'سرکار خانم مریم احمدی',
    code: 'EMP-1002',
    profileId: 'prof-2', // QC
    unit: 'آزمایشگاه کنترل کیفیت',
    role: 'employee',
    username: 'maryam'
  },
  {
    id: 'emp-3',
    name: 'مهندس حسن کریمی',
    code: 'EMP-1003',
    profileId: 'prof-3', // تنظیم و راه‌اندازی Setup
    unit: 'سالن قالب‌سازی و راه‌اندازی',
    role: 'employee',
    username: 'hassan'
  },
  {
    id: 'emp-4',
    name: 'سرکار خانم فاطمه سعیدی',
    code: 'EMP-1004',
    profileId: 'prof-2', // تضمین کیفیت
    unit: 'واحد تعالی سازمانی و کالیبراسیون',
    role: 'supervisor',
    username: 'fatemeh'
  },
  {
    id: 'emp-5',
    name: 'مهندس رضا ابراهیمی',
    code: 'EMP-1005',
    profileId: 'prof-1', // خط تولید
    unit: 'سالن مونتاژ نهایی',
    role: 'employee',
    username: 'reza'
  }
];

export const SEED_EVALUATIONS: Evaluation[] = [
  // --- ۱. مهندس علی رضایی (روند صعودی قوی و ممتاز) ---
  {
    id: 'eval-ali-p1',
    empId: 'emp-1',
    profileId: 'prof-1',
    period: 'نیمه اول ۱۴۰۴',
    status: 'locked',
    scores: [
      { cid: 'crit-k3', weight: 20, value: 3, self: 3 },
      { cid: 'crit-k4', weight: 15, value: 3, self: 3 },
      { cid: 'crit-k2', weight: 15, value: 3, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 3, self: 4 },
      { cid: 'crit-q4', weight: 10, value: 3, self: 3 },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b1', weight: 10, value: 3, self: 3 }
    ],
    note: 'انطباق اولیه با استانداردهای تولید و عملکرد قابل قبول در خط ماشین‌کاری',
    created: 1708000000000
  },
  {
    id: 'eval-ali-p2',
    empId: 'emp-1',
    profileId: 'prof-1',
    period: 'نیمه دوم ۱۴۰۴',
    status: 'locked',
    scores: [
      { cid: 'crit-k3', weight: 20, value: 4, self: 4 },
      { cid: 'crit-k4', weight: 15, value: 4, self: 4 },
      { cid: 'crit-k2', weight: 15, value: 3, self: 4 },
      { cid: 'crit-q1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q4', weight: 10, value: 4, self: 4 },
      { cid: 'crit-s1', weight: 15, value: 5, self: 5, doc: 'ارائه طرح بهبود ایمنی نردبان اضطراری کوره' },
      { cid: 'crit-b1', weight: 10, value: 4, self: 4 }
    ],
    note: 'رشد چشمگیر در بهره‌وری OEE و رعایت استانداردهای ایمنی و بهداشت',
    created: 1713000000000
  },
  {
    id: 'eval-1',
    empId: 'emp-1',
    profileId: 'prof-1',
    period: 'نیمه اول ۱۴۰۵',
    status: 'locked',
    scores: [
      { cid: 'crit-k3', weight: 20, value: 5, self: 5, doc: 'تحقق راندمان ۱۰۲ درصدی در کوره عملیات حرارتی بر اساس گزارش MES' },
      { cid: 'crit-k4', weight: 15, value: 4, self: 4, doc: 'کاهش زمان توقفات خط به کمتر از ۱.۵ ساعت در ماه' },
      { cid: 'crit-k2', weight: 15, value: 4, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q4', weight: 10, value: 5, self: 5, doc: 'کسب رتبه برتر آراستگی محیط کار (۵اس) در ممیزی مردادماه' },
      { cid: 'crit-s1', weight: 15, value: 5, self: 5, doc: 'ارائه طرح بهبود ایمنی نردبان اضطراری خط تولید و صفر بودن خطای ایمنی' },
      { cid: 'crit-b1', weight: 10, value: 4, self: 4 }
    ],
    note: 'عملکرد بسیار تحسین‌برانگیز در نیمه اول ۱۴۰۵ با تحقق راندمان ۱۰۲٪ و کاهش توقفات خط',
    aiFeedback: {
      strengths: [
        'تحقق عالی راندمان کاری بالا (۱۰۲٪)',
        'تعهد بی‌نظیر به ضوابط ایمنی و بهداشت کار (HSE)',
        'انضباط آراستگی و آراستگی محیط کار (کسب رتبه اول ۵اس)'
      ],
      developmentAreas: [
        'کنترل کیفیت قطعات خروجی برای کاهش هر چه بیشتر دوباره‌کاری‌ها',
        'مستندسازی و اشتراک‌گذاری تجارب فنی تعویض قالب با همکاران تازه‌کار'
      ],
      actionItems: [
        'عضویت فعال در کارگروه بهبود کیفیت ایستگاه شماره ۱',
        'منتورینگ ۲ نفر از اپراتورهای تازه‌وارد به مدت ۴۰ ساعت در نیم‌سال دوم',
        'ثبت ایده بهبود بهره‌وری در سامانه نظام پیشنهادات'
      ],
      summary: 'مهندس علی رضایی یکی از ارزنده‌ترین ارزیابان و نیروهای کارگاهی است که با روحیه پیشرو و انضباط سازمانی بالا، عملکردی سرآمد به نمایش گذاشته است.'
    },
    created: 1718000000000
  },

  // --- ۲. سرکار خانم مریم احمدی (بهبود مستمر در کنترل کیفیت) ---
  {
    id: 'eval-maryam-p1',
    empId: 'emp-2',
    profileId: 'prof-2',
    period: 'نیمه اول ۱۴۰۴',
    status: 'locked',
    scores: [
      { cid: 'crit-k5', weight: 25, value: 2, self: 3, doc: 'نیاز به افزایش نمونه‌برداری‌های خط به علت تاخیر قطعات' },
      { cid: 'crit-k6', weight: 15, value: 3, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 3, self: 3 },
      { cid: 'crit-q2', weight: 15, value: 2, self: 3, doc: 'نیاز به دقت بیشتر در ورود اطلاعات به سامانه آزمایشگاه' },
      { cid: 'crit-s1', weight: 15, value: 3, self: 4 },
      { cid: 'crit-b2', weight: 15, value: 3, self: 3 }
    ],
    note: 'نیاز به تمرکز بیشتر بر پوشش کامل چک‌لیست‌های QC و تسریع در صدور تاییدیه‌ها',
    created: 1708100000000
  },
  {
    id: 'eval-maryam-p2',
    empId: 'emp-2',
    profileId: 'prof-2',
    period: 'نیمه دوم ۱۴۰۴',
    status: 'locked',
    scores: [
      { cid: 'crit-k5', weight: 25, value: 3, self: 3 },
      { cid: 'crit-k6', weight: 15, value: 3, self: 4 },
      { cid: 'crit-q1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q2', weight: 15, value: 3, self: 3 },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b2', weight: 15, value: 3, self: 4 }
    ],
    note: 'ارتقای دقت در ثبت گزارشات و افزایش پوشش بازرسی طبق چک‌لیست مدون',
    created: 1713100000000
  },
  {
    id: 'eval-2',
    empId: 'emp-2',
    profileId: 'prof-2',
    period: 'نیمه اول ۱۴۰۵',
    status: 'calibrated',
    scores: [
      { cid: 'crit-k5', weight: 25, value: 4, self: 4 },
      { cid: 'crit-k6', weight: 15, value: 4, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q2', weight: 15, value: 4, self: 4 },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b2', weight: 15, value: 4, self: 4 }
    ],
    note: 'عملکرد باکیفیت و دقت بالا در آزمایشگاه و تعامل سازنده با خط تولید',
    aiFeedback: {
      strengths: [
        'پوشش بسیار خوب بازرسی‌های کیفی طبق برنامه',
        'صحت و انضباط کامل در ثبت سوابق کیفی محموله‌ها',
        'رعایت کامل موازین ایمنی آزمایشگاه مواد'
      ],
      developmentAreas: [
        'تسریع در زمان تعیین تکلیف نهایی محموله‌های دارای انحراف جزئی',
        'مشارکت در جلسات تحلیل عیوب ریشه‌ای (RCA)'
      ],
      actionItems: [
        'گذراندن دوره تخصصی ابزارهای هفتگانه کنترل کیفیت (7QC Tools)',
        'تدوین چک‌لیست هوشمند تست‌های سریع ابعادی'
      ],
      summary: 'سرکار خانم احمدی با ارتقای محسوس شاخص‌های کیفی، به عنوان یکی از کارشناسان کلیدی آزمایشگاه نقش مهمی در کنترل عدم انطباق‌ها ایفا نموده‌اند.'
    },
    created: 1718100000000
  },

  // --- ۳. مهندس حسن کریمی (توسعه مهارت‌های فنی در راه‌اندازی و SMED) ---
  {
    id: 'eval-hassan-p1',
    empId: 'emp-3',
    profileId: 'prof-3',
    period: 'نیمه اول ۱۴۰۴',
    status: 'locked',
    scores: [
      { cid: 'crit-k7', weight: 25, value: 2, self: 2, doc: 'زمان تعویض قالب بالاتر از استاندارد ۳۵ دقیقه بود' },
      { cid: 'crit-k4', weight: 15, value: 2, self: 3, doc: 'توقف ناشی از عدم تنظیم به موقع فیکسچر' },
      { cid: 'crit-k2', weight: 10, value: 3, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 3, self: 3 },
      { cid: 'crit-q3', weight: 10, value: 2, self: 3, doc: 'نیاز به کالیبراسیون مجدد خط‌کش دیجیتال' },
      { cid: 'crit-s1', weight: 15, value: 3, self: 3 },
      { cid: 'crit-b2', weight: 10, value: 3, self: 3 }
    ],
    note: 'نیازمند گذراندن دوره‌های راه‌اندازی سریع قالب (SMED) و ارتقای ایمنی تنظیمات',
    created: 1708200000000
  },
  {
    id: 'eval-hassan-p2',
    empId: 'emp-3',
    profileId: 'prof-3',
    period: 'نیمه دوم ۱۴۰۴',
    status: 'locked',
    scores: [
      { cid: 'crit-k7', weight: 25, value: 3, self: 3 },
      { cid: 'crit-k4', weight: 15, value: 3, self: 3 },
      { cid: 'crit-k2', weight: 10, value: 3, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 3, self: 3 },
      { cid: 'crit-q3', weight: 10, value: 3, self: 4 },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b2', weight: 10, value: 4, self: 4 }
    ],
    note: 'پیشرفت محسوس در تنظیمات اولیه و کاهش زمان خاموشی دستگاه‌ها',
    created: 1713200000000
  },
  {
    id: 'emp-3-eval',
    empId: 'emp-3',
    profileId: 'prof-3',
    period: 'نیمه اول ۱۴۰۵',
    status: 'calibrated',
    scores: [
      { cid: 'crit-k7', weight: 25, value: 4, self: 4 },
      { cid: 'crit-k4', weight: 15, value: 4, self: 4 },
      { cid: 'crit-k2', weight: 10, value: 4, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q3', weight: 10, value: 4, self: 4 },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b2', weight: 10, value: 4, self: 4 }
    ],
    note: 'حسن در حوزه زمان تعویض قالب و همکاری با اپراتورها عملکردی شایسته تقدیر داشته است.',
    aiFeedback: {
      strengths: [
        'کاهش زمان تعویض قالب به زیر ۱۵ دقیقه (تحقق شاخص SMED)',
        'پایبندی عالی به استانداردهای ایمنی تعویض قالب',
        'روحیه همکاری تیمی بالا با سرپرستان تولید'
      ],
      developmentAreas: [
        'مستندسازی استانداردهای تنظیم اولیه برای دستگاه‌های CNC جدید'
      ],
      actionItems: [
        'تدوین راهنمای تصویری تنظیمات سریع برای اپراتورهای شیفت شب',
        'گذراندن کارگاه آموزشی پیشرفته هیدرولیک و پنوماتیک'
      ],
      summary: 'مهندس حسن کریمی با رشد چشمگیر در مهارت‌های فنی راه‌اندازی، راندمان کلی خط را بهبود بخشیده است.'
    },
    created: 1718200000000
  },

  // --- ۴. سرکار خانم فاطمه سعیدی (تضمین کیفیت و تعالی سازمانی) ---
  {
    id: 'eval-fatemeh-1',
    empId: 'emp-4',
    profileId: 'prof-2',
    period: 'نیمه اول ۱۴۰۵',
    status: 'locked',
    scores: [
      { cid: 'crit-k5', weight: 25, value: 5, self: 5, doc: 'پوشش ۱۰۰ درصدی ممیزی‌های کالیبراسیون و انطباق استاندارد ایزو ۹۰۰۱' },
      { cid: 'crit-k6', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q1', weight: 15, value: 5, self: 5, doc: 'بازنگری و تدوین ۱۵ دستورالعمل کاری جدید در کمیته تعالی' },
      { cid: 'crit-q2', weight: 15, value: 5, self: 5, doc: 'ساماندهی کامل داشبوردهای کیفی دیجیتال بدون مغایرت' },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b2', weight: 15, value: 5, self: 5, doc: 'پیگیری دلسوزانه و مستمر عدم انطباق‌ها تا رفع کامل عیوب' }
    ],
    note: 'عملکرد ممتاز در ممیزی فرآیندها، هدایت جلسات کالیبراسیون و انطباق کیفی خطوط',
    created: 1718300000000
  },

  // --- ۵. مهندس رضا ابراهیمی (اپراتور مونتاژ نهایی) ---
  {
    id: 'eval-reza-1',
    empId: 'emp-5',
    profileId: 'prof-1',
    period: 'نیمه اول ۱۴۰۵',
    status: 'draft',
    scores: [
      { cid: 'crit-k3', weight: 20, value: 3, self: 3 },
      { cid: 'crit-k4', weight: 15, value: 3, self: 4 },
      { cid: 'crit-k2', weight: 15, value: 3, self: 3 },
      { cid: 'crit-q1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-q4', weight: 10, value: 3, self: 3 },
      { cid: 'crit-s1', weight: 15, value: 4, self: 4 },
      { cid: 'crit-b1', weight: 10, value: 3, self: 4 }
    ],
    note: 'در حال تطبیق با ایستگاه مونتاژ، حضور منظم و انضباط کاری مناسب',
    created: 1718400000000
  }
];
