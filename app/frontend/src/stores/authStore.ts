import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types/user';

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
  token: null,
  isAuthenticated: false,

  login: async (data: LoginRequest) => {
    // Placeholder login logic
    console.log('Logging in with', data);
    const mockUser: User = {
      id: '1',
      username: data.username || 'admin',
      email: 'admin@medvision.com',
      fullName: 'Admin User',
      role: 'ADMIN',
    };
    const mockToken = 'mock-jwt-token-123';
    
    localStorage.setItem('token', mockToken);
    
    set({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
    });
  },

  register: async (data: RegisterRequest) => {
    // Placeholder register logic
    console.log('Registering with', data);
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
