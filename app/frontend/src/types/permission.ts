export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UpdateRolePermissionsRequest {
  permission_ids: number[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}
