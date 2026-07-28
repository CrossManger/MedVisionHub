import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types/user';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (data: LoginRequest) => {
    const res = await authService.login(data);
    localStorage.setItem('token', res.token);
    set({
      user: res.user,
      token: res.token,
      isAuthenticated: true,
    });
  },

  register: async (data: RegisterRequest) => {
    await authService.register(data);
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
