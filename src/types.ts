/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryKey = 'K' | 'Q' | 'B' | 'S' | 'L';

export interface Criterion {
  id: string;
  code: string;
  cat: CategoryKey;
  name: string;
  def: string;
  source?: string;
  method?: string;
  dir?: 'more' | 'less'; // 'more' = higher is better, 'less' = lower is better (only for K category)
}

export interface ProfileItem {
  cid: string; // Criterion ID
  weight: number; // 5 to 25
}

export interface JobProfile {
  id: string;
  title: string;
  code: string; // e.g., B1, B3
  family: string; // e.g., B (Blue-collar), W (White-collar)
  locked: boolean;
  items: ProfileItem[];
}

export type UserRole = 'admin' | 'supervisor' | 'employee';

export interface Employee {
  id: string;
  name: string;
  code: string; // Staff ID, e.g. EMP-1001
  profileId: string;
  unit: string; // Department / Unit
  role: UserRole;
  username: string;
}

export interface ScoreItem {
  cid: string;
  weight: number;
  value: number; // 1 to 5, or 0 if unrated
  self: number;  // 1 to 5, or 0 if unrated
  doc?: string;  // Supporting document / justification
}

export interface UserCustomPermission {
  userId: string;
  canEditCriteria: boolean;
  canEditProfiles: boolean;
  canEditEmployees: boolean;
  canStartEvaluations: boolean;
  canLockScores: boolean;
  canDefineTargets: boolean;
  canViewReports: boolean;
  canRestoreBackup: boolean;
}

export interface Evaluation {
  id: string;
  empId: string;
  profileId: string;
  period: string; // e.g., "نیمه اول ۱۴۰۵"
  status: 'draft' | 'calibrated' | 'locked';
  scores: ScoreItem[];
  note?: string; // Performance conversation summary
  aiFeedback?: {
    strengths: string[];
    developmentAreas: string[];
    actionItems: string[];
    summary: string;
  };
  aiLoading?: boolean;
  created: number;
}

export const CATEGORIES: Record<CategoryKey, string> = {
  K: 'نتایج کمی (KPI)',
  Q: 'کیفیت و انطباق',
  B: 'رفتارهای شایستگی',
  S: 'ایمنی (HSE)',
  L: 'رهبری و مدیریت',
};

export const PERFORMANCE_SCALE: Record<number, string> = {
  5: 'فراتر از انتظار',
  4: 'بالاتر از انتظار',
  3: 'مطابق انتظار',
  2: 'نیازمند بهبود',
  1: 'غیرقابل قبول',
};

export const NEED_DOCUMENT_SCORES = [1, 2, 5];
export const MIN_WEIGHT = 5;
export const MAX_WEIGHT = 25;
export const MAX_CRITERIA_COUNT = 12;
export const MANDATORY_SAFETY_CODE = 'S-01';
export const SCALE_FACTOR = 20; // 1-5 scale to 100 scale

export const CYCLE_STEPS = [
  { step: 1, title: 'هدف‌گذاری و تفاهم‌نامه', desc: 'تعیین معیارها و اوزان در ابتدای دوره' },
  { step: 2, title: 'بازخورد مستمر و میان‌دوره', desc: 'گفت‌وگوهای هدایت‌گر و پایش مسیر کار' },
  { step: 3, title: 'خودارزیابی کارمند', desc: 'ثبت خودارزیابی توسط کارمند برای توسعه سلف-آگاهی' },
  { step: 4, title: 'ارزیابی نهایی سرپرست', desc: 'ثبت نمرات و مستندات پشتیبان برای رتبه‌های خاص' },
  { step: 5, title: 'کالیبراسیون سازمانی', desc: 'هم‌ترازسازی نمرات جهت رفع تورم نمره و سوگیری' },
  { step: 6, title: 'ابلاغ، بازخورد و توسعه', desc: 'جلسه گفت‌وگوی توسعه‌ای و بازخورد رشددهنده' },
];

export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'E';
}

export const GRADE_DETAILS = {
  A: { label: 'برجسته و ستودنی', color: 'emerald', description: 'به‌طور مستمر فراتر از سطح انتظارات عمل کرده است.' },
  B: { label: 'خوب و فراتر از انتظار', color: 'blue', description: 'بسیاری از اهداف را بالاتر از سطح انتظار محقق کرده است.' },
  C: { label: 'کامل و مطابق انتظار', color: 'amber', description: 'اهداف تعریف‌شده را به‌طور کامل و با کیفیت پذیرفتنی انجام داده است.' },
  D: { label: 'نیازمند بهبود', color: 'orange', description: 'برخی از اهداف کلیدی محقق نشده و نیاز به مربیگری مستقیم دارد.' },
  E: { label: 'غیرقابل قبول', color: 'red', description: 'عملکرد بسیار پایین‌تر از استانداردهای پذیرفتنی است.' },
};
