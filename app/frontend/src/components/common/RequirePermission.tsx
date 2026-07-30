import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RequirePermission Component
 * Conditionally renders children if the authenticated user possesses the required permission.
 * Otherwise, renders fallback (or null by default).
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RequirePermission;
