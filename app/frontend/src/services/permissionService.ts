import apiClient from './api';
import type { Permission, RoleWithPermissions, ForgotPasswordRequest, ResetPasswordRequest } from '../types/permission';

export const permissionService = {
  /**
   * Get list of roles with permissions
   * GET /admin/roles
   */
  getRoles: async (): Promise<RoleWithPermissions[]> => {
    const response = await apiClient.get<{ data: RoleWithPermissions[] }>('/admin/roles');
    return response.data.data;
  },

  /**
   * Get list of all permissions
   * GET /admin/permissions
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get<{ data: Permission[] }>('/admin/permissions');
    return response.data.data;
  },

  /**
   * Update permissions for a specific role
   * PUT /admin/roles/:role_id/permissions
   */
  updateRolePermissions: async (roleId: number, permissionIds: number[]): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/admin/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    });
    return response.data;
  },

  /**
   * Request password reset link
   * POST /auth/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};

export default permissionService;
