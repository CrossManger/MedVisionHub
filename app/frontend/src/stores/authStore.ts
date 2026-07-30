import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types/user';
import { authService } from '../services/authService';

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'can_view_patient',
    'can_create_patient',
    'can_edit_patient',
    'can_delete_patient',
    'can_upload_image',
    'can_view_image',
    'can_create_scan',
    'can_manage_users',
    'can_manage_permissions',
  ],
  doctor: [
    'can_view_patient',
    'can_create_patient',
    'can_edit_patient',
    'can_upload_image',
    'can_view_image',
    'can_create_scan',
  ],
  patient: ['can_view_image'],
};

export const getPermissionsForUser = (user: User | null): string[] => {
  if (!user) return [];
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions;
  }
  const roleKey = (user.role || (user as any).role_name || '').toLowerCase();
  return DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
};

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  hasPermission: (permission: string) => boolean;
}

const getInitialUser = (): User | null => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
    }
  }
  return null;
};

const getInitialToken = (): string | null => {
  return localStorage.getItem('token');
};

const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: getInitialToken(),
  permissions: getPermissionsForUser(initialUser),
  isAuthenticated: !!getInitialToken(),
  isLoading: false,

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(data);
      const { token, user } = response;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        permissions: getPermissionsForUser(user),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      await authService.register(data);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = getInitialUser();
    if (token) {
      set({ token, user, permissions: getPermissionsForUser(user), isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, permissions: [], isAuthenticated: false });
    }
  },

  hasPermission: (permission: string) => {
    const { permissions, user } = get();
    if (!user) return false;
    const roleKey = (user.role || (user as any).role_name || '').toLowerCase();
    if (roleKey === 'admin') return true;
    return permissions.includes(permission);
  },
}));
