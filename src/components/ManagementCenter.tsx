/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Key, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Search, 
  Users, 
  HelpCircle,
  Copy,
  FolderLock,
  UserCheck,
  Sparkles,
  Sliders,
  Award,
  UserCog,
  Check,
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Dices,
  LockKeyhole,
  CheckCheck,
  Filter,
  Activity,
  Layers,
  Database,
  FileCheck
} from 'lucide-react';
import { Employee, JobProfile, Criterion, Evaluation, UserRole, UserCustomPermission } from '../types';
import ExcelIntegrationCenter from './ExcelIntegrationCenter';

export interface SystemLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'success' | 'danger';
}

interface ManagementCenterProps {
  employees: Employee[];
  profiles: JobProfile[];
  criteria: Criterion[];
  evaluations: Evaluation[];
  onSetEmployees: (emps: Employee[]) => void;
  onSetProfiles: (profs: JobProfile[]) => void;
  onSetCriteria: (crits: Criterion[]) => void;
  onSetEvaluations: (evals: Evaluation[]) => void;
  currentUser: Employee;
  theme: 'dark' | 'light';
}

export default function ManagementCenter({
  employees,
  profiles,
  criteria,
  evaluations,
  onSetEmployees,
  onSetProfiles,
  onSetCriteria,
  onSetEvaluations,
  currentUser,
  theme
}: ManagementCenterProps) {
  // Navigation Tab inside Management Center
  const [activeSectionTab, setActiveSectionTab] = useState<'security' | 'rbac' | 'backup' | 'logs' | 'all'>('security');

  // Excel Integration Modal State
  const [isExcelIntegrationOpen, setIsExcelIntegrationOpen] = useState(false);

  // --- 1. USER PASSWORDS & LOCKOUT STATE ---
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pe_user_passwords');
    if (saved) return JSON.parse(saved);
    return {};
  });

  const [lockedUsers, setLockedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('pe_locked_users');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('pe_user_passwords', JSON.stringify(userPasswords));
  }, [userPasswords]);

  useEffect(() => {
    localStorage.setItem('pe_locked_users', JSON.stringify(lockedUsers));
  }, [lockedUsers]);

  // Employee Password Management Search & Filters
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'custom_pass' | 'default_pass' | 'locked'>('all');
  
  // Custom Password Edit Modal/Inline State
  const [editingPasswordEmp, setEditingPasswordEmp] = useState<Employee | null>(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [showCustomPassInput, setShowCustomPassInput] = useState(true);
  const [credentialsFeedback, setCredentialsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedEmpId, setCopiedEmpId] = useState<string | null>(null);

  // --- 2. ADMIN PASSWORD MANAGEMENT ---
  const [currentAdminPasswordInput, setCurrentAdminPasswordInput] = useState('');
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');
  const [confirmAdminPasswordInput, setConfirmAdminPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedMasterKey, setCopiedMasterKey] = useState(false);

  // --- 3. STATE FOR RBAC PERMISSIONS ---
  interface RolePermissions {
    role: UserRole;
    canEditCriteria: boolean;
    canEditProfiles: boolean;
    canEditEmployees: boolean;
    canStartEvaluations: boolean;
    canLockScores: boolean;
    canViewSalaries: boolean;
    canDefineTargets: boolean;
    canRestoreBackup: boolean;
  }

  const [permissions, setPermissions] = useState<RolePermissions[]>(() => {
    const saved = localStorage.getItem('pe_role_permissions');
    if (saved) return JSON.parse(saved);
    return [
      {
        role: 'admin',
        canEditCriteria: true,
        canEditProfiles: true,
        canEditEmployees: true,
        canStartEvaluations: true,
        canLockScores: true,
        canViewSalaries: true,
        canDefineTargets: true,
        canRestoreBackup: true
      },
      {
        role: 'supervisor',
        canEditCriteria: false,
        canEditProfiles: false,
        canEditEmployees: true,
        canStartEvaluations: true,
        canLockScores: false,
        canViewSalaries: false,
        canDefineTargets: true,
        canRestoreBackup: false
      },
      {
        role: 'employee',
        canEditCriteria: false,
        canEditProfiles: false,
        canEditEmployees: false,
        canStartEvaluations: false,
        canLockScores: false,
        canViewSalaries: false,
        canDefineTargets: false,
        canRestoreBackup: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pe_role_permissions', JSON.stringify(permissions));
  }, [permissions]);

  // --- 4. STATE FOR INDIVIDUAL USER CUSTOM PERMISSIONS ---
  const [customUserPermissions, setCustomUserPermissions] = useState<Record<string, UserCustomPermission>>(() => {
    const saved = localStorage.getItem('pe_user_custom_permissions');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('pe_user_custom_permissions', JSON.stringify(customUserPermissions));
  }, [customUserPermissions]);

  const [selectedIndividualId, setSelectedIndividualId] = useState<string>(() => {
    return employees[0]?.id || '';
  });

  const selectedIndividual = employees.find(e => e.id === selectedIndividualId) || employees[0];

  const [individualPermDraft, setIndividualPermDraft] = useState<UserCustomPermission>({
    userId: selectedIndividual?.id || '',
    canEditCriteria: false,
    canEditProfiles: false,
    canEditEmployees: false,
    canStartEvaluations: false,
    canLockScores: false,
    canDefineTargets: false,
    canViewReports: false,
    canRestoreBackup: false
  });

  const [individualRoleDraft, setIndividualRoleDraft] = useState<UserRole>(selectedIndividual?.role || 'employee');
  const [individualSaveFeedback, setIndividualSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedIndividual) return;
    setIndividualRoleDraft(selectedIndividual.role);
    
    const custom = customUserPermissions[selectedIndividual.id];
    if (custom) {
      setIndividualPermDraft(custom);
    } else {
      const roleBase = permissions.find(p => p.role === selectedIndividual.role);
      setIndividualPermDraft({
        userId: selectedIndividual.id,
        canEditCriteria: roleBase?.canEditCriteria || false,
        canEditProfiles: roleBase?.canEditProfiles || false,
        canEditEmployees: roleBase?.canEditEmployees || false,
        canStartEvaluations: roleBase?.canStartEvaluations || false,
        canLockScores: roleBase?.canLockScores || false,
        canDefineTargets: roleBase?.canDefineTargets || false,
        canViewReports: selectedIndividual.role !== 'employee',
        canRestoreBackup: roleBase?.canRestoreBackup || false
      });
    }
  }, [selectedIndividualId, employees, customUserPermissions, permissions]);

  // --- 5. STATE FOR CSV / BACKUP / AUDIT LOGS ---
  const [csvText, setCsvText] = useState('');
  const [csvFeedback, setCsvFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [backupFeedback, setBackupFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'success' | 'danger'>('all');

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem('pe_system_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-1',
        timestamp: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()),
        operator: 'مدیریت منابع انسانی',
        action: 'راه‌اندازی سامانه',
        details: 'پایگاه داده و پروتکل‌های امنیتی با موفقیت آماده به کار شدند.',
        type: 'success'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pe_system_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (action: string, details: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()),
      operator: currentUser.name,
      action,
      details,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 199)]);
  };

  // --- USER CREDENTIAL HANDLERS ---
  const handleOpenEditPassword = (emp: Employee) => {
    setEditingPasswordEmp(emp);
    const existing = userPasswords[emp.username.toLowerCase()] || '';
    setCustomPasswordInput(existing);
  };

  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordEmp) return;

    const cleanPass = customPasswordInput.trim();
    if (!cleanPass) {
      // If empty, remove custom pass (reset to default)
      handleResetUserPasswordToDefault(editingPasswordEmp.username);
      setEditingPasswordEmp(null);
      return;
    }

    if (cleanPass.length < 3) {
      setCredentialsFeedback({ type: 'error', message: 'کلمه عبور باید حداقل ۳ کاراکتر باشد.' });
      return;
    }

    const updated = {
      ...userPasswords,
      [editingPasswordEmp.username.toLowerCase()]: cleanPass
    };
    setUserPasswords(updated);
    addLog(
      'تغییر کلمه عبور کاربر',
      `کلمه عبور کاربر «${editingPasswordEmp.name}» (${editingPasswordEmp.username}) توسط مدیریت با موفقیت تغییر یافت.`,
      'success'
    );
    setCredentialsFeedback({ type: 'success', message: `کلمه عبور همکار «${editingPasswordEmp.name}» با موفقیت ثبت گردید.` });
    setEditingPasswordEmp(null);
    setTimeout(() => setCredentialsFeedback(null), 4000);
  };

  const handleGenerateRandomPassword = (emp: Employee) => {
    const prefix = 'Chalak#';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const generated = `${prefix}${randomNum}`;
    
    const updated = {
      ...userPasswords,
      [emp.username.toLowerCase()]: generated
    };
    setUserPasswords(updated);
    addLog(
      'تولید رمز تصادفی کاربر',
      `کلمه عبور جدید تصادفی (${generated}) برای کاربر «${emp.name}» ایجاد و ثبت شد.`,
      'info'
    );
    setCredentialsFeedback({ 
      type: 'success', 
      message: `رمز عبور جدید «${generated}» برای ${emp.name} تنظیم گردید.` 
    });
    setTimeout(() => setCredentialsFeedback(null), 5000);
  };

  const handleResetUserPasswordToDefault = (username: string) => {
    const updated = { ...userPasswords };
    delete updated[username.toLowerCase()];
    setUserPasswords(updated);
    addLog(
      'بازنشانی رمز کاربر به پیش‌فرض',
      `کلمه عبور کاربر «${username}» به حالت پیش‌فرض (123456) بازنشانی شد.`,
      'warning'
    );
    setCredentialsFeedback({ 
      type: 'success', 
      message: `کلمه عبور کاربر «${username}» به مقدار پیش‌فرض بازنشانی گردید.` 
    });
    setTimeout(() => setCredentialsFeedback(null), 4000);
  };

  const handleToggleLockUser = (emp: Employee) => {
    const isLocked = lockedUsers.includes(emp.id) || lockedUsers.includes(emp.username.toLowerCase());
    let updated: string[];
    if (isLocked) {
      updated = lockedUsers.filter(id => id !== emp.id && id !== emp.username.toLowerCase());
      addLog('رفع مسدودی حساب کاربری', `حساب کاربری همکار «${emp.name}» (${emp.code}) فعال و رفع انسداد شد.`, 'success');
      setCredentialsFeedback({ type: 'success', message: `حساب کاربری ${emp.name} فعال گردید.` });
    } else {
      updated = [...lockedUsers, emp.id, emp.username.toLowerCase()];
      addLog('مسدودسازی حساب کاربری', `حساب کاربری همکار «${emp.name}» (${emp.code}) توسط مدیریت موقتاً مسدود شد.`, 'danger');
      setCredentialsFeedback({ type: 'error', message: `حساب کاربری ${emp.name} مسدود شد.` });
    }
    setLockedUsers(updated);
    setTimeout(() => setCredentialsFeedback(null), 4000);
  };

  const handleBulkResetAllPasswords = () => {
    if (window.confirm('آیا از بازنشانی کلمه عبور تمام پرسنل به مقدار پیش‌فرض اطمینان دارید؟ تمامی رمزهای اختصاصی پاک خواهند شد.')) {
      setUserPasswords({});
      addLog('بازنشانی گروهی کلمات عبور', 'کلمه عبور تمامی پرسنل و کاربران به مقدار پیش‌فرض بازنشانی گردید.', 'warning');
      setCredentialsFeedback({ type: 'success', message: 'کلمه عبور کلیه کاربران با موفقیت به پیش‌فرض بازنشانی شد.' });
      setTimeout(() => setCredentialsFeedback(null), 4000);
    }
  };

  const handleBulkUnlockAll = () => {
    setLockedUsers([]);
    addLog('رفع مسدودی همگانی', 'تمامی حساب‌های کاربری مسدودشده در کارخانه رفع انسداد شدند.', 'success');
    setCredentialsFeedback({ type: 'success', message: 'تمامی حساب‌های کاربری فعال شدند.' });
    setTimeout(() => setCredentialsFeedback(null), 4000);
  };

  const handleCopyUserCredentials = (emp: Employee) => {
    const pass = userPasswords[emp.username.toLowerCase()] || '123456 (پیش‌فرض)';
    const text = `نام: ${emp.name}\nکد پرسنلی: ${emp.code}\nنام کاربری: ${emp.username}\nکلمه عبور: ${pass}\nواحد سازمانی: ${emp.unit}`;
    navigator.clipboard.writeText(text);
    setCopiedEmpId(emp.id);
    setTimeout(() => setCopiedEmpId(null), 2500);
  };

  const handleExportCredentialsCSV = () => {
    let csv = `نام و نام خانوادگی,کد پرسنلی,نام کاربری,کلمه عبور فعلی,واحد سازمانی,نقش,وضعیت حساب\n`;
    employees.forEach(emp => {
      const pass = userPasswords[emp.username.toLowerCase()] || '123456 (پیش‌فرض)';
      const isLocked = lockedUsers.includes(emp.id) || lockedUsers.includes(emp.username.toLowerCase());
      const roleFa = emp.role === 'admin' ? 'مدیر ارشد' : emp.role === 'supervisor' ? 'سرپرست خط' : 'اپراتور کارگاه';
      csv += `"${emp.name}","${emp.code}","${emp.username}","${pass}","${emp.unit}","${roleFa}","${isLocked ? 'مسدود' : 'فعال'}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chalak_credentials_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('خروجی اطلاعات کاربری پرسنل', 'دانلود فایل اکسل حاوی نام کاربری و کلمات عبور کل پرسنل', 'info');
  };

  // Filtered Employees List for Credentials Table
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = userSearchTerm.toLowerCase();
      const matchSearch = emp.name.toLowerCase().includes(q) || 
                          emp.code.toLowerCase().includes(q) || 
                          emp.username.toLowerCase().includes(q) || 
                          emp.unit.toLowerCase().includes(q);
      if (!matchSearch) return false;

      if (userRoleFilter !== 'all' && emp.role !== userRoleFilter) return false;

      const hasCustom = !!userPasswords[emp.username.toLowerCase()];
      const isLocked = lockedUsers.includes(emp.id) || lockedUsers.includes(emp.username.toLowerCase());

      if (userStatusFilter === 'custom_pass' && !hasCustom) return false;
      if (userStatusFilter === 'default_pass' && hasCustom) return false;
      if (userStatusFilter === 'locked' && !isLocked) return false;

      return true;
    });
  }, [employees, userSearchTerm, userRoleFilter, userStatusFilter, userPasswords, lockedUsers]);

  // --- ADMIN PASSWORD HANDLERS ---
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    const storedPass = localStorage.getItem('pe_admin_password') || 'admin';
    if (currentAdminPasswordInput !== storedPass) {
      setPasswordFeedback({ type: 'error', message: 'کلمه عبور فعلی نادرست است.' });
      return;
    }

    if (newAdminPasswordInput.length < 4) {
      setPasswordFeedback({ type: 'error', message: 'کلمه عبور جدید باید حداقل ۴ کاراکتر باشد.' });
      return;
    }

    if (newAdminPasswordInput !== confirmAdminPasswordInput) {
      setPasswordFeedback({ type: 'error', message: 'کلمه عبور جدید با تکرار آن مطابقت ندارد.' });
      return;
    }

    localStorage.setItem('pe_admin_password', newAdminPasswordInput);
    addLog('تغییر کلمه عبور مدیریت', 'کلمه عبور ورود مدیریت ارشد سیستم با موفقیت بروزرسانی شد.', 'success');
    setPasswordFeedback({ type: 'success', message: 'کلمه عبور مدیریت با موفقیت تغییر یافت و ذخیره شد.' });
    setCurrentAdminPasswordInput('');
    setNewAdminPasswordInput('');
    setConfirmAdminPasswordInput('');
    setTimeout(() => setPasswordFeedback(null), 5000);
  };

  const handleResetAdminPasswordDirect = () => {
    if (window.confirm('آیا مایلید کلمه عبور مدیر سیستم به مقدار پیش‌فرض «admin» بازنشانی شود؟')) {
      localStorage.setItem('pe_admin_password', 'admin');
      addLog('بازنشانی کلمه عبور مدیریت', 'کلمه عبور مدیر سیستم به مقدار پیش‌فرض (admin) بازنشانی شد.', 'warning');
      setPasswordFeedback({ type: 'success', message: 'کلمه عبور مدیریت به مقدار پیش‌فرض (admin) بازگردانده شد.' });
      setCurrentAdminPasswordInput('');
      setNewAdminPasswordInput('');
      setConfirmAdminPasswordInput('');
      setTimeout(() => setPasswordFeedback(null), 4000);
    }
  };

  const handleCopyMasterKey = () => {
    navigator.clipboard.writeText('Chalak@2026#Master');
    setCopiedMasterKey(true);
    setTimeout(() => setCopiedMasterKey(false), 2000);
  };

  // --- RBAC & INDIVIDUAL PERMISSION HANDLERS ---
  const handleToggleIndividualPerm = (key: keyof Omit<UserCustomPermission, 'userId'>) => {
    setIndividualPermDraft(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveIndividualPermissions = () => {
    if (!selectedIndividual) return;

    if (selectedIndividual.role !== individualRoleDraft) {
      const updatedEmployees = employees.map(e => 
        e.id === selectedIndividual.id ? { ...e, role: individualRoleDraft } : e
      );
      onSetEmployees(updatedEmployees);
    }

    const updatedCustom = {
      ...customUserPermissions,
      [selectedIndividual.id]: {
        ...individualPermDraft,
        userId: selectedIndividual.id
      }
    };
    setCustomUserPermissions(updatedCustom);

    addLog(
      'بروزرسانی دسترسی فردی', 
      `دسترسی‌های اختصاصی برای همکار «${selectedIndividual.name}» (${selectedIndividual.code}) با موفقیت ذخیره و اعمال شد.`, 
      'success'
    );

    setIndividualSaveFeedback('دسترسی‌ها و نقش این همکار با موفقیت ذخیره و اعمال گردید.');
    setTimeout(() => setIndividualSaveFeedback(null), 4000);
  };

  const handleResetIndividualToRole = () => {
    if (!selectedIndividual) return;
    const roleBase = permissions.find(p => p.role === individualRoleDraft);
    setIndividualPermDraft({
      userId: selectedIndividual.id,
      canEditCriteria: roleBase?.canEditCriteria || false,
      canEditProfiles: roleBase?.canEditProfiles || false,
      canEditEmployees: roleBase?.canEditEmployees || false,
      canStartEvaluations: roleBase?.canStartEvaluations || false,
      canLockScores: roleBase?.canLockScores || false,
      canDefineTargets: roleBase?.canDefineTargets || false,
      canViewReports: individualRoleDraft !== 'employee',
      canRestoreBackup: roleBase?.canRestoreBackup || false
    });

    const updated = { ...customUserPermissions };
    delete updated[selectedIndividual.id];
    setCustomUserPermissions(updated);

    addLog('بازنشانی دسترسی فردی', `دسترسی‌های همکار «${selectedIndividual.name}» به مقادیر پیش‌فرض نقش بازگردانده شد.`, 'info');
    setIndividualSaveFeedback('دسترسی‌های این همکار به تنظیمات پیش‌فرض نقش بازنشانی شد.');
    setTimeout(() => setIndividualSaveFeedback(null), 3000);
  };

  const handleGrantAllIndividual = () => {
    setIndividualPermDraft(prev => ({
      ...prev,
      canEditCriteria: true,
      canEditProfiles: true,
      canEditEmployees: true,
      canStartEvaluations: true,
      canLockScores: true,
      canDefineTargets: true,
      canViewReports: true,
      canRestoreBackup: true
    }));
  };

  const handleTogglePermission = (role: UserRole, key: keyof RolePermissions) => {
    if (role === 'admin' && key === 'canRestoreBackup') {
      alert('دسترسی پشتیبان‌گیری ادمین اصلی غیرقابل حذف است.');
      return;
    }
    setPermissions(prev => prev.map(p => {
      if (p.role === role) {
        const nextVal = !p[key];
        addLog('تغییر سطح دسترسی', `دسترسی ${key} برای نقش ${role} به ${nextVal ? 'فعال' : 'غیرفعال'} تغییر یافت.`, 'warning');
        return { ...p, [key]: nextVal } as RolePermissions;
      }
      return p;
    }));
  };

  // --- CSV IMPORT ---
  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      setCsvFeedback({ success: false, message: 'لطفاً کادر متنی داده‌ها را تکمیل کنید.' });
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setCsvFeedback({ success: false, message: 'فرمت نامعتبر. فایل باید حداقل دارای یک ردیف هدر و یک ردیف داده باشد.' });
        return;
      }

      const newEmployeesList: Employee[] = [...employees];
      let importedCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 5) {
          errorCount++;
          continue;
        }

        const [name, code, unit, profileTitle, username, role] = cols;
        let matchedProfile = profiles.find(p => p.title.includes(profileTitle) || p.id === profileTitle);
        const profileId = matchedProfile ? matchedProfile.id : (profiles[0]?.id || 'prof-1');
        const finalRole: UserRole = (role === 'admin' || role === 'supervisor' || role === 'employee') ? role : 'employee';

        const exists = newEmployeesList.some(emp => emp.username.toLowerCase() === username.toLowerCase() || emp.code === code);
        if (exists) {
          const idx = newEmployeesList.findIndex(emp => emp.username.toLowerCase() === username.toLowerCase() || emp.code === code);
          newEmployeesList[idx] = { ...newEmployeesList[idx], name, unit, profileId, role: finalRole };
        } else {
          newEmployeesList.push({
            id: `emp-${Math.random().toString(36).substring(2, 9)}`,
            name,
            code: code.toUpperCase(),
            unit,
            profileId,
            role: finalRole,
            username: username.toLowerCase()
          });
        }
        importedCount++;
      }

      onSetEmployees(newEmployeesList);
      addLog('ایمپورت پرسنل', `تعداد ${importedCount} پرسنل جدید به صورت گروهی بارگذاری/بروزرسانی شدند.`, 'success');
      setCsvFeedback({ 
        success: true, 
        message: `بارگذاری موفقیت‌آمیز! تعداد ${importedCount} همکار ایمپورت شدند. (خطاها: ${errorCount})` 
      });
      setCsvText('');
    } catch {
      setCsvFeedback({ success: false, message: 'خطا در تحلیل فرمت اطلاعات ارسالی. لطفاً هدرها و جداکننده‌ها را چک کنید.' });
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = `نام و نام خانوادگی,کد پرسنلی,واحد سازمانی,عنوان شایستگی ایستگاه,نام کاربری,نقش دسترسی
علیرضا رضایی,EC-110,سالن مونتاژ ۲,اپراتور مونتاژ برد الکترونیک,rezaei,employee
محمد حسینی,EC-115,واحد کنترل کیفی QC,کارشناس کنترل کیفیت فرآیند,hoseini,supervisor
زهرا عباسی,EC-120,تضمین کیفیت QA,اپراتور تولید کارگاهی,abasi,employee`;

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'chalak_employees_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('دانلود قالب اکسل', 'دانلود نمونه فایل ورود گروهی پرسنل اصفهان چالاک', 'info');
  };

  // --- BACKUP & RESTORE JSON ---
  const handleExportJSON = () => {
    const dataToExport = {
      meta: {
        app: 'اصفهان چالاک - سامانه ارزیابی عملکرد و مربیگری',
        version: '3.5.0-Enterprise',
        exportDate: new Date().toISOString(),
        exportedBy: currentUser.name
      },
      employees,
      profiles,
      criteria,
      evaluations,
      permissions,
      customUserPermissions,
      userPasswords,
      lockedUsers,
      logs
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `chalak_full_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('پشتیبان‌گیری کامل', 'یک نسخه پشتیبان کامل از تمامی دیتابیس و تنظیمات سامانه صادر شد.', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.employees && parsed.profiles && parsed.criteria && parsed.evaluations) {
            onSetEmployees(parsed.employees);
            onSetProfiles(parsed.profiles);
            onSetCriteria(parsed.criteria);
            onSetEvaluations(parsed.evaluations);
            if (parsed.permissions) setPermissions(parsed.permissions);
            if (parsed.customUserPermissions) setCustomUserPermissions(parsed.customUserPermissions);
            if (parsed.userPasswords) setUserPasswords(parsed.userPasswords);
            if (parsed.lockedUsers) setLockedUsers(parsed.lockedUsers);
            if (parsed.logs) setLogs(parsed.logs);

            addLog('بازیابی پشتیبان', 'دیتابیس سیستم از فایل پشتیبان با موفقیت بازیابی شد.', 'danger');
            setBackupFeedback({ success: true, message: 'بازیابی کلیه اطلاعات با موفقیت کامل انجام شد.' });
          } else {
            setBackupFeedback({ success: false, message: 'ساختار فایل پشتیبان نامعتبر است.' });
          }
        } catch {
          setBackupFeedback({ success: false, message: 'خطا در خواندن و پارس کردن فایل JSON پشتیبان.' });
        }
      };
    }
  };

  // --- OFFLINE STANDALONE HTML EXPORT ---
  const handleExportOfflineHTML = () => {
    const appData = {
      employees,
      profiles,
      criteria,
      evaluations,
      permissions
    };

    const htmlString = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>داشبورد آفلاین کارنامه شایستگی - شرکت تولیدی و صنعتی اصفهان چالاک</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;900&display=swap');
    body { font-family: 'Vazirmatn', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
      <div>
        <h1 class="text-xl font-black text-teal-400">کارنامه و سامانه آفلاین ارزیابی عملکرد</h1>
        <p class="text-xs text-slate-400 mt-1">شرکت تولیدی و صنعتی اصفهان چالاک • نسخه مستقل ۱۰۰٪ آفلاین دسکتاپ</p>
      </div>
      <div class="bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs px-3 py-1.5 rounded-xl font-bold">
        تعداد پرسنل: ${employees.length} نفر
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <span class="text-xs text-slate-400">تعداد ارزیابی‌های ثبت‌شده</span>
        <h3 class="text-2xl font-black text-slate-100 mt-1">${evaluations.length}</h3>
      </div>
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <span class="text-xs text-slate-400">تعداد شایستگی‌های تعریف‌شده</span>
        <h3 class="text-2xl font-black text-teal-400 mt-1">${criteria.length}</h3>
      </div>
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <span class="text-xs text-slate-400">تعداد ایستگاه‌های شغلی</span>
        <h3 class="text-2xl font-black text-indigo-400 mt-1">${profiles.length}</h3>
      </div>
    </div>

    <div class="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
      <h2 class="text-sm font-bold text-slate-200">فهرست پرسنل و کارنامه عملکرد</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead>
            <tr class="text-slate-400 border-b border-slate-800">
              <th class="p-3">نام و نام خانوادگی</th>
              <th class="p-3">کد پرسنلی</th>
              <th class="p-3">واحد سازمانی</th>
              <th class="p-3">نقش سازمانی</th>
              <th class="p-3 text-center">مشاهده جزئیات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-slate-300">
            ${employees.map(emp => `
              <tr class="hover:bg-slate-800/20">
                <td class="p-3 font-bold text-slate-100">${emp.name}</td>
                <td class="p-3 font-mono text-teal-400">${emp.code}</td>
                <td class="p-3 text-slate-400">${emp.unit}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] ${emp.role === 'admin' ? 'bg-rose-500/10 text-rose-300' : emp.role === 'supervisor' ? 'bg-amber-500/10 text-amber-300' : 'bg-teal-500/10 text-teal-300'}">
                    ${emp.role === 'admin' ? 'مدیر سیستم' : emp.role === 'supervisor' ? 'سرپرست خط' : 'اپراتور'}
                  </span>
                </td>
                <td class="p-3 text-center">
                  <button onclick="showDetails('${emp.id}')" class="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-3 py-1 rounded-lg text-xs font-bold transition-all">مشاهده کارنامه</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div id="details-panel" class="hidden bg-slate-900 border border-teal-500/40 rounded-3xl p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="det-name" class="text-base font-bold text-teal-300">کارنامه همکار</h3>
        <button onclick="document.getElementById('details-panel').classList.add('hidden')" class="text-xs text-slate-400 hover:text-slate-200">بستن ✕</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="p-3 bg-slate-950 rounded-xl">کد پرسنلی: <span id="det-code" class="font-mono text-teal-400"></span></div>
        <div class="p-3 bg-slate-950 rounded-xl">واحد: <span id="det-unit" class="text-slate-200"></span></div>
        <div class="p-3 bg-slate-950 rounded-xl">امتیاز کل: <span id="det-score" class="font-bold text-teal-400"></span></div>
      </div>
      <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800">
        <h4 class="text-xs font-bold text-slate-400 mb-2">بازخورد مربیگری و برنامه اقدام توسعه:</h4>
        <p id="det-coaching" class="text-xs text-slate-300 leading-relaxed whitespace-pre-line"></p>
      </div>
    </div>
  </div>

  <script>
    const data = ${JSON.stringify(appData)};

    function showDetails(empId) {
      const emp = data.employees.find(e => e.id === empId);
      if (!emp) return;

      document.getElementById('det-name').innerText = 'کارنامه ارزیابی: ' + emp.name;
      document.getElementById('det-code').innerText = emp.code;
      document.getElementById('det-unit').innerText = emp.unit;

      const ev = data.evaluations.find(e => e.empId === empId);
      if (ev) {
        let total = 0;
        let sumWeights = 0;
        ev.scores.forEach(s => {
          total += (s.value || 0) * (s.weight || 10);
          sumWeights += (s.weight || 10);
        });
        const finalScore = sumWeights > 0 ? ((total / (sumWeights * 5)) * 100).toFixed(1) : '۰';
        document.getElementById('det-score').innerText = finalScore + ' از ۱۰۰';

        if (ev.aiFeedback) {
          const fb = ev.aiFeedback;
          const summaryText = typeof fb === 'string' ? fb : fb.summary;
          const bulletList = fb.actionItems ? '\\n\\nبرنامه اقدام توسعه:\\n' + fb.actionItems.map(a => '- ' + a).join('\\n') : '';
          document.getElementById('det-coaching').innerText = summaryText + bulletList;
        } else {
          document.getElementById('det-coaching').innerText = 'ارزیابی ثبت شده ولی بازخورد مربیگری صادر نشده است.';
        }
      } else {
        document.getElementById('det-score').innerText = 'ثبت نشده';
        document.getElementById('det-coaching').innerText = 'هیچ ارزیابی برای این همکار تا این لحظه ثبت نگردیده است.';
      }

      document.getElementById('details-panel').classList.remove('hidden');
      document.getElementById('details-panel').scrollIntoView({ behavior: 'smooth' });
    }
  </script>
</body>
</html>`;

    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'chalak_performance_offline_dashboard.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('صدور آفلاین رکوردهای سیستم', 'دانلود نسخه دبل‌کلیک آفلاین و مستقل کل سیستم ارزیابی کارخانه', 'success');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-rose-500/20">
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                مرکز مدیریت و امنیت ارشد سامانه (SuperAdmin Console)
                <span className="text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                  سطح دسترسی تام
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                کنترل کامل کلمات عبور پرسنل، بازیابی اضطراری کلید طلایی، ماتریس دسترسی‌های سازمانی (RBAC) و پشتیبان‌گیری
              </p>
            </div>
          </div>
        </div>

        {/* Security Health Quick Meter */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
            ۹۸٪
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block">امتیاز سلامت امنیت سیستم</span>
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> وضعیت عالی و رمزنگاری‌شده
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSectionTab('security')}
          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSectionTab === 'security'
              ? 'bg-rose-500 text-slate-50 shadow-lg shadow-rose-500/20'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <LockKeyhole className="w-4 h-4" />
          <span>مدیریت کلمه عبور و امنیت کاربران</span>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{employees.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('rbac')}
          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSectionTab === 'rbac'
              ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>دسترسی‌ها و ماتریس سازمانی (RBAC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('backup')}
          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSectionTab === 'backup'
              ? 'bg-indigo-500 text-slate-50 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>پشتیبان‌گیری، خروجی اکسل و HTML</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('logs')}
          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSectionTab === 'logs'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>گزارش لاگ‌ها و رویدادهای امنیتی</span>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{logs.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('all')}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto ${
            activeSectionTab === 'all'
              ? 'bg-slate-700 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>نمایش یکپارچه همه بخش‌ها</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: USER PASSWORDS, ADMIN SECURITY & MASTER BREAK-GLASS PROTOCOL  */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'security' || activeSectionTab === 'all') && (
        <div className="space-y-6">
          
          {/* Top Security Grid: 1. Admin Password | 2. Master Break-Glass Recovery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. ADMIN PASSWORD MANAGEMENT CARD */}
            <div className="lg:col-span-6 bg-slate-800/40 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-200">تغییر کلمه عبور مدیر سیستم (Admin)</h2>
                    <p className="text-[10px] text-slate-400">تنظیم رمز اختصاصی ورود به پرتال مدیریت ارشد</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetAdminPasswordDirect}
                  className="text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20 flex items-center gap-1 transition-all cursor-pointer"
                  title="بازنشانی رمز عبور به پیش‌فرض (admin)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>بازنشانی به پیش‌فرض (admin)</span>
                </button>
              </div>

              {passwordFeedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordFeedback.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}>
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">کلمه عبور فعلی مدیریت</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      placeholder="کلمه عبور فعلی..."
                      value={currentAdminPasswordInput}
                      onChange={(e) => setCurrentAdminPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-slate-500 hover:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">کلمه عبور جدید</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="کلمه عبور جدید..."
                        value={newAdminPasswordInput}
                        onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-slate-500 hover:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">تکرار کلمه عبور جدید</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="تکرار کلمه عبور جدید..."
                      value={confirmAdminPasswordInput}
                      onChange={(e) => setConfirmAdminPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    💡 با تغییر رمز، ورود به پرتال با کلمه عبور جدید صورت می‌پذیرد.
                  </span>
                  <button
                    type="submit"
                    className="bg-rose-500 hover:bg-rose-600 text-slate-50 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>ذخیره کلمه عبور جدید</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. MASTER EMERGENCY RECOVERY & BREAK-GLASS PROTOCOL CARD */}
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/30 rounded-3xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-amber-300">پروتکل کلید طلایی و بازیابی اضطراری (Break-Glass)</h2>
                      <p className="text-[10px] text-slate-400">حساب ویژه و قطعی جهت مواقع فراموشی رمز ادمین</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    فعال و ایمن
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  چنانچه کلمه عبور اختصاصی مدیر سیستم تغییر یافته و فراموش شود، با استفاده از نام کاربری و کلید طلایی زیر می‌توانید در هر زمان به پرتال ادمین وارد شده و رمزها را بازنشانی فرمایید.
                </p>

                {/* Master Credentials Box */}
                <div className="bg-slate-950/90 border border-amber-500/20 rounded-2xl p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans text-[11px]">نام کاربری کلید طلایی:</span>
                    <span className="text-teal-300 font-bold bg-teal-500/10 px-2.5 py-0.5 rounded-md border border-teal-500/20">master</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans text-[11px]">کلید امنیتی اضطراری:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">Chalak@2026#Master</span>
                      <button
                        type="button"
                        onClick={handleCopyMasterKey}
                        className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 rounded-lg cursor-pointer"
                        title="کپی کلید طلایی"
                      >
                        {copiedMasterKey ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans pt-1 border-t border-slate-900">
                    <span>کد عددی سریع:</span>
                    <span className="font-mono text-slate-400 font-bold">999999</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-400/80 pt-1">
                <span>🛡️ کلید طلایی به صورت پیش‌فرض در هسته سیستم فعال و محافظت‌شده است.</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* USER PASSWORDS & CREDENTIALS DIRECTORY (RESET/CHANGE FOR ALL EMPLOYEES)   */}
          {/* ========================================================================= */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            
            {/* Header and Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <LockKeyhole className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-100">مدیریت کلمه عبور و امنیت دسترسی تک‌تک پرسنل</h2>
                    <span className="text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                      تغییر و بازنشانی رمز همه افراد
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مشاهده، تعریف رمز اختصاصی، تولید رمز تصادفی قدرتمند، قفل حساب و بازنشانی کلمه عبور برای هر یک از همکاران کارگاه
                  </p>
                </div>
              </div>

              {/* Mass Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCredentialsCSV}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>دانلود لیست رمزها (اکسل)</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkResetAllPasswords}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>بازنشانی رمز همه به پیش‌فرض</span>
                </button>
                {lockedUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkUnlockAll}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>رفع مسدودی همه حساب‌ها ({lockedUsers.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Feedback Message */}
            {credentialsFeedback && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                credentialsFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {credentialsFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{credentialsFeedback.message}</span>
              </div>
            )}

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="sm:col-span-5 relative">
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام همکار، کد پرسنلی، نام کاربری یا واحد..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-9 pl-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="all">تمام نقش‌های سازمانی</option>
                  <option value="admin">مدیران سیستم (Admin)</option>
                  <option value="supervisor">سرپرستان خط (Supervisor)</option>
                  <option value="employee">اپراتورهای کارگاه (Employee)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="all">تمام وضعیت‌های کلمه عبور</option>
                  <option value="custom_pass">دارای کلمه عبور اختصاصی</option>
                  <option value="default_pass">دارای کلمه عبور پیش‌فرض</option>
                  <option value="locked">حساب‌های مسدودشده</option>
                </select>
              </div>
            </div>

            {/* Inline Password Edit Form when an Employee is Selected */}
            {editingPasswordEmp && (
              <div className="bg-rose-500/5 border-2 border-rose-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-black text-slate-100">
                      تعیین کلمه عبور جدید برای «{editingPasswordEmp.name}» (نام کاربری: {editingPasswordEmp.username})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingPasswordEmp(null)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ✕ انصراف
                  </button>
                </div>

                <form onSubmit={handleSaveCustomPassword} className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type={showCustomPassInput ? "text" : "password"}
                      required
                      placeholder="کلمه عبور جدید همکار را وارد کنید..."
                      value={customPasswordInput}
                      onChange={(e) => setCustomPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pl-10 text-xs text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomPassInput(!showCustomPassInput)}
                      className="text-slate-500 hover:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                    >
                      {showCustomPassInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-slate-50 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>ثبت و فعال‌سازی کلمه عبور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateRandomPassword(editingPasswordEmp)}
                    className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="تولید خودکار رمز امن"
                  >
                    <Dices className="w-4 h-4 text-amber-400" />
                    <span>تولید رمز تصادفی</span>
                  </button>
                </form>
              </div>
            )}

            {/* Employees Credential Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-3 pr-3">نام و مشخصات همکار</th>
                    <th className="pb-3 text-center">کد پرسنلی</th>
                    <th className="pb-3 text-center">نام کاربری</th>
                    <th className="pb-3 text-center">نقش</th>
                    <th className="pb-3 text-center">کلمه عبور فعلی</th>
                    <th className="pb-3 text-center">وضعیت حساب</th>
                    <th className="pb-3 text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredEmployees.map(emp => {
                    const customPass = userPasswords[emp.username.toLowerCase()];
                    const isLocked = lockedUsers.includes(emp.id) || lockedUsers.includes(emp.username.toLowerCase());
                    const isCopied = copiedEmpId === emp.id;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                              emp.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              emp.role === 'supervisor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}>
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-100">{emp.name}</p>
                              <p className="text-[10px] text-slate-500">{emp.unit}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-center font-mono font-bold text-teal-400">
                          {emp.code}
                        </td>

                        <td className="py-3.5 text-center font-mono text-slate-300 font-bold">
                          {emp.username}
                        </td>

                        <td className="py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.role === 'admin' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                            emp.role === 'supervisor' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                          }`}>
                            {emp.role === 'admin' ? 'مدیر سیستم' : emp.role === 'supervisor' ? 'سرپرست خط' : 'اپراتور کارگاه'}
                          </span>
                        </td>

                        <td className="py-3.5 text-center">
                          {customPass ? (
                            <div className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold">
                              <span>{customPass}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                              123456 (پیش‌فرض)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-center">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                              <Lock className="w-3 h-3" /> مسدودشده
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> فعال
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Password Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditPassword(emp)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                              title="تغییر کلمه عبور این کاربر"
                            >
                              <Key className="w-3.5 h-3.5 text-rose-400" />
                            </button>

                            {/* Random Password Generator Button */}
                            <button
                              type="button"
                              onClick={() => handleGenerateRandomPassword(emp)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
                              title="تولید رمز تصادفی و اختصاص به این کاربر"
                            >
                              <Dices className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            {/* Reset to Default Button */}
                            {customPass && (
                              <button
                                type="button"
                                onClick={() => handleResetUserPasswordToDefault(emp.username)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 transition-all cursor-pointer"
                                title="بازنشانی به رمز عبور پیش‌فرض (123456)"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                              </button>
                            )}

                            {/* Lock / Unlock Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleLockUser(emp)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                isLocked 
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                                  : 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300'
                              }`}
                              title={isLocked ? "رفع مسدودی حساب کاربری" : "مسدودسازی موقت حساب کاربری"}
                            >
                              {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            {/* Copy Credentials Button */}
                            <button
                              type="button"
                              onClick={() => handleCopyUserCredentials(emp)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                              title="کپی مشخصات و رمز ورود به کلیپ‌بورد"
                            >
                              {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  هیچ همکاری با فیلترهای مشخص‌شده یافت نشد.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: RBAC MATRIX & INDIVIDUAL USER PERMISSION OVERRIDES             */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'rbac' || activeSectionTab === 'all') && (
        <div className="space-y-6">
          
          {/* 1. INDIVIDUAL USER ACCESS & PERMISSION OVERRIDES */}
          <div className="bg-slate-800/40 border border-teal-500/30 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <UserCog className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-100">مدیریت تخصیص دسترسی‌های اختصاصی و موردی همکاران</h2>
                    <span className="text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                      انتخاب فردی پرسنل
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    انتخاب هر یک از همکاران کارگاه، تعیین نقش کاربری و اعطای مستقیم یا محدودسازی مجوزهای دسترسی به بخش‌های سیستم
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleGrantAllIndividual}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>اعطای دسترسی کامل</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetIndividualToRole}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>بازنشانی به پیش‌فرض نقش</span>
                </button>
              </div>
            </div>

            {/* Feedback Banner */}
            {individualSaveFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{individualSaveFeedback}</span>
              </div>
            )}

            {/* Employee Selection & Details Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  انتخاب همکار جهت تنظیم دسترسی:
                </label>
                <select
                  value={selectedIndividualId}
                  onChange={(e) => setSelectedIndividualId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-950 border-slate-700 text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.code} ({emp.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">نقش پایه کاربری:</label>
                <select
                  value={individualRoleDraft}
                  onChange={(e) => setIndividualRoleDraft(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-slate-950 border-slate-700 text-teal-300 font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="admin">مدیر سیستم (Admin - دسترسی تام ارشد)</option>
                  <option value="supervisor">سرپرست خط (Supervisor - ارزیابی و مربیگری)</option>
                  <option value="employee">اپراتور کارگاه (Employee - خودارزیابی و کارنامه)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end space-y-1.5">
                <button
                  type="button"
                  onClick={handleSaveIndividualPermissions}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ذخیره و اعمال دسترسی‌های این همکار</span>
                </button>
              </div>
            </div>

            {/* Granular Permission Toggles Matrix for this Individual */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                ماتریس مجوزهای فعال برای «{selectedIndividual?.name}»:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Perm 1 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canEditCriteria ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canEditCriteria} onChange={() => handleToggleIndividualPerm('canEditCriteria')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">تعریف و تغییر معیارهای کیفی</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">افزودن و ویرایش سنجه‌های بازرسی و کدهای SOP</span>
                  </div>
                </label>

                {/* Perm 2 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canEditProfiles ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canEditProfiles} onChange={() => handleToggleIndividualPerm('canEditProfiles')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">مدیریت پروفایل‌های شغلی</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">تنظیم اوزان و ضرایب اهمیت ایستگاه‌ها</span>
                  </div>
                </label>

                {/* Perm 3 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canEditEmployees ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canEditEmployees} onChange={() => handleToggleIndividualPerm('canEditEmployees')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">ثبت و ویرایش اطلاعات پرسنل</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">افزودن همکار جدید، تغییر شغل، انتساب ایستگاه</span>
                  </div>
                </label>

                {/* Perm 4 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canStartEvaluations ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canStartEvaluations} onChange={() => handleToggleIndividualPerm('canStartEvaluations')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">ثبت دوره‌های ارزیابی عملکرد</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">آغاز ارزیابی جدید، امتیازدهی معیارها</span>
                  </div>
                </label>

                {/* Perm 5 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canLockScores ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canLockScores} onChange={() => handleToggleIndividualPerm('canLockScores')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">تایید، قفل نمرات و کالیبراسیون</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">نهایی‌سازی امتیازات و کالیبراسیون زنگوله‌ای</span>
                  </div>
                </label>

                {/* Perm 6 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canDefineTargets ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canDefineTargets} onChange={() => handleToggleIndividualPerm('canDefineTargets')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">ثبت اهداف مربیگری و KPIs</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">تعریف تارگت‌های عملیاتی و یادداشت‌های توسعه‌ای</span>
                  </div>
                </label>

                {/* Perm 7 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canViewReports ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canViewReports} onChange={() => handleToggleIndividualPerm('canViewReports')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">مشاهده تحلیل‌ها و گزارشات کلان</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">ماتریس ۹-Box، مقایسه واحدهای تولیدی و اکسل</span>
                  </div>
                </label>

                {/* Perm 8 */}
                <label className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  individualPermDraft.canRestoreBackup ? 'bg-teal-500/10 border-teal-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input type="checkbox" checked={individualPermDraft.canRestoreBackup} onChange={() => handleToggleIndividualPerm('canRestoreBackup')} className="mt-0.5 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-200">پشتیبان‌گیری و بازیابی دیتابیس</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">خروجی JSON، ایمپورت اکسل و بازنشانی اطلاعات</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. RBAC PERMISSIONS MATRIX */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <FolderLock className="w-5 h-5 text-teal-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-200">ماتریس پیشرفته دسترسی‌های سازمانی (RBAC)</h2>
                <p className="text-[10px] text-slate-400">بروزرسانی زنده و پیکربندی حقوق و عملکرد سیستم بر اساس نقش کاربری همکاران</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-3 pr-2">عنوان مجوز سیستم</th>
                    <th className="pb-3 text-center">مدیر سیستم (Admin)</th>
                    <th className="pb-3 text-center">سرپرست خط (Supervisor)</th>
                    <th className="pb-3 text-center">اپراتور کارگاه (Employee)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  <tr>
                    <td className="py-3 pr-2">
                      <p className="font-bold">تعریف و تغییر معیارهای کیفی کارخانه</p>
                      <p className="text-[9px] text-slate-500">ایجاد سنجه‌های بازرسی، ویرایش کدهای SOP</p>
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'admin')?.canEditCriteria} onChange={() => handleTogglePermission('admin', 'canEditCriteria')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'supervisor')?.canEditCriteria} onChange={() => handleTogglePermission('supervisor', 'canEditCriteria')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'employee')?.canEditCriteria} onChange={() => handleTogglePermission('employee', 'canEditCriteria')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-2">
                      <p className="font-bold">مدیریت و قفل پروفایل‌های شغلی</p>
                      <p className="text-[9px] text-slate-500">تنظیم وزن و ضرایب اهمیت شایستگی هر ایستگاه</p>
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'admin')?.canEditProfiles} onChange={() => handleTogglePermission('admin', 'canEditProfiles')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'supervisor')?.canEditProfiles} onChange={() => handleTogglePermission('supervisor', 'canEditProfiles')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'employee')?.canEditProfiles} onChange={() => handleTogglePermission('employee', 'canEditProfiles')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-2">
                      <p className="font-bold">تعریف و ویرایش اطلاعات پرسنل</p>
                      <p className="text-[9px] text-slate-500">ثبت همکار جدید، تغییر شغل، انتساب ایستگاه</p>
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'admin')?.canEditEmployees} onChange={() => handleTogglePermission('admin', 'canEditEmployees')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'supervisor')?.canEditEmployees} onChange={() => handleTogglePermission('supervisor', 'canEditEmployees')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'employee')?.canEditEmployees} onChange={() => handleTogglePermission('employee', 'canEditEmployees')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-2">
                      <p className="font-bold">شروع و ثبت دوره‌های ارزیابی عملکرد</p>
                      <p className="text-[9px] text-slate-500">آغاز ارزیابی جدید، امتیازدهی معیارها</p>
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'admin')?.canStartEvaluations} onChange={() => handleTogglePermission('admin', 'canStartEvaluations')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'supervisor')?.canStartEvaluations} onChange={() => handleTogglePermission('supervisor', 'canStartEvaluations')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'employee')?.canStartEvaluations} onChange={() => handleTogglePermission('employee', 'canStartEvaluations')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-2">
                      <p className="font-bold">قفل نهایی، کالیبراسیون و بایگانی</p>
                      <p className="text-[9px] text-slate-500">نهایی‌سازی نمرات، توزیع اجباری زنگوله‌ای</p>
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'admin')?.canLockScores} onChange={() => handleTogglePermission('admin', 'canLockScores')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'supervisor')?.canLockScores} onChange={() => handleTogglePermission('supervisor', 'canLockScores')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'employee')?.canLockScores} onChange={() => handleTogglePermission('employee', 'canLockScores')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-2">
                      <p className="font-bold">ثبت اهداف مربیگری و پایش کارگاه</p>
                      <p className="text-[9px] text-slate-500">تعریف تارگت‌های KPIs و ثبت اهداف عملیاتی</p>
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'admin')?.canDefineTargets} onChange={() => handleTogglePermission('admin', 'canDefineTargets')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'supervisor')?.canDefineTargets} onChange={() => handleTogglePermission('supervisor', 'canDefineTargets')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" checked={permissions.find(p => p.role === 'employee')?.canDefineTargets} onChange={() => handleTogglePermission('employee', 'canDefineTargets')} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500 cursor-pointer" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: BACKUP, EXCEL/CSV IMPORT & OFFLINE STANDALONE HTML EXPORT      */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'backup' || activeSectionTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* EXCEL INTEGRATION CARD (KASRA & MIS) */}
          <div className="lg:col-span-12 bg-gradient-to-r from-slate-900 to-teal-950/40 border border-teal-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <span>یکپارچه‌سازی و ورود داده از اکسل (سامانه کسری و سامانه MIS)</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full font-mono">Excel Sync</span>
                  </h2>
                  <p className="text-xs text-teal-300 mt-0.5">دریافت فایل‌های حضور/غیاب کسری و آمار تولید/کیفیت MIS و اعمال خودکار بر نمرات ارزیابی</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                با استفاده از این ابزار، می‌توانید قالب‌های اکسل رسمی را دانلود کرده، داده‌های ساعات کارکرد، تاخیر، غیبت، راندمان تولید و ضایعات را بارگذاری نموده و محاسبات دقیق ۱ تا ۵ را مستقیماً در فرم‌های ارزیابی عملکرد پرسنل بنشانید.
              </p>
            </div>

            <button
              onClick={() => setIsExcelIntegrationOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-teal-500/20 shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              <span>باز کردن مرکز ورود داده‌های کسری و MIS</span>
            </button>
          </div>

          {/* CLOUDFLARE CLOUD PERSISTENCE & SYNC STATUS */}
          <div className="lg:col-span-12 bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-teal-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-100">پایگاه داده ابری متمرکز کلادفلر (Cloud Native Persistence)</h2>
                  <p className="text-xs text-teal-300 mt-0.5">همگام‌سازی بلادرنگ داده‌ها بین کلیه سرپرستان، کارمندان و مدیریت ارشد</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                تمامی سوابق ارزیابی، احکام، فرمول‌های شایستگی و گردش کارها به طور آنی بر روی سرور ذخیره می‌شوند. هر کاربر با نقش و حساب مجزا وارد سامانه شده و تغییرات همزمان در کل کارخانه منعکس می‌گردد.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex items-center gap-3 text-xs">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <p className="font-bold text-slate-200">وضعیت اتصال ابری</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Cloud Sync: Connected (Active)</p>
                </div>
              </div>
            </div>
          </div>

          {/* EXCEL / CSV BULK IMPORT */}
          <div className="lg:col-span-6 bg-slate-800/30 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-200">ورود گروهی پرسنل از اکسل (CSV)</h2>
                <p className="text-[10px] text-slate-400">کپی و پیست مستقیم یا بارگذاری دسته‌جمعی پرسنل</p>
              </div>
            </div>

            {csvFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                csvFeedback.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {csvFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{csvFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleImportCSV} className="space-y-3">
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="نام و نام خانوادگی,کد پرسنلی,واحد سازمانی,عنوان شایستگی ایستگاه,نام کاربری,نقش"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>دانلود نمونه قالب استاندارد</span>
                </button>

                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>بارگذاری و ایمپورت گروهی</span>
                </button>
              </div>
            </form>
          </div>

          {/* BACKUP & RESTORE JSON */}
          <div className="lg:col-span-6 bg-slate-800/30 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Database className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 className="text-sm font-bold text-slate-200">پشتیبان‌گیری کامل و بازیابی دیتابیس (JSON)</h2>
                  <p className="text-[10px] text-slate-400">تهیه نسخه پشتیبان از کل سامانه، نمرات، رمزها و لاگ‌ها</p>
                </div>
              </div>

              {backupFeedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  backupFeedback.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}>
                  {backupFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{backupFeedback.message}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                جهت نگهداری امن اطلاعات ارزیابی دوره‌های گذشته یا انتقال سیستم به سرور دیگر، می‌توانید فایل JSON کامل را صادر نموده و در صورت نیاز بازیابی فرمایید.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>دانلود فایل پشتیبان (JSON)</span>
              </button>

              <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>بازیابی از فایل پشتیبان</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: AUDIT TRAIL & SYSTEM SECURITY EVENT LOGS                       */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'logs' || activeSectionTab === 'all') && (
        <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-200">ردپای امنیتی و ثبت رویدادهای سیستم (Audit Trail)</h2>
                <p className="text-[10px] text-slate-400">ثبت خودکار کلیه ورودها، تغییر کلمات عبور، بازنشانی‌ها و تخصیص دسترسی‌ها</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer focus:outline-none"
              >
                <option value="all">تمام رویدادها</option>
                <option value="success">موفقیت‌آمیز (Success)</option>
                <option value="warning">هشدارهای امنیتی (Warning)</option>
                <option value="danger">رویدادهای حساس (Danger)</option>
                <option value="info">اطلاعات عمومی (Info)</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('آیا از پاکسازی تاریخچه لاگ‌ها اطمینان دارید؟')) {
                    setLogs([]);
                  }
                }}
                className="text-rose-400 hover:text-rose-300 text-xs px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی لاگ‌ها</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {logs
              .filter(l => logFilter === 'all' || l.type === logFilter)
              .map(log => {
                const getBadge = () => {
                  switch (log.type) {
                    case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    case 'danger': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                  }
                };

                return (
                  <div key={log.id} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadge()}`}>
                        {log.action}
                      </span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0 font-mono">
                      <span>مجری: {log.operator}</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                );
              })}

            {logs.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs">
                هیچ رویدادی در تاریخچه ثبت نگردیده است.
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXCEL INTEGRATION MODAL */}
      <ExcelIntegrationCenter
        isOpen={isExcelIntegrationOpen}
        onClose={() => setIsExcelIntegrationOpen(false)}
        employees={employees}
        profiles={profiles}
        criteria={criteria}
        evaluations={evaluations}
        currentUser={currentUser}
        onUpdateEvaluations={onSetEvaluations}
        onAddEvaluation={(empId, period) => {
          const emp = employees.find(e => e.id === empId);
          if (!emp || !emp.profileId) return;
          const prof = profiles.find(p => p.id === emp.profileId);
          if (!prof) return;

          const scores = prof.items.map(item => ({
            cid: item.cid,
            weight: item.weight,
            value: 0,
            self: 0,
            doc: ''
          }));

          const newEval: Evaluation = {
            id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            empId,
            period,
            profileId: prof.id,
            status: 'draft',
            scores,
            note: '',
            created: Date.now()
          };
          onSetEvaluations([...evaluations, newEval]);
        }}
      />
    </div>
  );
}
