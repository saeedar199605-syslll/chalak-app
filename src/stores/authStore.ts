import { create } from 'zustand';
import { api } from '../lib/api/client';

export type UserRole = 'admin' | 'hr' | 'manager' | 'evaluator' | 'employee' | 'viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  workspaceId: string;
  departmentId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('chalak_token') : null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username: string, pass: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', {
      username,
      password: pass
    });

    localStorage.setItem('chalak_token', res.token);
    set({
      user: res.user,
      token: res.token,
      isAuthenticated: true,
      isLoading: false
    });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network error on logout
    }
    localStorage.removeItem('chalak_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('chalak_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const user = await api.get<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('chalak_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
