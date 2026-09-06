/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Database & Storage Service for Esfahan Chalak Performance System
 * Fully compatible with:
 * - Cloudflare Pages (Free tier static SPA & KV)
 * - Local & Containerized Node/Express Server
 * - Offline-first browser storage (resilient & persistent)
 */

import { Criterion, JobProfile, Employee, Evaluation } from '../types';
import { SEED_CRITERIA, SEED_PROFILES, SEED_EMPLOYEES, SEED_EVALUATIONS } from '../seedData';

const STORAGE_KEYS = {
  EMPLOYEES: 'pe_employees',
  CRITERIA: 'pe_criteria',
  PROFILES: 'pe_profiles',
  EVALUATIONS: 'pe_evaluations',
  ARCHIVED_EVALUATIONS: 'pe_archived_evaluations',
  THEME: 'pe_theme',
  USER_PASSWORDS: 'pe_user_passwords',
  ACTIVE_PERIOD: 'pe_active_period',
  BACKUP_TIMESTAMP: 'pe_last_backup_ts'
} as const;

export const CURRENT_ACTIVE_PERIOD = 'بهار ۱۴۰۵';

class AppDatabase {
  private syncTimeout: any = null;
  private isCloudAvailable: boolean = true;

  // Safe JSON getter
  private getItem<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  // Safe JSON setter
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.triggerCloudSyncDebounced();
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // --- EMPLOYEES ---
  public getEmployees(): Employee[] {
    const data = this.getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    if (!data || data.length === 0) {
      this.setItem(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
      return SEED_EMPLOYEES;
    }
    return data;
  }

  public saveEmployees(employees: Employee[]): void {
    this.setItem(STORAGE_KEYS.EMPLOYEES, employees);
  }

  public addEmployee(empData: Omit<Employee, 'id'>): { employee: Employee; evaluation: Evaluation | null } {
    const employees = this.getEmployees();
    
    // Generate clean username if empty
    let username = (empData.username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (!username) {
      const cleanCode = (empData.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      username = `user_${cleanCode || Math.random().toString(36).substring(2, 7)}`;
    }

    // Ensure unique username
    let finalUsername = username;
    let counter = 1;
    while (employees.some(e => e.username.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${username}_${counter}`;
      counter++;
    }

    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: finalUsername,
      code: empData.code.trim().toUpperCase()
    };

    const updatedEmployees = [...employees, newEmp];
    this.saveEmployees(updatedEmployees);

    // Automatically create an active evaluation for this employee so they appear in reports and cards
    let createdEval: Evaluation | null = null;
    try {
      const profiles = this.getProfiles();
      const matchedProfile = profiles.find(p => p.id === newEmp.profileId) || profiles[0];
      if (matchedProfile) {
        const evals = this.getEvaluations();
        const initialScores = (matchedProfile.items || []).map(item => ({
          cid: item.cid,
          weight: item.weight,
          value: 0,
          self: 0,
          doc: ''
        }));

        createdEval = {
          id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          empId: newEmp.id,
          profileId: matchedProfile.id,
          period: CURRENT_ACTIVE_PERIOD,
          status: 'draft',
          scores: initialScores,
          created: Date.now()
        };

        this.saveEvaluations([...evals, createdEval]);
      }
    } catch (err) {
      console.warn('Could not auto-generate initial evaluation for employee:', err);
    }

    return { employee: newEmp, evaluation: createdEval };
  }

  public updateEmployee(id: string, empData: Omit<Employee, 'id'>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updated: Employee = {
      ...empData,
      id,
      code: empData.code.trim().toUpperCase(),
      username: empData.username.trim().toLowerCase()
    };

    employees[index] = updated;
    this.saveEmployees(employees);
    return updated;
  }

  public deleteEmployee(id: string): boolean {
    const employees = this.getEmployees();
    const target = employees.find(e => e.id === id);
    if (!target) return false;

    // Protect main admin
    if (target.role === 'admin' && (target.username === 'admin' || target.code === 'ADMIN-001')) {
      return false;
    }

    const filtered = employees.filter(e => e.id !== id);
    this.saveEmployees(filtered);

    // Cascade delete evaluations
    const evals = this.getEvaluations();
    const filteredEvals = evals.filter(ev => ev.empId !== id);
    this.saveEvaluations(filteredEvals);

    // Clean password mapping if exists
    try {
      const pwMap = this.getItem<Record<string, string>>(STORAGE_KEYS.USER_PASSWORDS, {});
      if (pwMap[target.username.toLowerCase()]) {
        delete pwMap[target.username.toLowerCase()];
        localStorage.setItem(STORAGE_KEYS.USER_PASSWORDS, JSON.stringify(pwMap));
      }
    } catch {}

    return true;
  }

  // --- CRITERIA (PARAMETERS) ---
  public getCriteria(): Criterion[] {
    const data = this.getItem<Criterion[]>(STORAGE_KEYS.CRITERIA, []);
    if (!data || data.length === 0) {
      this.setItem(STORAGE_KEYS.CRITERIA, SEED_CRITERIA);
      return SEED_CRITERIA;
    }
    return data;
  }

  public saveCriteria(criteria: Criterion[]): void {
    this.setItem(STORAGE_KEYS.CRITERIA, criteria);
  }

  public addCriterion(critData: Omit<Criterion, 'id'>): Criterion {
    const criteria = this.getCriteria();
    const newCrit: Criterion = {
      ...critData,
      id: `crit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: critData.code.trim().toUpperCase()
    };
    this.saveCriteria([...criteria, newCrit]);
    return newCrit;
  }

  public updateCriterion(id: string, critData: Omit<Criterion, 'id'>): Criterion | null {
    const criteria = this.getCriteria();
    const index = criteria.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated: Criterion = {
      ...critData,
      id,
      code: critData.code.trim().toUpperCase()
    };
    criteria[index] = updated;
    this.saveCriteria(criteria);
    return updated;
  }

  /**
   * Delete criterion with automatic CASCADE removal from profiles and evaluations.
   * This guarantees that any parameter can be deleted cleanly without blocking errors!
   */
  public deleteCriterion(id: string): { success: boolean; affectedProfiles: number; affectedEvaluations: number } {
    const criteria = this.getCriteria();
    const target = criteria.find(c => c.id === id);
    if (!target) return { success: false, affectedProfiles: 0, affectedEvaluations: 0 };

    // 1. Remove from criteria bank
    const updatedCriteria = criteria.filter(c => c.id !== id);
    this.saveCriteria(updatedCriteria);

    // 2. Cascade remove from all job profiles
    const profiles = this.getProfiles();
    let affectedProfiles = 0;
    const updatedProfiles = profiles.map(profile => {
      const hasItem = profile.items.some(item => item.cid === id);
      if (hasItem) {
        affectedProfiles++;
        const filteredItems = profile.items.filter(item => item.cid !== id);
        return {
          ...profile,
          items: filteredItems
        };
      }
      return profile;
    });
    if (affectedProfiles > 0) {
      this.saveProfiles(updatedProfiles);
    }

    // 3. Cascade remove from all evaluations
    const evals = this.getEvaluations();
    let affectedEvaluations = 0;
    const updatedEvals = evals.map(evaluation => {
      const hasScore = evaluation.scores.some(s => s.cid === id);
      if (hasScore) {
        affectedEvaluations++;
        return {
          ...evaluation,
          scores: evaluation.scores.filter(s => s.cid !== id)
        };
      }
      return evaluation;
    });
    if (affectedEvaluations > 0) {
      this.saveEvaluations(updatedEvals);
    }

    return { success: true, affectedProfiles, affectedEvaluations };
  }

  // --- JOB PROFILES ---
  public getProfiles(): JobProfile[] {
    const data = this.getItem<JobProfile[]>(STORAGE_KEYS.PROFILES, []);
    if (!data || data.length === 0) {
      this.setItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
      return SEED_PROFILES;
    }
    return data;
  }

  public saveProfiles(profiles: JobProfile[]): void {
    this.setItem(STORAGE_KEYS.PROFILES, profiles);
  }

  public addProfile(profData: Omit<JobProfile, 'id'>): JobProfile {
    const profiles = this.getProfiles();
    const newProf: JobProfile = {
      ...profData,
      id: `prof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    this.saveProfiles([...profiles, newProf]);
    return newProf;
  }

  public updateProfile(id: string, profData: Omit<JobProfile, 'id'>): JobProfile | null {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated: JobProfile = {
      ...profData,
      id
    };
    profiles[index] = updated;
    this.saveProfiles(profiles);
    return updated;
  }

  public deleteProfile(id: string): { success: boolean; error?: string } {
    const employees = this.getEmployees();
    const isAssigned = employees.some(e => e.profileId === id);
    if (isAssigned) {
      return { success: false, error: 'این رده شغلی به پرسنل منتسب است و ابتدا باید رده شغلی پرسنل تغییر کند.' };
    }

    const profiles = this.getProfiles();
    this.saveProfiles(profiles.filter(p => p.id !== id));
    return { success: true };
  }

  // --- EVALUATIONS ---
  public getEvaluations(): Evaluation[] {
    const data = this.getItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    if (!data || data.length === 0) {
      this.setItem(STORAGE_KEYS.EVALUATIONS, SEED_EVALUATIONS);
      return SEED_EVALUATIONS;
    }
    return data;
  }

  public saveEvaluations(evaluations: Evaluation[]): void {
    this.setItem(STORAGE_KEYS.EVALUATIONS, evaluations);
  }

  public getArchivedEvaluations(): Evaluation[] {
    return this.getItem<Evaluation[]>(STORAGE_KEYS.ARCHIVED_EVALUATIONS, []);
  }

  public saveArchivedEvaluations(archived: Evaluation[]): void {
    this.setItem(STORAGE_KEYS.ARCHIVED_EVALUATIONS, archived);
  }

  // --- CLOUD & CLOUDFLARE SYNC (Safe & Non-Destructive) ---
  public async initializeCloudSync(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch('/api/state', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const cloudState = await res.json();
        if (cloudState && typeof cloudState === 'object' && Object.keys(cloudState).length > 0) {
          // If localStorage is empty, seed from cloud
          for (const [key, val] of Object.entries(cloudState)) {
            if (key.startsWith('pe_') && !key.includes('session')) {
              const localVal = localStorage.getItem(key);
              if (!localVal) {
                localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
              }
            }
          }
        }
      }
    } catch {
      // Offline or static Cloudflare Pages: perfectly normal, local storage continues seamlessly
      this.isCloudAvailable = false;
    }
  }

  private triggerCloudSyncDebounced(): void {
    clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.pushStateToCloud().catch(() => {});
    }, 1200);
  }

  public syncToCloudNow(): void {
    clearTimeout(this.syncTimeout);
    this.pushStateToCloud().catch(() => {});
  }

  public async pushStateToCloud(): Promise<boolean> {
    try {
      const payload: Record<string, any> = {
        pe_employees: this.getEmployees(),
        pe_criteria: this.getCriteria(),
        pe_profiles: this.getProfiles(),
        pe_evaluations: this.getEvaluations(),
        pe_archived_evaluations: this.getArchivedEvaluations()
      };

      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- BACKUP & RESTORE ---
  public exportBackupJSON(): string {
    const backupData = {
      meta: {
        app: 'اصفهان چالاک - سامانه ارزیابی عملکرد',
        version: '4.0.0-Cloudflare',
        exportedAt: new Date().toISOString()
      },
      employees: this.getEmployees(),
      criteria: this.getCriteria(),
      profiles: this.getProfiles(),
      evaluations: this.getEvaluations(),
      archivedEvaluations: this.getArchivedEvaluations()
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'فایل پشتیبان معتبر نیست.' };
      }

      if (Array.isArray(data.employees)) this.saveEmployees(data.employees);
      if (Array.isArray(data.criteria)) this.saveCriteria(data.criteria);
      if (Array.isArray(data.profiles)) this.saveProfiles(data.profiles);
      if (Array.isArray(data.evaluations)) this.saveEvaluations(data.evaluations);
      if (Array.isArray(data.archivedEvaluations)) this.saveArchivedEvaluations(data.archivedEvaluations);

      return { success: true, message: 'اطلاعات پشتیبان با موفقیت بازیابی شد.' };
    } catch (e: any) {
      return { success: false, message: `خطا در بازخوانی فایل: ${e?.message || 'فرمت نامعتبر'}` };
    }
  }

  public resetToFactoryDefaults(): void {
    this.saveEmployees(SEED_EMPLOYEES);
    this.saveCriteria(SEED_CRITERIA);
    this.saveProfiles(SEED_PROFILES);
    this.saveEvaluations(SEED_EVALUATIONS);
    this.saveArchivedEvaluations([]);
    localStorage.removeItem(STORAGE_KEYS.USER_PASSWORDS);
  }
}

export const db = new AppDatabase();
