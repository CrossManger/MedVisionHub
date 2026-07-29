import apiClient from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/user';

export const authService = {
  /**
   * Login user and retrieve JWT token
   * POST /auth/login
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage = axiosError.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  /**
   * Register a new user account
   * POST /auth/register
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage = axiosError.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại!';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  /**
   * Get current authenticated user profile
   * GET /me
   */
  getMe: async (): Promise<{ message: string; user_id: number; username: string; role: string }> => {
    const response = await apiClient.get('/me');
    return response.data;
  },
};

export default authService;
