/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CriteriaBank from './components/CriteriaBank';
import JobProfiles from './components/JobProfiles';
import Employees from './components/Employees';
import Evaluations from './components/Evaluations';
import Calibration from './components/Calibration';
import Reports from './components/Reports';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import MyEvaluation from './components/MyEvaluation';
import ManagementCenter from './components/ManagementCenter';
import WorkflowManager from './components/WorkflowManager';
import SupervisorNotificationBell from './components/SupervisorNotificationBell';
import LatticePerformanceHub from './components/LatticePerformanceHub';
import KickidlerProductivityHub from './components/KickidlerProductivityHub';
import ComprehensiveManualModal from './components/ComprehensiveManualModal';
import {
   Home,
   BookOpen,
   Sun,
   Moon,
   ShieldCheck,
   Activity,
   Sparkles,
   Users,
   Monitor,
  Eye,
  LogOut,
  Menu,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  LockKeyhole,
  Scale,
  ClipboardCheck,
  FileSpreadsheet,
  Save,
  HelpCircle,
  Bell,
  BellOff
} from 'lucide-react';
import { Criterion, JobProfile, Employee, Evaluation } from './types';
import { SEED_CRITERIA, SEED_PROFILES, SEED_EMPLOYEES, SEED_EVALUATIONS } from './seedData';
import { browserNotifications } from './utils/browserNotifications';
import { 
  validateEmployeeInput, 
  validateCriterionInput, 
  validateJobProfileInput, 
  clearLegacyAdminSessions 
} from './utils/validation';

// --- CLOUD SYNC WRAPPER WITH ISOLATED SESSIONS ---
let syncTimeout: any = null;

export default function App() {
  const [syncState, setSyncState] = useState<'loading' | 'ready' | 'error'>('loading');

  // Initial cloud state hydration
  useEffect(() => {
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          for (const [key, value] of Object.entries(data)) {
            // NEVER sync user session or individual login tokens into global storage
            if (key === 'pe_current_user' || key === 'pe_session_user') continue;
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        }
        setSyncState('ready');
      })
      .catch(err => {
        console.error("Cloud Sync Error:", err);
        setSyncState('ready');
      });
  }, []);

  // Periodic polling for collaborative multi-user updates (e.g., changes from other devices)
  useEffect(() => {
    if (syncState !== 'ready') return;

    const interval = setInterval(() => {
      fetch('/api/state')
        .then(res => res.json())
        .then(data => {
          if (data && Object.keys(data).length > 0) {
            for (const [key, value] of Object.entries(data)) {
              if (key === 'pe_current_user' || key === 'pe_session_user') continue;
              const valStr = typeof value === 'string' ? value : JSON.stringify(value);
              const currentVal = localStorage.getItem(key);
              if (currentVal !== valStr) {
                localStorage.setItem(key, valStr);
                // Dispatch storage event so active React state hooks can re-render if needed
                window.dispatchEvent(new Event('storage'));
              }
            }
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [syncState]);

  // Sync outbound changes to Cloudflare / server database
  useEffect(() => {
    if (syncState !== 'ready') return;

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      // Only sync global organizational tables, NEVER user sessions
      if (key && key.startsWith('pe_') && key !== 'pe_current_user' && key !== 'pe_session_user') {
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
          const payload: any = {};
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('pe_') && k !== 'pe_current_user' && k !== 'pe_session_user') {
              try {
                payload[k] = JSON.parse(localStorage.getItem(k) || '""');
              } catch {
                payload[k] = localStorage.getItem(k);
              }
            }
          }
          fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(console.error);
        }, 800);
      }
    };

    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, [syncState]);

  if (syncState === 'loading') {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-teal-400 font-sans" dir="rtl">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold animate-pulse">در حال اتصال به سرور ابری کلادفلر و بارگذاری اطلاعات...</p>
      </div>
    );
  }

  return <MainApp />;
}

// --- ORIGINAL APP COMPONENT ---
function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeEvalId, setActiveEvalId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState<number | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  const sanitizeUser = (user: Employee | null): Employee | null => {
    if (!user) return null;
    if (user.role === 'admin' || user.username === 'admin' || user.name.includes('سوپر') || user.name.includes('ادمین')) {
      return {
        ...user,
        name: 'مدیریت ارشد',
        username: 'admin',
        role: 'admin',
        code: 'ADMIN-001',
        unit: 'دفتر مرکزی'
      };
    }
    return user;
  };

  const sanitizeEmployees = (emps: Employee[]): Employee[] => {
    return emps.map(emp => {
      if (emp.role === 'admin' || emp.username === 'admin' || emp.name.includes('سوپر') || emp.name.includes('ادمین')) {
        return {
          ...emp,
          name: 'مدیریت ارشد',
          username: 'admin',
          role: 'admin',
          code: 'ADMIN-001',
          unit: 'دفتر مرکزی'
        };
      }
      return emp;
    });
  };

  // Session-isolated user state (per browser/device)
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const sessionSaved = sessionStorage.getItem('pe_session_user');
    if (sessionSaved) {
      try {
        const parsed = JSON.parse(sessionSaved);
        const user = sanitizeUser(parsed);
        if (user && user.role === 'admin') {
          const sessionLoggedAt = sessionStorage.getItem('pe_admin_session_logged_at');
          const passUpdatedAt = localStorage.getItem('pe_admin_password_updated_at');
          if (sessionLoggedAt && passUpdatedAt) {
            if (new Date(passUpdatedAt).getTime() > new Date(sessionLoggedAt).getTime()) {
              // Admin password changed after session was created -> invalidate session
              clearLegacyAdminSessions();
              return null;
            }
          }
        }
        return user;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return browserNotifications.getPermissionStatus();
  });

  // Re-sync organizational data when cloud background poll updates localStorage
  useEffect(() => {
    const handleStorageUpdate = () => {
      const savedCrit = localStorage.getItem('pe_criteria');
      if (savedCrit) setCriteria(JSON.parse(savedCrit));
      const savedProf = localStorage.getItem('pe_profiles');
      if (savedProf) setProfiles(JSON.parse(savedProf));
      const savedEmp = localStorage.getItem('pe_employees');
      if (savedEmp) setEmployees(sanitizeEmployees(JSON.parse(savedEmp)));
      const savedEval = localStorage.getItem('pe_evaluations');
      if (savedEval) setEvaluations(JSON.parse(savedEval));
      const savedArchived = localStorage.getItem('pe_archived_evaluations');
      if (savedArchived) setArchivedEvaluations(JSON.parse(savedArchived));

      // Invalidate admin session if password updated in another tab
      if (currentUser?.role === 'admin') {
        const sessionLoggedAt = sessionStorage.getItem('pe_admin_session_logged_at');
        const passUpdatedAt = localStorage.getItem('pe_admin_password_updated_at');
        if (sessionLoggedAt && passUpdatedAt) {
          if (new Date(passUpdatedAt).getTime() > new Date(sessionLoggedAt).getTime()) {
            clearLegacyAdminSessions();
            setCurrentUser(null);
            setCurrentTab('dashboard');
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [currentUser]);

  // Invalidate persistent admin session on admin password change event
  useEffect(() => {
    const handleAdminPasswordChangedEvent = () => {
      if (currentUser?.role === 'admin') {
        clearLegacyAdminSessions();
        setCurrentUser(null);
        setCurrentTab('dashboard');
      }
    };

    window.addEventListener('pe_admin_password_changed', handleAdminPasswordChangedEvent);
    return () => window.removeEventListener('pe_admin_password_changed', handleAdminPasswordChangedEvent);
  }, [currentUser]);

  const handleRequestNotification = async () => {
    const granted = await browserNotifications.requestPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      browserNotifications.send({
        title: 'اعلان‌های سامانه ارزیابی عملکرد فعال شد',
        body: 'از این پس یادآوری‌های تاییدات و سررسید کارتابل‌ها را به صورت خودکار دریافت خواهید کرد.'
      });
    }
  };

  const getTourStepsForRole = (userRole: string) => {
    if (userRole === 'employee') {
      return [
        { tab: 'my-evaluation', title: 'کارنامه و خودارزیابی من', desc: 'مشاهده شاخص‌های تخصصی شغل خود، امتیازدهی ۱ تا ۵ و ارسال نهایی به سرپرست' },
        { tab: 'workflow', title: 'گردش کار و تاییدات', desc: 'رهگیری زنده پرونده در ۶ گام گردش کار و امکان ثبت اعتراض و درخواست بازنگری' },
        { tab: 'onboarding', title: 'آموزش بدو ورود', desc: 'آشنایی کامل با آیین‌نامه ارزیابی عملکرد و پاسخ به آزمون سنجش صلاحیت' }
      ];
    } else if (userRole === 'supervisor') {
      return [
        { tab: 'dashboard', title: 'داشبورد ارزیابی و هدف‌گذاری', desc: 'پایش روند رشد عملکرد پرسنل کارگاه و ثبت اهداف بهبود فردی' },
        { tab: 'workflow', title: 'کارتابل وظایف و گردش کار', desc: 'مشاهده سریع پرونده‌های در انتظار ارزیابی سرپرست و ارسال به کالیبراسیون' },
        { tab: 'evaluations', title: 'فرم‌های ارزیابی و مربی‌گری هوشمند', desc: 'ثبت نمرات شاخص‌ها با مستندات الزامی و دریافت پیشنهادات تحلیلی AI' },
        { tab: 'employees', title: 'لیست پرسنل و کنترل وضعیت', desc: 'بررسی وضعیت تکمیل ارزیابی زیرمجموعه و شروع سریع ارزیابی دوره‌ای' },
        { tab: 'reports', title: 'تحلیل‌ها و ماتریس ۹-Box', desc: 'مشاهده نمودار توزیع نمرات و پراکندگی پرسنل بر حسب شایستگی' },
        { tab: 'onboarding', title: 'آموزش و آزمون ارزیاب', desc: 'مرور ضوابط ضدسوگیری و اخذ نشان افتخار ارزیاب ذیصلاح' }
      ];
    } else {
      // Admin / HR
      return [
        { tab: 'dashboard', title: 'داشبورد جامع مدیریت', desc: 'مشاهده آمار کلان سازمان، تحلیل‌های هوش مصنوعی و شاخص‌های کلیدی (KPIs)' },
        { tab: 'workflow', title: 'مدیریت گردش کار و انتساب سازمانی', desc: 'پیکربندی مراحل سازمانی، قوانین تایید و انتساب گروهی سرپرستان' },
        { tab: 'criteria', title: 'بانک مرکزی شاخص‌ها', desc: 'تعریف و فرمول‌بندی معیارهای کمی و کیفی بر اساس ابعاد پنج‌گانه شایستگی' },
        { tab: 'profiles', title: 'پروفایل‌های شغلی و اوزان', desc: 'تنظیم اوزان شاخص‌ها (مجموع ۱۰۰٪) و درج اجباری شاخص ایمنی HSE' },
        { tab: 'employees', title: 'مدیریت پرسنل و ساختار', desc: 'ویرایش پرسنل، انتساب مشاغل و تعیین سلسله‌مراتب ارزیابی' },
        { tab: 'evaluations', title: 'فرم‌های ارزیابی سازمانی', desc: 'پایش جامع نمرات، آپلود اکسل و بررسی مستندات پرونده‌ها' },
        { tab: 'calibration', title: 'پنل کالیبراسیون کمیته', desc: 'کنترل توزیع زنگوله‌ای نمرات و جلوگیری از تورم نمره‌ای' },
        { tab: 'reports', title: 'گزارشات و ماتریس استعداد', desc: 'ماتریس ۹-Box، تحلیل روندها و خروجی رسمی کارنامه‌ها' },
        { tab: 'settings', title: 'مرکز امنیت و پشتیبان‌گیری', desc: 'مدیریت کاربران، کلمات عبور، لاگ‌ها و بکاپ‌گیری ابری' }
      ];
    }
  };

  const currentTourSteps = currentUser ? getTourStepsForRole(currentUser.role) : [];

  const handleStartTour = () => {
    if (!currentUser) return;
    const steps = getTourStepsForRole(currentUser.role);
    if (steps.length > 0) {
      setActiveTourStep(0);
      setCurrentTab(steps[0].tab);
    }
  };

  const handleNextTourStep = () => {
    if (activeTourStep === null || !currentUser) return;
    const steps = getTourStepsForRole(currentUser.role);
    if (activeTourStep < steps.length - 1) {
      const nextStep = activeTourStep + 1;
      setActiveTourStep(nextStep);
      setCurrentTab(steps[nextStep].tab);
    } else {
      setActiveTourStep(null);
      localStorage.setItem('pe_tour_completed_' + currentUser.id + '_' + currentUser.role, 'true');
    }
  };

  const handlePrevTourStep = () => {
    if (activeTourStep === null || !currentUser) return;
    const steps = getTourStepsForRole(currentUser.role);
    if (activeTourStep > 0) {
      const prevStep = activeTourStep - 1;
      setActiveTourStep(prevStep);
      setCurrentTab(steps[prevStep].tab);
    }
  };

  const [hasCertifiedBadge, setHasCertifiedBadge] = useState<boolean>(() => {
    return localStorage.getItem('pe_certified_badge') === 'true';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('pe_theme');
    if (!saved) {
      localStorage.setItem('pe_theme', 'light');
      return 'light';
    }
    return (saved as 'dark' | 'light') || 'light';
  });

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  const [criteria, setCriteria] = useState<Criterion[]>(() => {
    const saved = localStorage.getItem('pe_criteria');
    return saved ? JSON.parse(saved) : SEED_CRITERIA;
  });

  const [profiles, setProfiles] = useState<JobProfile[]>(() => {
    const saved = localStorage.getItem('pe_profiles');
    return saved ? JSON.parse(saved) : SEED_PROFILES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('pe_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return sanitizeEmployees(parsed);
      } catch {
        return SEED_EMPLOYEES;
      }
    }
    return SEED_EMPLOYEES;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem('pe_evaluations');
    return saved ? JSON.parse(saved) : SEED_EVALUATIONS;
  });

  const [archivedEvaluations, setArchivedEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem('pe_archived_evaluations');
    return saved ? JSON.parse(saved) : [];
  });

  const notifyDataSaved = useCallback(() => {
    setSaveIndicator(true);
    const t = setTimeout(() => setSaveIndicator(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('pe_criteria', JSON.stringify(criteria));
    notifyDataSaved();
  }, [criteria, notifyDataSaved]);

  useEffect(() => {
    localStorage.setItem('pe_profiles', JSON.stringify(profiles));
    notifyDataSaved();
  }, [profiles, notifyDataSaved]);

  useEffect(() => {
    localStorage.setItem('pe_employees', JSON.stringify(employees));
    notifyDataSaved();
  }, [employees, notifyDataSaved]);

  useEffect(() => {
    localStorage.setItem('pe_evaluations', JSON.stringify(evaluations));
    notifyDataSaved();
  }, [evaluations, notifyDataSaved]);

  useEffect(() => {
    localStorage.setItem('pe_archived_evaluations', JSON.stringify(archivedEvaluations));
    notifyDataSaved();
  }, [archivedEvaluations, notifyDataSaved]);

  // Check and alert pending tasks if user is logged in
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'supervisor') {
      const pendingEvals = evaluations.filter(ev => {
        const emp = employees.find(e => e.id === ev.empId);
        return emp && (emp.supervisorId === currentUser.id || !emp.supervisorId) && (ev.status === 'draft' || ev.status === 'pending');
      });
      if (pendingEvals.length > 0 && notificationPermission === 'granted') {
        const lastAlert = sessionStorage.getItem('pe_last_notif_alert');
        if (!lastAlert) {
          browserNotifications.sendWorkflowDeadlineAlert('supervisor', pendingEvals.length, 'پایان ماه جاری');
          sessionStorage.setItem('pe_last_notif_alert', 'true');
        }
      }
    } else if (currentUser.role === 'employee') {
      const myEval = evaluations.find(ev => ev.empId === currentUser.id);
      if ((!myEval || myEval.scores.every(s => s.self === 0)) && notificationPermission === 'granted') {
        const lastAlert = sessionStorage.getItem('pe_last_notif_emp_alert');
        if (!lastAlert) {
          browserNotifications.sendWorkflowDeadlineAlert('employee', 1);
          sessionStorage.setItem('pe_last_notif_emp_alert', 'true');
        }
      }
    }
  }, [currentUser, evaluations, employees, notificationPermission]);

  // Session user storage is handled strictly inside sessionStorage on handleLogin / handleLogout

  useEffect(() => {
    localStorage.setItem('pe_certified_badge', hasCertifiedBadge ? 'true' : 'false');
  }, [hasCertifiedBadge]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleLogin = (emp: Employee) => {
    const sanitized = sanitizeUser(emp);
    if (!sanitized) return;
    sessionStorage.setItem('pe_session_user', JSON.stringify(sanitized));
    if (sanitized.role === 'admin') {
      sessionStorage.setItem('pe_admin_session_logged_at', new Date().toISOString());
    }
    setCurrentUser(sanitized);
    
    // Check if onboarding or tour is needed for this role
    const hasSeenRoleTour = localStorage.getItem('pe_tour_completed_' + sanitized.id + '_' + sanitized.role);
    const hasOnboarded = localStorage.getItem('pe_onboarded_' + sanitized.id);

    if (!hasOnboarded) {
      setCurrentTab('onboarding');
    } else if (!hasSeenRoleTour) {
      if (sanitized.role === 'employee') {
        setCurrentTab('my-evaluation');
      } else {
        setCurrentTab('dashboard');
      }
      setTimeout(() => {
        handleStartTour();
      }, 400);
    } else {
      if (sanitized.role === 'employee') {
        setCurrentTab('my-evaluation');
      } else {
        setCurrentTab('dashboard');
      }
    }
  };

  const handleLogout = () => {
    clearLegacyAdminSessions();
    sessionStorage.removeItem('pe_last_notif_alert');
    sessionStorage.removeItem('pe_last_notif_emp_alert');
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleForceAdminReauth = useCallback(() => {
    clearLegacyAdminSessions();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  }, []);

  const handleSwitchUser = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const sanitized = sanitizeUser(emp);
      if (!sanitized) return;
      sessionStorage.setItem('pe_session_user', JSON.stringify(sanitized));
      if (sanitized.role === 'admin') {
        sessionStorage.setItem('pe_admin_session_logged_at', new Date().toISOString());
      }
      setCurrentUser(sanitized);
      
      const hasSeenRoleTour = localStorage.getItem('pe_tour_completed_' + sanitized.id + '_' + sanitized.role);
      const hasOnboarded = localStorage.getItem('pe_onboarded_' + sanitized.id);

      if (!hasOnboarded) {
        setCurrentTab('onboarding');
      } else if (!hasSeenRoleTour) {
        if (sanitized.role === 'employee') {
          setCurrentTab('my-evaluation');
        } else {
          setCurrentTab('dashboard');
        }
        setTimeout(() => {
          handleStartTour();
        }, 400);
      } else {
        if (sanitized.role === 'employee') {
          setCurrentTab('my-evaluation');
        } else {
          setCurrentTab('dashboard');
        }
      }
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pe_theme', next);
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menuWidth = 280;
    const menuHeight = 440;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth) x = Math.max(10, window.innerWidth - menuWidth - 15);
    if (y + menuHeight > window.innerHeight) y = Math.max(10, window.innerHeight - menuHeight - 15);
    setContextMenu({ x, y, visible: true });
  };

  const handleQuickJSONBackup = () => {
    const dataToExport = {
      meta: { app: 'سیستم ارزیابی عملکرد', version: '3.5.0-Enterprise', exportDate: new Date().toISOString(), exportedBy: currentUser?.name || 'ناشناس' },
      employees, profiles, criteria, evaluations
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `chalak_quick_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setContextMenu(null);
  };

  const handleAddCriterion = (crit: Omit<Criterion, 'id'>): boolean => {
    const valResult = validateCriterionInput(crit);
    if (!valResult.success) {
      alert(valResult.errors.join('\n'));
      return false;
    }
    const validated = valResult.data;
    const exists = criteria.some(c => c.code.trim().toUpperCase() === validated.code.trim().toUpperCase());
    if (exists) return false;
    const newCrit: Criterion = { 
      id: `crit-${Math.random().toString(36).substring(2, 9)}`, 
      code: validated.code,
      cat: validated.cat,
      name: validated.name,
      def: validated.def,
      source: validated.source,
      method: validated.method,
      dir: validated.dir
    };
    setCriteria(prev => [...prev, newCrit]);
    return true;
  };

  const handleUpdateCriterion = (id: string, crit: Omit<Criterion, 'id'>): boolean => {
    const valResult = validateCriterionInput(crit);
    if (!valResult.success) {
      alert(valResult.errors.join('\n'));
      return false;
    }
    const validated = valResult.data;
    const isDuplicate = criteria.some(c => c.code.trim().toUpperCase() === validated.code.trim().toUpperCase() && c.id !== id);
    if (isDuplicate) return false;
    setCriteria(prev => prev.map(c => c.id === id ? { 
      ...c, 
      code: validated.code,
      cat: validated.cat,
      name: validated.name,
      def: validated.def,
      source: validated.source,
      method: validated.method,
      dir: validated.dir
    } : c));
    return true;
  };

  const handleDeleteCriterion = (id: string) => {
    const isUsed = profiles.some(p => p.items.some(item => item.cid === id));
    if (isUsed) {
      alert('این شاخص در یک پروفایل شغلی استفاده شده و قابل حذف نیست.');
      return;
    }
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleAddProfile = (prof: Omit<JobProfile, 'id'>) => {
    const valResult = validateJobProfileInput(prof);
    if (!valResult.success) {
      alert(valResult.errors.join('\n'));
      return;
    }
    const validated = valResult.data;
    const newProf: JobProfile = { 
      id: `prof-${Math.random().toString(36).substring(2, 9)}`, 
      title: validated.title,
      code: validated.code,
      family: validated.family,
      locked: validated.locked,
      items: validated.items
    };
    setProfiles(prev => [...prev, newProf]);
  };

  const handleUpdateProfile = (id: string, prof: Omit<JobProfile, 'id'>) => {
    const valResult = validateJobProfileInput(prof);
    if (!valResult.success) {
      alert(valResult.errors.join('\n'));
      return;
    }
    const validated = valResult.data;
    setProfiles(prev => prev.map(p => p.id === id ? { 
      ...p, 
      title: validated.title,
      code: validated.code,
      family: validated.family,
      locked: validated.locked,
      items: validated.items
    } : p));
  };

  const handleDeleteProfile = (id: string) => {
    const isAssigned = employees.some(e => e.profileId === id);
    if (isAssigned) {
      alert('این پروفایل به کارمندان متصل است و قابل حذف نیست.');
      return;
    }
    setProfiles(profiles.filter(p => p.id !== id));
  };

  const handleToggleLockProfile = (id: string) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, locked: !p.locked } : p));
  };

  const handleAddEmployee = (emp: Omit<Employee, 'id'>) => {
    const valResult = validateEmployeeInput(emp);
    if (!valResult.success) {
      alert(valResult.errors.join('\n'));
      return;
    }
    const validated = valResult.data;
    const newEmp: Employee = { 
      id: `emp-${Math.random().toString(36).substring(2, 9)}`, 
      name: validated.name,
      code: validated.code,
      unit: validated.unit,
      profileId: validated.profileId,
      role: validated.role,
      username: validated.username,
      supervisorId: validated.supervisorId,
      peerReviewerId: validated.peerReviewerId,
      calibrationLeadId: validated.calibrationLeadId,
      approverId: validated.approverId,
      hrPartnerId: validated.hrPartnerId
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const handleUpdateEmployee = (id: string, emp: Omit<Employee, 'id'>) => {
    const valResult = validateEmployeeInput(emp);
    if (!valResult.success) {
      alert(valResult.errors.join('\n'));
      return;
    }
    const validated = valResult.data;
    setEmployees(prev => prev.map(e => e.id === id ? { 
      ...e, 
      name: validated.name,
      code: validated.code,
      unit: validated.unit,
      profileId: validated.profileId,
      role: validated.role,
      username: validated.username,
      supervisorId: validated.supervisorId,
      peerReviewerId: validated.peerReviewerId,
      calibrationLeadId: validated.calibrationLeadId,
      approverId: validated.approverId,
      hrPartnerId: validated.hrPartnerId
    } : e));
  };

  const handleDeleteEmployee = (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    // Protect admin account strictly
    if (target.role === 'admin' || target.username === 'admin' || target.code === 'ADMIN-001') {
      return;
    }
    const updatedEmployees = employees.filter(e => e.id !== id);
    const updatedEvaluations = evaluations.filter(ev => ev.empId !== id);
    setEmployees(updatedEmployees);
    setEvaluations(updatedEvaluations);
    localStorage.setItem('pe_employees', JSON.stringify(updatedEmployees));
    localStorage.setItem('pe_evaluations', JSON.stringify(updatedEvaluations));

    // Clear credential records if any
    try {
      const pKey = target.username.toLowerCase();
      const pwMap = JSON.parse(localStorage.getItem('pe_user_passwords') || '{}');
      if (pwMap[pKey]) {
        delete pwMap[pKey];
        localStorage.setItem('pe_user_passwords', JSON.stringify(pwMap));
      }
    } catch (e) {}

    // Immediate sync to server
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pe_employees: updatedEmployees,
        pe_evaluations: updatedEvaluations
      })
    }).catch(console.error);
  };

  const handleAddEvaluation = (empId: string, period: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const prof = profiles.find(p => p.id === emp.profileId);
    if (!prof) return;
    const initialScores = prof.items.map(item => ({ cid: item.cid, weight: item.weight, value: 0, self: 0, doc: '' }));
    const newEval: Evaluation = {
      id: `eval-${Math.random().toString(36).substring(2, 9)}`,
      empId, profileId: prof.id, period, status: 'draft', scores: initialScores, created: Date.now()
    };
    setEvaluations([...evaluations, newEval]);
    setActiveEvalId(newEval.id);
    setCurrentTab('evaluations');
  };

  const handleUpdateEvaluation = (id: string, updatedEv: Evaluation) => {
    setEvaluations(prev => {
      const exists = prev.some(e => e.id === id);
      if (exists) return prev.map(e => e.id === id ? updatedEv : e);
      return [...prev, updatedEv];
    });
  };

  const handleDeleteEvaluation = (id: string) => {
    setEvaluations(evaluations.filter(e => e.id !== id));
    if (activeEvalId === id) setActiveEvalId(null);
  };

  const handleStartEvaluationDirect = (empId: string) => {
    const existing = evaluations.find(ev => ev.empId === empId && ev.period === 'بهار ۱۴۰۵');
    if (existing) {
      setActiveEvalId(existing.id);
      setCurrentTab('evaluations');
    } else {
      handleAddEvaluation(empId, 'بهار ۱۴۰۵');
    }
  };

  const handleSelectEvaluation = (id: string) => {
    setActiveEvalId(id);
    setCurrentTab('evaluations');
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'داشبورد مدیریت';
      case 'workflow': return 'گردش کار و تاییدات';
      case 'criteria': return 'بانک شاخص‌ها';
      case 'profiles': return 'پروفایل‌های شغلی';
      case 'employees': return 'مدیریت کارکنان';
      case 'evaluations': return 'فرم‌های ارزیابی';
      case 'calibration': return 'کالیبراسیون عملکرد';
      case 'reports': return 'گزارشات سازمانی';
      case 'lattice-hub': return 'مدیریت اهداف و استعدادها (Lattice)';
      case 'kickidler-hub': return 'پایش بهره‌وری و زمان کار (Kickidler)';
      case 'onboarding': return 'آموزش سیستم';
      case 'my-evaluation': return 'ارزیابی من';
      case 'settings': return 'تنظیمات امنیتی';
      default: return 'سیستم مدیریت عملکرد';
    }
  };

  if (!currentUser) {
    return <Login employees={employees} onLogin={handleLogin} theme={theme} />;
  }

  return (
    <div onContextMenu={handleContextMenu} className={`flex flex-col md:flex-row h-screen overflow-hidden font-sans text-right transition-colors duration-300 relative ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b z-30 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-xl bg-slate-800/20 text-teal-400 hover:bg-slate-800/40 transition-colors cursor-pointer" aria-label="منو">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-black tracking-tight">{getTabTitle(currentTab)}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveIndicator && (
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-fade-in">
              <CheckCircle2 className="w-3 h-3" /> ذخیره شد
            </span>
          )}
          <button 
            type="button" 
            onClick={() => setIsManualModalOpen(true)} 
            className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors cursor-pointer"
            title="کتابچه راهنما و دانلود PDF"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <SupervisorNotificationBell
            evaluations={evaluations}
            employees={employees}
            currentUser={currentUser}
            onNavigate={setCurrentTab}
            theme={theme}
          />
          <button type="button" onClick={handleToggleTheme} className="p-1.5 rounded-xl bg-slate-800/20 text-slate-400 hover:text-slate-200 cursor-pointer">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      <Sidebar 
        currentTab={currentTab} 
        onChangeTab={(tab) => { setCurrentTab(tab); if (tab !== 'evaluations') setActiveEvalId(null); }} 
        currentUser={currentUser} onLogout={handleLogout} theme={theme} onToggleTheme={handleToggleTheme} 
        hasCertifiedBadge={hasCertifiedBadge} employees={employees} onSwitchUser={handleSwitchUser} 
        onStartTour={handleStartTour}
        onOpenManual={() => setIsManualModalOpen(true)}
        isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />

      <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950/60 backdrop-blur-3xl' : 'bg-slate-100/40'}`}>
        {/* Desktop Sticky Header with Supervisor Overdue Notification Bell */}
        <div className={`hidden md:flex items-center justify-between px-6 py-2.5 border-b sticky top-0 z-20 backdrop-blur-md ${
          theme === 'dark' ? 'bg-slate-950/85 border-slate-800/80' : 'bg-white/85 border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black tracking-tight">{getTabTitle(currentTab)}</span>
            <span className="text-[11px] text-slate-500 font-medium">| سامانه جامع مدیریت عملکرد و ارزیابی شایستگی‌های شغلی</span>
          </div>
          <div className="flex items-center gap-3">
            {saveIndicator && (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full animate-fade-in border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> ذخیره خودکار فعال
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-bold transition-all cursor-pointer"
              title="مشاهده و دانلود کتابچه راهنمای جامع به صورت PDF"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>کتابچه راهنما (PDF)</span>
            </button>
            <SupervisorNotificationBell
              evaluations={evaluations}
              employees={employees}
              currentUser={currentUser}
              onNavigate={setCurrentTab}
              theme={theme}
            />
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-1.5 rounded-xl bg-slate-800/20 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="تغییر تم"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
          {currentTab === 'dashboard' && <Dashboard criteria={criteria} profiles={profiles} employees={employees} evaluations={evaluations} onNavigate={setCurrentTab} onSelectEvaluation={handleSelectEvaluation} currentUser={currentUser} hasCertifiedBadge={hasCertifiedBadge} theme={theme} />}
          {currentTab === 'workflow' && <WorkflowManager currentUser={currentUser} evaluations={evaluations} employees={employees} profiles={profiles} criteria={criteria} onUpdateEvaluation={handleUpdateEvaluation} onSelectEvaluation={handleSelectEvaluation} theme={theme} />}
          {currentTab === 'criteria' && (
            <CriteriaBank 
              criteria={criteria} 
              onAddCriterion={handleAddCriterion} 
              onUpdateCriterion={handleUpdateCriterion} 
              onDeleteCriterion={handleDeleteCriterion} 
              employees={employees}
              profiles={profiles}
              evaluations={evaluations}
              onUpdateEvaluations={setEvaluations}
              theme={theme} 
            />
          )}
          {currentTab === 'profiles' && <JobProfiles profiles={profiles} criteria={criteria} onAddProfile={handleAddProfile} onUpdateProfile={handleUpdateProfile} onDeleteProfile={handleDeleteProfile} onToggleLockProfile={handleToggleLockProfile} onAddCriterion={handleAddCriterion} theme={theme} />}
          {currentTab === 'employees' && <Employees employees={employees} profiles={profiles} onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee} onStartEvaluation={handleStartEvaluationDirect} theme={theme} />}
          {currentTab === 'evaluations' && <Evaluations evaluations={evaluations} employees={employees} profiles={profiles} criteria={criteria} onAddEvaluation={handleAddEvaluation} onUpdateEvaluation={handleUpdateEvaluation} onDeleteEvaluation={handleDeleteEvaluation} activeEvalId={activeEvalId} onSetActiveEval={setActiveEvalId} currentUser={currentUser} />}
          {currentTab === 'calibration' && <Calibration evaluations={evaluations} employees={employees} profiles={profiles} onUpdateEvaluation={handleUpdateEvaluation} onSelectEvaluation={handleSelectEvaluation} />}
          {currentTab === 'reports' && <Reports evaluations={evaluations} employees={employees} profiles={profiles} criteria={criteria} />}
          {currentTab === 'lattice-hub' && (
            <LatticePerformanceHub 
              currentUser={currentUser} 
              employees={employees} 
              theme={theme} 
              onNavigate={setCurrentTab} 
            />
          )}
          {currentTab === 'kickidler-hub' && (
            <KickidlerProductivityHub 
              currentUser={currentUser} 
              employees={employees} 
              theme={theme} 
              onNavigate={setCurrentTab} 
            />
          )}
          {currentTab === 'onboarding' && <Onboarding currentUser={currentUser} onComplete={() => { if (currentUser) localStorage.setItem('pe_onboarded_' + currentUser.id, 'true'); if (currentUser && currentUser.role === 'employee') setCurrentTab('my-evaluation'); else setCurrentTab('dashboard'); }} hasCertifiedBadge={hasCertifiedBadge} onGrantBadge={() => setHasCertifiedBadge(true)} theme={theme} />}
          {currentTab === 'my-evaluation' && <MyEvaluation currentUser={currentUser} evaluations={evaluations} profiles={profiles} criteria={criteria} onUpdateEvaluation={handleUpdateEvaluation} onAddEvaluation={handleAddEvaluation} theme={theme} />}
          {currentTab === 'settings' && (
            currentUser.role === 'admin' ? (
              <ManagementCenter 
                employees={employees} 
                profiles={profiles} 
                criteria={criteria} 
                evaluations={evaluations} 
                archivedEvaluations={archivedEvaluations}
                onSetEmployees={setEmployees} 
                onSetProfiles={setProfiles} 
                onSetCriteria={setCriteria} 
                onSetEvaluations={setEvaluations} 
                onSetArchivedEvaluations={setArchivedEvaluations}
                currentUser={currentUser} 
                theme={theme} 
                onForceReauth={handleForceAdminReauth}
              />
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto mt-12 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-rose-300">⛔ عدم دسترسی مجاز به پرتال مدیریت</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تنظیمات پیشرفته و مرکز مدیریت سامانه منحصراً در اختیار مدیریت ارشد منابع انسانی با کلمه عبور اختصاصی می‌باشد.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentUser.role === 'employee' ? 'my-evaluation' : 'dashboard')}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  بازگشت به داشبورد
                </button>
              </div>
            )
          )}
          </div>
        </div>
      </main>

      {contextMenu?.visible && (
        <div className={`fixed rounded-2xl border p-2 w-72 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800 text-slate-200 shadow-teal-950/30' : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300'}`} style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
          <div className="px-3 py-2 border-b border-slate-800/15 text-[10px] font-black text-slate-400 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-teal-400"><Sparkles className="w-3.5 h-3.5" /> میانبرهای ویژه</span>
            <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-mono">v3.5 CF</span>
          </div>
          <div className="p-1 space-y-0.5 mt-1 text-xs">
            {currentUser.role !== 'employee' ? (
              <>
                <button type="button" onClick={() => { setCurrentTab('dashboard'); setContextMenu(null); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer">
                  <div className="flex items-center gap-2"><Home className="w-3.5 h-3.5 text-teal-500" /><span>داشبورد من</span></div>
                  <span className="text-[10px] text-slate-500 font-mono">Alt+1</span>
                </button>
                <button type="button" onClick={() => { setCurrentTab('evaluations'); setContextMenu(null); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer">
                  <div className="flex items-center gap-2"><ClipboardCheck className="w-3.5 h-3.5 text-teal-500" /><span>ارزیابی‌ها</span></div>
                  <span className="text-[10px] text-slate-500 font-mono">Alt+2</span>
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setCurrentTab('my-evaluation'); setContextMenu(null); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer">
                <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-teal-500" /><span>ارزیابی من</span></div>
                <span className="text-[10px] text-slate-500 font-mono">Alt+1</span>
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button type="button" onClick={() => { setCurrentTab('settings'); setContextMenu(null); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer">
                <div className="flex items-center gap-2"><LockKeyhole className="w-3.5 h-3.5 text-rose-500" /><span>تنظیمات پیشرفته</span></div>
                <span className="text-[10px] text-rose-400 font-mono">SuperAdmin</span>
              </button>
            )}
            <hr className={`my-1 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`} />
            <button type="button" onClick={handleQuickJSONBackup} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer text-indigo-400">
              <div className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /><span>بکاپ سریع (JSON)</span></div>
              <span className="text-[10px] text-indigo-400 font-mono">Backup</span>
            </button>
            <button type="button" onClick={() => { setContextMenu(null); setIsManualModalOpen(true); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer text-teal-400">
              <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /><span>کتابچه راهنمای جامع (PDF)</span></div>
              <span className="text-[10px] text-teal-400 font-mono">Manual</span>
            </button>
            <button type="button" onClick={() => { setContextMenu(null); window.print(); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer">
              <div className="flex items-center gap-2"><Printer className="w-3.5 h-3.5" /><span>پرینت / PDF گزارش</span></div>
              <span className="text-[10px] text-slate-500 font-mono">Ctrl+P</span>
            </button>
            <button type="button" onClick={() => { handleToggleTheme(); setContextMenu(null); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer">
              <div className="flex items-center gap-2">{theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}<span>تغییر قالب</span></div>
              <span className="text-[10px] text-slate-500">{theme === 'dark' ? 'روشن' : 'تاریک'}</span>
            </button>
            <button type="button" onClick={() => { handleStartTour(); setContextMenu(null); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition-all cursor-pointer">
              <div className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 text-teal-400" /><span>آموزش مجدد</span></div>
              <span className="text-[10px] text-slate-500 font-mono">Tour</span>
            </button>
            <hr className={`my-1 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`} />
            <div className="px-3 py-1 text-[10px] text-slate-500 flex justify-between items-center">
              <span className="truncate">{currentUser.name}</span><span className="font-mono">{currentUser.code}</span>
            </div>
            <button type="button" onClick={() => { handleLogout(); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer font-bold">
              <LogOut className="w-3.5 h-3.5" /><span>خروج از حساب</span>
            </button>
          </div>
        </div>
      )}
      
       {activeTourStep !== null && currentTourSteps[activeTourStep] && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[999] p-4 font-sans text-right" dir="rtl">
           <div className="bg-slate-900 border border-teal-500/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center border-b border-slate-800 pb-3">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                 <h3 className="text-sm font-black text-teal-400">راهنمای هوشمند</h3>
               </div>
               <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-lg font-mono">{activeTourStep + 1} از {currentTourSteps.length}</span>
             </div>
             <div className="space-y-2">
               <h4 className="text-sm font-black text-slate-100">{currentTourSteps[activeTourStep].title}</h4>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">{currentTourSteps[activeTourStep].desc}</p>
             </div>
             <div className="flex justify-between items-center pt-2">
               <button type="button" onClick={() => setActiveTourStep(null)} className="text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors cursor-pointer">بستن آموزش</button>
               <div className="flex items-center gap-2">
                 {activeTourStep > 0 && <button type="button" onClick={handlePrevTourStep} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border border-slate-700">قبلی</button>}
                 <button type="button" onClick={handleNextTourStep} className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 cursor-pointer">
                   {activeTourStep === currentTourSteps.length - 1 ? 'پایان' : 'بعدی'}
                 </button>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Comprehensive System Manual & Printable PDF Guide Modal */}
      <ComprehensiveManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}
