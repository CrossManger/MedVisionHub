import apiClient from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/user';

export const authService = {
  /**
   * Login user and retrieve JWT token
   * POST /auth/login
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Register a new user account
   * POST /auth/register
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },
};

export default authService;
