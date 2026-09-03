/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Comprehensive Seed Data for Lattice & Kickidler Modules
 * Tailored for Isfahan Chalak Enterprise Environment
 */

import { 
  OKRGoal, 
  OneOnOneMeeting, 
  PraiseKudos, 
  PulseSurveyMetric, 
  WorkdayActivityRecord, 
  LiveEmployeeActivity, 
  KickidlerViolation 
} from '../types';

export const INITIAL_OKRS: OKRGoal[] = [
  {
    id: 'okr-comp-1',
    title: 'جهش ۳۰ درصدی راندمان OEE و حذف گلوگاه‌های توقف خط تولید',
    description: 'تحقق اهداف استراتژیک سالانه شرکت اصفهان چالاک در راستای جهش تولید، کاهش اتلاف منابع و بهبود ایمنی فرایندی.',
    level: 'company',
    department: 'کل سازمان',
    ownerId: 'emp-admin',
    ownerName: 'مدیریت ارشد',
    period: '۱۴۰۵ - سه‌ماهه اول',
    category: 'strategic',
    progress: 78,
    confidence: 'on_track',
    createdDate: '۱۴۰۵/۰۱/۱۵',
    dueDate: '۱۴۰۵/۰۳/۳۱',
    keyResults: [
      {
        id: 'kr-1-1',
        title: 'ارتقای شاخص اثربخشی کلی تجهیزات (OEE) از ۷۲٪ به ۸۵٪ در سالن‌های ماشین‌کاری',
        metricType: 'percentage',
        startValue: 72,
        currentValue: 82.5,
        targetValue: 85,
        unit: 'درصد',
        confidence: 'on_track',
        ownerName: 'مهندس علی رضایی',
        lastUpdated: '۱۴۰۵/۰۶/۱۱'
      },
      {
        id: 'kr-1-2',
        title: 'کاهش نرخ قطعات ضایعاتی به کمتر از ۱.۲ درصد در خطوط حساس',
        metricType: 'percentage',
        startValue: 3.4,
        currentValue: 1.6,
        targetValue: 1.2,
        unit: 'درصد',
        confidence: 'on_track',
        ownerName: 'سرکار خانم فاطمه سعیدی',
        lastUpdated: '۱۴۰۵/۰۶/۱۲'
      },
      {
        id: 'kr-1-3',
        title: 'ثبت و پیگیری صفر حوادث ناتوان‌کننده انسانی (Zero LTI) در شیفت‌های فشرده',
        metricType: 'number',
        startValue: 2,
        currentValue: 0,
        targetValue: 0,
        unit: 'مورد حادثه',
        confidence: 'completed',
        ownerName: 'واحد HSE و ارزیابی',
        lastUpdated: '۱۴۰۵/۰۶/۱۰'
      }
    ]
  },
  {
    id: 'okr-dept-1',
    title: 'بهینه‌سازی زمان آماده‌سازی و ستاپ ماشین‌آلات CNC',
    description: 'کاهش زمان تعویض قالب و فیکسچر در سالن ماشین‌کاری ۱ از طریق اجرای متدولوژی SMED.',
    level: 'department',
    department: 'سالن ماشین‌کاری ۱',
    ownerId: 'emp-1',
    ownerName: 'مهندس علی رضایی',
    period: '۱۴۰۵ - سه‌ماهه اول',
    category: 'productivity',
    progress: 64,
    confidence: 'at_risk',
    alignmentParentId: 'okr-comp-1',
    createdDate: '۱۴۰۵/۰۱/۲۰',
    dueDate: '۱۴۰۵/۰۳/۳۱',
    keyResults: [
      {
        id: 'kr-2-1',
        title: 'کاهش میانگین زمان تعویض قالب از ۵۵ دقیقه به کمتر از ۳۰ دقیقه',
        metricType: 'number',
        startValue: 55,
        currentValue: 38,
        targetValue: 30,
        unit: 'دقیقه',
        confidence: 'at_risk',
        ownerName: 'مهندس حسن کریمی',
        lastUpdated: '۱۴۰۵/۰۶/۱۱'
      },
      {
        id: 'kr-2-2',
        title: 'تدوین و اجرای دستورالعمل استاندارد تعویض ابزار برای ۱۰۰٪ اپراتورها',
        metricType: 'percentage',
        startValue: 0,
        currentValue: 85,
        targetValue: 100,
        unit: 'درصد',
        confidence: 'on_track',
        ownerName: 'مهندس رضا ابراهیمی',
        lastUpdated: '۱۴۰۵/۰۶/۰۹'
      }
    ]
  },
  {
    id: 'okr-ind-1',
    title: 'ارتقای دقت تست‌های آزمایشگاهی و پیاده‌سازی کنترل کیفیت آماری (SPC)',
    description: 'توسعه صلاحیت‌های آزمایشگاهی در راستای پایش لحظه‌ای انحرافات قطعات خروجی خط.',
    level: 'individual',
    department: 'آزمایشگاه کنترل کیفیت',
    ownerId: 'emp-2',
    ownerName: 'سرکار خانم مریم احمدی',
    period: '۱۴۰۵ - سه‌ماهه اول',
    category: 'quality',
    progress: 91,
    confidence: 'on_track',
    alignmentParentId: 'okr-comp-1',
    createdDate: '۱۴۰۵/۰۱/۲۵',
    dueDate: '۱۴۰۵/۰۳/۳۱',
    keyResults: [
      {
        id: 'kr-3-1',
        title: 'کالیبراسیون و انطباق دوره‌ای ۱۰۰٪ ابزارهای اندازه‌گیری حساس CMM و کولیس‌ها',
        metricType: 'percentage',
        startValue: 60,
        currentValue: 95,
        targetValue: 100,
        unit: 'درصد',
        confidence: 'completed',
        ownerName: 'سرکار خانم مریم احمدی',
        lastUpdated: '۱۴۰۵/۰۶/۱۲'
      },
      {
        id: 'kr-3-2',
        title: 'ثبت الکترونیکی گزارش عدم‌انطباق‌ها (NCR) در کمتر از ۲ ساعت از کشف عیب',
        metricType: 'percentage',
        startValue: 40,
        currentValue: 88,
        targetValue: 95,
        unit: 'درصد',
        confidence: 'on_track',
        ownerName: 'سرکار خانم مریم احمدی',
        lastUpdated: '۱۴۰۵/۰۶/۱۰'
      }
    ]
  }
];

export const INITIAL_ONE_ON_ONES: OneOnOneMeeting[] = [
  {
    id: '1on1-1',
    empId: 'emp-3',
    empName: 'مهندس حسن کریمی',
    supervisorId: 'emp-1',
    supervisorName: 'مهندس علی رضایی',
    scheduledDate: '۱۴۰۵/۰۶/۲۰ - ساعت ۰۹:۳۰',
    period: 'شهریور ۱۴۰۵',
    status: 'scheduled',
    moodRating: 4,
    talkingPoints: [
      { id: 'tp-1', text: 'بررسی چالش‌های ستاپ قطعات تیپ C در شیفت عصر', isCompleted: true, addedBy: 'employee' },
      { id: 'tp-2', text: 'بازخورد پیرامون دقت ابزاربندی و کاهش توقفات خط', isCompleted: true, addedBy: 'supervisor' },
      { id: 'tp-3', text: 'برنامه‌ریزی برای شرکت در دوره پیشرفته فرزکاری CNC', isCompleted: false, addedBy: 'supervisor' },
      { id: 'tp-4', text: 'درخواست فیکسچر کمکی جدید جهت ارتقای ارگونومی کار', isCompleted: false, addedBy: 'employee' }
    ],
    actionItems: [
      { id: 'ai-1', title: 'ارائه لیست قطعات یدکی ضروری ابزار به انبار', assigneeName: 'مهندس حسن کریمی', dueDate: '۱۴۰۵/۰۶/۲۲', isDone: false },
      { id: 'ai-2', title: 'هماهنگی با واحد آموزش جهت کارگاه CNC', assigneeName: 'مهندس علی رضایی', dueDate: '۱۴۰۵/۰۶/۲۵', isDone: true }
    ],
    sharedNotes: 'گفت‌وگو پیرامون فرآیند بهبود سرعت ستاپ بسیار سازنده بود. حسن پیشنهادهای بسیار ارزشمندی برای طراحی فیکسچر ارگونومیک مطرح کرد.',
    privateSupervisorNotes: 'پتانسیل بالایی در حل مسئله دارد. نیازمند تفویض اختیارات فنی بیشتر در شیفت‌های حساس است.'
  },
  {
    id: '1on1-2',
    empId: 'emp-2',
    empName: 'سرکار خانم مریم احمدی',
    supervisorId: 'emp-4',
    supervisorName: 'سرکار خانم فاطمه سعیدی',
    scheduledDate: '۱۴۰۵/۰۶/۱۸ - ساعت ۱۱:۰۰',
    period: 'شهریور ۱۴۰۵',
    status: 'completed',
    moodRating: 5,
    talkingPoints: [
      { id: 'tp-21', text: 'ارزیابی اثربخشی سیستم جدید ثبت نمونه‌های QC', isCompleted: true, addedBy: 'supervisor' },
      { id: 'tp-22', text: 'بررسی همکاری متقابل با اپراتورهای خط تولید', isCompleted: true, addedBy: 'employee' }
    ],
    actionItems: [
      { id: 'ai-21', title: 'نهایی‌سازی چک‌لیست بازرسی درگاه ورودی مواد', assigneeName: 'سرکار خانم مریم احمدی', dueDate: '۱۴۰۵/۰۶/۱۹', isDone: true }
    ],
    sharedNotes: 'تعهد کاری و دقت خانم احمدی در رد قطعات معیوب خارج از تلرانس ستودنی است.',
    privateSupervisorNotes: 'گزینه عالی برای سرپرستی تضمین کیفیت در پروژه توسعه خط جدید.'
  }
];

export const INITIAL_KUDOS: PraiseKudos[] = [
  {
    id: 'kudos-1',
    senderId: 'emp-1',
    senderName: 'مهندس علی رضایی',
    senderRole: 'سرپرست سالن ماشین‌کاری',
    receiverId: 'emp-3',
    receiverName: 'مهندس حسن کریمی',
    companyValue: 'نوآوری و خلاقیت فنی',
    badgeIcon: '🚀',
    message: 'بابت نبوغ و خلاقیت در بازطراحی فیکسچر دستگاه شماره ۴ که باعث صرفه‌جویی ۲۰ دقیقه‌ای در زمان هر ستاپ شد، صمیمانه ازت سپاسگزارم!',
    reactions: { claps: 12, hearts: 8, rockets: 15, stars: 9 },
    userReactions: ['rockets', 'claps'],
    createdAt: '۱۴۰۵/۰۶/۱۱'
  },
  {
    id: 'kudos-2',
    senderId: 'emp-4',
    senderName: 'سرکار خانم فاطمه سعیدی',
    senderRole: 'سرپرست تضمین کیفیت',
    receiverId: 'emp-2',
    receiverName: 'سرکار خانم مریم احمدی',
    companyValue: 'کیفیت برتر',
    badgeIcon: '🏆',
    message: 'دقت تحسین‌برانگیز در کشف عدم‌انطباق ابعادی محموله قطعات ورودی که مانع از خطای بزرگ در خط مونتاژ شد. کارت نمونه بود مریم جان!',
    reactions: { claps: 18, hearts: 14, rockets: 6, stars: 11 },
    userReactions: ['hearts'],
    createdAt: '۱۴۰۵/۰۶/۱۰'
  },
  {
    id: 'kudos-3',
    senderId: 'emp-3',
    senderName: 'مهندس حسن کریمی',
    senderRole: 'اپراتور ارشد',
    receiverId: 'emp-5',
    receiverName: 'مهندس رضا ابراهیمی',
    companyValue: 'کار تیمی و همدلی',
    badgeIcon: '🤝',
    message: 'کمک شایان و فداکارانه در شیفت اضافه برای رساندن سفارش فوری مشتری تهران. کار تیمی در کنار تو لذت‌بخش است.',
    reactions: { claps: 9, hearts: 6, rockets: 4, stars: 7 },
    createdAt: '۱۴۰۵/۰۶/۰۸'
  },
  {
    id: 'kudos-4',
    senderId: 'emp-admin',
    senderName: 'مدیریت ارشد',
    senderRole: 'مدیر منابع انسانی',
    receiverId: 'emp-1',
    receiverName: 'مهندس علی رضایی',
    companyValue: 'تعهد به ایمنی و HSE',
    badgeIcon: '🛡️',
    message: 'سپاس ویژه از رهبری عالی و کسب رتبه اول سالن ماشین‌کاری در رعایت الزامات ممیزی ۵S و صفر حادثه در ۶ ماهه گذشته.',
    reactions: { claps: 24, hearts: 19, rockets: 11, stars: 16 },
    userReactions: ['stars', 'claps'],
    createdAt: '۱۴۰۵/۰۶/۰۵'
  }
];

export const INITIAL_PULSE_METRICS: PulseSurveyMetric[] = [
  {
    id: 'pm-1',
    title: 'شاخص تعلق و انگیزش سازمانی (eSat)',
    category: 'engagement',
    score: 86.4,
    trend: 'up',
    changeValue: '+4.2%',
    responseRate: 94
  },
  {
    id: 'pm-2',
    title: 'اثربخشی بازخورد و مربیگری سرپرستان مستقیم',
    category: 'manager_support',
    score: 89.1,
    trend: 'up',
    changeValue: '+6.5%',
    responseRate: 91
  },
  {
    id: 'pm-3',
    title: 'تعادل بار کاری و سلامت روانی (Work-Life Balance)',
    category: 'workload',
    score: 75.8,
    trend: 'stable',
    changeValue: '+0.8%',
    responseRate: 88
  },
  {
    id: 'pm-4',
    title: 'شاخص امنیت روانی و جرات‌ورزی در ارائه ایده‌ها',
    category: 'psychological_safety',
    score: 82.0,
    trend: 'up',
    changeValue: '+3.1%',
    responseRate: 89
  }
];

// ==========================================
// KICKIDLER REAL-TIME MONITORING SEED DATA
// ==========================================

export const INITIAL_KICKIDLER_RECORDS: WorkdayActivityRecord[] = [
  {
    id: 'kd-rec-1',
    empId: 'emp-1',
    empName: 'مهندس علی رضایی',
    empCode: 'EMP-1001',
    unit: 'سالن ماشین‌کاری ۱',
    date: '۱۴۰۵/۰۶/۱۴',
    timeBreakdown: {
      productiveMinutes: 405, // 6h 45m
      neutralMinutes: 42,     // 42m
      unproductiveMinutes: 13,// 13m
      idleMinutes: 20,        // 20m
      totalWorkMinutes: 480   // 8h
    },
    productivityIndex: 88.5,
    keystrokesCount: 14280,
    mouseClicksCount: 3840,
    activeAppTitle: 'سیستم برنامه‌ریزی تولید اصفهان چالاک (MES)',
    activeAppCategory: 'mes_erp',
    burnoutRiskScore: 32,
    burnoutCategory: 'optimal',
    violationsCount: 0
  },
  {
    id: 'kd-rec-2',
    empId: 'emp-2',
    empName: 'سرکار خانم مریم احمدی',
    empCode: 'EMP-1002',
    unit: 'آزمایشگاه کنترل کیفیت',
    date: '۱۴۰۵/۰۶/۱۴',
    timeBreakdown: {
      productiveMinutes: 420, // 7h 00m
      neutralMinutes: 35,
      unproductiveMinutes: 10,
      idleMinutes: 15,
      totalWorkMinutes: 480
    },
    productivityIndex: 91.2,
    keystrokesCount: 16900,
    mouseClicksCount: 4200,
    activeAppTitle: 'نرم‌افزار CMM و آنالیز اندازه‌برداری Mitutoyo',
    activeAppCategory: 'cad_cam',
    burnoutRiskScore: 28,
    burnoutCategory: 'optimal',
    violationsCount: 0
  },
  {
    id: 'kd-rec-3',
    empId: 'emp-3',
    empName: 'مهندس حسن کریمی',
    empCode: 'EMP-1003',
    unit: 'سالن ماشین‌کاری ۱',
    date: '۱۴۰۵/۰۶/۱۴',
    timeBreakdown: {
      productiveMinutes: 370, // 6h 10m
      neutralMinutes: 50,
      unproductiveMinutes: 28,
      idleMinutes: 32,
      totalWorkMinutes: 480
    },
    productivityIndex: 82.0,
    keystrokesCount: 11400,
    mouseClicksCount: 2950,
    activeAppTitle: 'کنترلر CNC زیمنس Sinumerik 840D',
    activeAppCategory: 'cad_cam',
    burnoutRiskScore: 68,
    burnoutCategory: 'high_workload',
    violationsCount: 1
  },
  {
    id: 'kd-rec-4',
    empId: 'emp-4',
    empName: 'سرکار خانم فاطمه سعیدی',
    empCode: 'EMP-1004',
    unit: 'واحد تعالی سازمانی و کالیبراسیون',
    date: '۱۴۰۵/۰۶/۱۴',
    timeBreakdown: {
      productiveMinutes: 395,
      neutralMinutes: 55,
      unproductiveMinutes: 12,
      idleMinutes: 18,
      totalWorkMinutes: 480
    },
    productivityIndex: 86.8,
    keystrokesCount: 18450,
    mouseClicksCount: 5120,
    activeAppTitle: 'سامانه تحلیل کالیبراسیون و انطباق استاندارد ISO',
    activeAppCategory: 'mes_erp',
    burnoutRiskScore: 35,
    burnoutCategory: 'optimal',
    violationsCount: 0
  },
  {
    id: 'kd-rec-5',
    empId: 'emp-5',
    empName: 'مهندس رضا ابراهیمی',
    empCode: 'EMP-1005',
    unit: 'سالن ماشین‌کاری ۱',
    date: '۱۴۰۵/۰۶/۱۴',
    timeBreakdown: {
      productiveMinutes: 325, // 5h 25m
      neutralMinutes: 60,
      unproductiveMinutes: 45,
      idleMinutes: 50,
      totalWorkMinutes: 480
    },
    productivityIndex: 72.4,
    keystrokesCount: 8900,
    mouseClicksCount: 2100,
    activeAppTitle: 'مرورگر کروم - وب‌گردی و پورتال اخبار',
    activeAppCategory: 'browsing',
    burnoutRiskScore: 45,
    burnoutCategory: 'underloaded',
    violationsCount: 2
  }
];

export const INITIAL_LIVE_ACTIVITIES: LiveEmployeeActivity[] = [
  {
    empId: 'emp-1',
    empName: 'مهندس علی رضایی',
    empCode: 'EMP-1001',
    unit: 'سالن ماشین‌کاری ۱',
    status: 'productive',
    currentApp: 'سامانه داشبورد تولید MES (میز کار فعال)',
    currentAppCategory: 'نرم‌افزار مجاز صنعتی (ERP/MES)',
    shiftStartTime: '۰۷:۳۰',
    activeDurationMinutes: 145,
    todayProductivityRate: 88.5,
    todayIdleMinutes: 20,
    intensityRate: 'high',
    lastActiveTimestamp: 'همین الان (پالس فعال)',
    avatarColor: 'bg-emerald-600'
  },
  {
    empId: 'emp-2',
    empName: 'سرکار خانم مریم احمدی',
    empCode: 'EMP-1002',
    unit: 'آزمایشگاه کنترل کیفیت',
    status: 'productive',
    currentApp: 'نرم‌افزار CMM Mitutoyo - گزارش تلرانس‌های بسته ۵',
    currentAppCategory: 'مهندسی و آزمایشگاه دقیق',
    shiftStartTime: '۰۷:۴۵',
    activeDurationMinutes: 110,
    todayProductivityRate: 91.2,
    todayIdleMinutes: 15,
    intensityRate: 'high',
    lastActiveTimestamp: 'همین الان (پالس فعال)',
    avatarColor: 'bg-blue-600'
  },
  {
    empId: 'emp-3',
    empName: 'مهندس حسن کریمی',
    empCode: 'EMP-1003',
    unit: 'سالن ماشین‌کاری ۱',
    status: 'neutral',
    currentApp: 'فایل اکسل گزارش شیفت و متریال ایستگاه فرز ۳',
    currentAppCategory: 'اسناد اداری و گزارش‌های شیفت',
    shiftStartTime: '۰۷:۵۰',
    activeDurationMinutes: 40,
    todayProductivityRate: 82.0,
    todayIdleMinutes: 32,
    intensityRate: 'medium',
    lastActiveTimestamp: '۳ دقیقه قبل',
    avatarColor: 'bg-indigo-600'
  },
  {
    empId: 'emp-4',
    empName: 'سرکار خانم فاطمه سعیدی',
    empCode: 'EMP-1004',
    unit: 'واحد تعالی سازمانی و کالیبراسیون',
    status: 'productive',
    currentApp: 'ماژول کالیبراسیون عملکرد و شایستگی اصفهان چالاک',
    currentAppCategory: 'پرتال منابع انسانی و کالیبراسیون',
    shiftStartTime: '۰۷:۳۰',
    activeDurationMinutes: 180,
    todayProductivityRate: 86.8,
    todayIdleMinutes: 18,
    intensityRate: 'high',
    lastActiveTimestamp: 'همین الان (پالس فعال)',
    avatarColor: 'bg-purple-600'
  },
  {
    empId: 'emp-5',
    empName: 'مهندس رضا ابراهیمی',
    empCode: 'EMP-1005',
    unit: 'سالن ماشین‌کاری ۱',
    status: 'idle',
    currentApp: 'عدم تعامل کاربر با ایستگاه کاری (قفل موقت)',
    currentAppCategory: 'زمان عدم فعالیت (Idle Time)',
    shiftStartTime: '۰۸:۰۵',
    activeDurationMinutes: 0,
    todayProductivityRate: 72.4,
    todayIdleMinutes: 50,
    intensityRate: 'low',
    lastActiveTimestamp: '۱۸ دقیقه قبل',
    avatarColor: 'bg-amber-600'
  }
];

export const INITIAL_VIOLATIONS: KickidlerViolation[] = [
  {
    id: 'viol-1',
    empId: 'emp-5',
    empName: 'مهندس رضا ابراهیمی',
    empCode: 'EMP-1005',
    unit: 'سالن ماشین‌کاری ۱',
    timestamp: '۱۴۰۵/۰۶/۱۴ - ۰۸:۰۵',
    type: 'late_arrival',
    title: 'تاخیر ۳۵ دقیقه‌ای در شروع شیفت کاری',
    description: 'شروع کارت‌زنی در ساعت ۰۸:۰۵ انجام شد در حالی که شیفت موظف از ساعت ۰۷:۳۰ بوده است.',
    durationMinutes: 35,
    severity: 'medium',
    status: 'acknowledged'
  },
  {
    id: 'viol-2',
    empId: 'emp-5',
    empName: 'مهندس رضا ابراهیمی',
    empCode: 'EMP-1005',
    unit: 'سالن ماشین‌کاری ۱',
    timestamp: '۱۴۰۵/۰۶/۱۴ - ۱۰:۴۵',
    type: 'prolonged_idle',
    title: 'توقف بدون فعالیت (Idle) بیش از ۳۵ دقیقه',
    description: 'هیچ‌گونه پالس ورودی ماوس، کیبورد یا کنترلر خط در مدت ۳۸ دقیقه ثبت نگردید.',
    durationMinutes: 38,
    severity: 'high',
    status: 'new'
  },
  {
    id: 'viol-3',
    empId: 'emp-3',
    empName: 'مهندس حسن کریمی',
    empCode: 'EMP-1003',
    unit: 'سالن ماشین‌کاری ۱',
    timestamp: '۱۴۰۵/۰۶/۱۳ - ۱۴:۲۰',
    type: 'unproductive_site',
    title: 'استفاده از شبکه اجتماعی و سایت تفریحی در شیفت کاری',
    description: 'بازدید از وب‌سایت‌های سرگرمی به مدت ۲۲ دقیقه متوالی در زمان فعال خط تولید.',
    durationMinutes: 22,
    severity: 'medium',
    status: 'addressed'
  }
];
