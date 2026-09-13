export interface NineBoxConfig {
  id: string;
  title: string;
  subtitle: string;
  perfLabel: string;
  potLabel: string;
  color: string;
  badgeBg: string;
  strategy: string;
}

export const NINE_BOX_CONFIGS: Record<string, NineBoxConfig> = {
  star: {
    id: 'star',
    title: 'ستارگان آینده کارخانه',
    subtitle: 'Super Star',
    perfLabel: 'عملکرد عالی (>= ۸۳)',
    potLabel: 'پتانسیل بالا (>= ۸۲)',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    strategy: 'قرارگیری در برنامه جانشین‌پروری سرپرستی، پاداش‌های ویژه و حضور در پروژه‌های تحول‌گرای کارخانه.'
  },
  high_potential: {
    id: 'high_potential',
    title: 'ستاره در حال رشد',
    subtitle: 'Growth Star',
    perfLabel: 'عملکرد متوسط (۶۵-۸۲)',
    potLabel: 'پتانسیل بالا (>= ۸۲)',
    color: 'teal',
    badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    strategy: 'توسعه مهارت‌های تخصصی، واگذاری مسئولیت‌های حل مسئله و چرخش شغلی هدفمند.'
  },
  enigma: {
    id: 'enigma',
    title: 'پتانسیل بالا اما عملکرد نیازمند ارتقا',
    subtitle: 'Enigma',
    perfLabel: 'عملکرد پایین (< ۶۵)',
    potLabel: 'پتانسیل بالا (>= ۸۲)',
    color: 'amber',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    strategy: 'انتقال به نقش متناسب‌تر با علایق، منتورینگ فشرده و بررسی موانع انگیزش یا تجهیزات.'
  },
  high_performer: {
    id: 'high_performer',
    title: 'عملکرد درخشان و قابل اتکا',
    subtitle: 'High Performer',
    perfLabel: 'عملکرد عالی (>= ۸۳)',
    potLabel: 'پتانسیل متوسط (۶۵-۸۲)',
    color: 'cyan',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    strategy: 'اعطای نقش منتور و راهنمای نیروهای تازه‌وارد، پاداش بهره‌وری و تثبیت در جایگاه کلیدی.'
  },
  core: {
    id: 'core',
    title: 'ستون‌های عملکرد کارگاه',
    subtitle: 'Core Player',
    perfLabel: 'عملکرد متوسط (۶۵-۸۲)',
    potLabel: 'پتانسیل متوسط (۶۵-۸۲)',
    color: 'blue',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    strategy: 'قدردانی مداوم، حفظ ثبات و انگیزش، آموزش‌های مهارتی مستمر جهت افزایش عمق فنی.'
  },
  dilemma: {
    id: 'dilemma',
    title: 'عملکرد نوسانی / نیازمند هدایت',
    subtitle: 'Dilemma',
    perfLabel: 'عملکرد پایین (< ۶۵)',
    potLabel: 'پتانسیل متوسط (۶۵-۸۲)',
    color: 'rose',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    strategy: 'طراحی برنامه مشخص بهبود عملکرد (PIP)، جلسات مربیگری هفتگی و پیگیری دقیق شواهد رفتاری.'
  },
  trusted_expert: {
    id: 'trusted_expert',
    title: 'استادکار و متخصص فنی کارگاه',
    subtitle: 'Trusted Master',
    perfLabel: 'عملکرد عالی (>= ۸۳)',
    potLabel: 'پتانسیل پایین (< ۶۵)',
    color: 'indigo',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    strategy: 'بهره‌گیری در نقش مرجع فنی حل مسئله در خط و مشارکت در آموزش دستورالعمل‌های استاندارد.'
  },
  effective_worker: {
    id: 'effective_worker',
    title: 'همکار موثر و استاندارد',
    subtitle: 'Effective Worker',
    perfLabel: 'عملکرد متوسط (۶۵-۸۲)',
    potLabel: 'پتانسیل پایین (< ۶۵)',
    color: 'slate',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    strategy: 'ایجاد تنوع در وظایف روتین، بهبود شرایط ارگونومی و بررسی عوامل ارتقای انگیزه فردی.'
  },
  underperformer: {
    id: 'underperformer',
    title: 'ریسک عملکردی و نیازمند مداخله',
    subtitle: 'Underperformer',
    perfLabel: 'عملکرد پایین (< ۶۵)',
    potLabel: 'پتانسیل پایین (< ۶۵)',
    color: 'red',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    strategy: 'اجرای فوری برنامه بهبود عملکرد با ضرب‌الاجل ۴۵ روزه یا تعیین تکلیف سازمانی.'
  }
};
