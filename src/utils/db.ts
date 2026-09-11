type Subscriber = (key: string, data: any) => void;

class DatabaseSync {
  private subscribers: Subscriber[] = [];
  private state: Record<string, any> = {};
  private syncInterval: any = null;

  constructor() {
    this.loadLocal();
  }

  // مقداردهی اولیه و شروع همگام‌سازی با سرور هر 3 ثانیه (Polling برای نمایش آنی به همه)
  async initializeCloudSync() {
    await this.fetchFromServer();
    if (!this.syncInterval) {
      this.syncInterval = setInterval(() => this.fetchFromServer(), 3000);
    }
  }

  subscribe(callback: Subscriber) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify(key: string, data: any) {
    this.subscribers.forEach(cb => cb(key, data));
  }

  private loadLocal() {
    ['pe_criteria', 'pe_profiles', 'pe_employees', 'pe_evaluations', 'pe_archived_evaluations', 'pe_workshop_targets'].forEach(key => {
      const data = localStorage.getItem(key);
      if (data) this.state[key] = JSON.parse(data);
    });
  }

  // دریافت اطلاعات از کلادفلر
  private async fetchFromServer() {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const serverState = await res.json();
      
      let hasChanges = false;
      Object.keys(serverState).forEach(key => {
        const serverDataStr = JSON.stringify(serverState[key] || []);
        const localDataStr = JSON.stringify(this.state[key] || []);
        
        if (serverDataStr !== localDataStr) {
          this.state[key] = serverState[key];
          localStorage.setItem(key, serverDataStr);
          this.notify(key, serverState[key]);
          hasChanges = true;
        }
      });
    } catch (e) {
      console.warn('Offline mode or server unreachable. Using local state.');
    }
  }

  // ارسال تغییرات به کلادفلر
  private async pushToServer() {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state)
      });
    } catch (e) {
      console.warn('Failed to sync to cloud, data saved locally');
    }
  }

  // --- متدهای Evaluations ---
  getEvaluations() { return this.state['pe_evaluations'] || []; }
  saveEvaluations(evals: any[]) {
    this.state['pe_evaluations'] = evals;
    localStorage.setItem('pe_evaluations', JSON.stringify(evals));
    this.notify('pe_evaluations', evals);
    this.pushToServer();
  }
  getArchivedEvaluations() { return this.state['pe_archived_evaluations'] || []; }
  deleteEvaluationsBatch(ids: string[]) {
    const current = this.getEvaluations();
    const updated = current.filter((e: any) => !ids.includes(e.id));
    this.saveEvaluations(updated);
    return { deletedCount: current.length - updated.length };
  }

  // --- متدهای Employees ---
  getEmployees() { return this.state['pe_employees'] || []; }
  saveEmployees(emps: any[]) {
    this.state['pe_employees'] = emps;
    localStorage.setItem('pe_employees', JSON.stringify(emps));
    this.notify('pe_employees', emps);
    this.pushToServer();
  }
  addEmployee(emp: any) {
    const newEmp = { ...emp, id: `emp-${Date.now()}` };
    const emps = [...this.getEmployees(), newEmp];
    this.saveEmployees(emps);
    return { employee: newEmp };
  }
  updateEmployee(id: string, empData: any) {
    const emps = this.getEmployees().map((e: any) => e.id === id ? { ...e, ...empData, id } : e);
    this.saveEmployees(emps);
    return true;
  }
  deleteEmployee(id: string) {
    const current = this.getEmployees();
    const updated = current.filter((e: any) => e.id !== id);
    this.saveEmployees(updated);
    return true;
  }
  deleteEmployeesBatch(ids: string[]) {
    const current = this.getEmployees();
    const updated = current.filter((e: any) => !ids.includes(e.id));
    this.saveEmployees(updated);
    return { success: true };
  }

  // --- متدهای Criteria ---
  getCriteria() { return this.state['pe_criteria'] || []; }
  saveCriteriaBatch(criteria: any[], mode: string = 'merge') {
    this.state['pe_criteria'] = criteria;
    localStorage.setItem('pe_criteria', JSON.stringify(criteria));
    this.notify('pe_criteria', criteria);
    this.pushToServer();
  }
  addCriterion(crit: any) {
    const newCrit = { ...crit, id: `crit-${Date.now()}` };
    const crits = [...this.getCriteria(), newCrit];
    this.saveCriteriaBatch(crits);
    return true;
  }
  updateCriterion(id: string, critData: any) {
    const crits = this.getCriteria().map((c: any) => c.id === id ? { ...c, ...critData, id } : c);
    this.saveCriteriaBatch(crits);
    return true;
  }
  deleteCriterion(id: string) {
    const current = this.getCriteria();
    const updated = current.filter((c: any) => c.id !== id);
    this.saveCriteriaBatch(updated);
    return { success: true };
  }
  deleteCriteriaBatch(ids: string[]) {
    const current = this.getCriteria();
    const updated = current.filter((c: any) => !ids.includes(c.id));
    this.saveCriteriaBatch(updated);
    return { deletedCount: current.length - updated.length };
  }

  // --- متدهای Profiles ---
  getProfiles() { return this.state['pe_profiles'] || []; }
  saveProfiles(profiles: any[]) {
    this.state['pe_profiles'] = profiles;
    localStorage.setItem('pe_profiles', JSON.stringify(profiles));
    this.notify('pe_profiles', profiles);
    this.pushToServer();
  }
  addProfile(prof: any) {
    const newProf = { ...prof, id: `prof-${Date.now()}` };
    const profs = [...this.getProfiles(), newProf];
    this.saveProfiles(profs);
    return true;
  }
  updateProfile(id: string, profData: any) {
    const profs = this.getProfiles().map((p: any) => p.id === id ? { ...p, ...profData, id } : p);
    this.saveProfiles(profs);
    return true;
  }
  deleteProfile(id: string, force: boolean = false) {
    const current = this.getProfiles();
    const updated = current.filter((p: any) => p.id !== id);
    this.saveProfiles(updated);
    return { success: true };
  }
  deleteProfilesBatch(ids: string[]) {
    const current = this.getProfiles();
    const updated = current.filter((p: any) => !ids.includes(p.id));
    this.saveProfiles(updated);
    return { deletedCount: current.length - updated.length };
  }

  // --- متدهای Workshop Targets ---
  saveWorkshopTargets(targets: any[]) {
    this.state['pe_workshop_targets'] = targets;
    localStorage.setItem('pe_workshop_targets', JSON.stringify(targets));
    this.notify('pe_workshop_targets', targets);
    this.pushToServer();
  }
}

export const db = new DatabaseSync();
