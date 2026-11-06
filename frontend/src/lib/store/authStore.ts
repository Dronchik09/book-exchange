import { create } from 'zustand';
import { User } from '@/types';
import { getMe } from '@/lib/api/clientApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user, isInitialized: true });
  },

  updateUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null, isInitialized: true });
  },

  initializeAuth: async () => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken) {
      set({ token: null, user: null, isInitialized: true });
      return;
    }

    if (storedUser) {
      try {
        set({ token: storedToken, user: JSON.parse(storedUser) });
      } catch {
        // ignore parse error
      }
    }

    try {
      const freshUser = await getMe();
      localStorage.setItem('user', JSON.stringify(freshUser));
      set({ token: storedToken, user: freshUser, isInitialized: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isInitialized: true });
    }
  },
}));

