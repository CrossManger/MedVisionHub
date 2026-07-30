import React, { useEffect, useState } from 'react';
import permissionService from '../services/permissionService';
import type { RoleWithPermissions, Permission } from '../types/permission';

const PermissionManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local state map: roleId -> Set of selected permission IDs
  const [matrixState, setMatrixState] = useState<Record<number, Set<number>>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permsData] = await Promise.all([
        permissionService.getRoles(),
        permissionService.getPermissions(),
      ]);

      setRoles(rolesData);
      setPermissions(permsData);

      // Initialize matrix state
      const initialMap: Record<number, Set<number>> = {};
      rolesData.forEach((role) => {
        const permSet = new Set<number>();
        role.permissions.forEach((p) => permSet.add(p.id));
        initialMap[role.id] = permSet;
      });
      setMatrixState(initialMap);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Lỗi không xác định khi tải dữ liệu phân quyền.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = (roleId: number, permId: number) => {
    setMatrixState((prev) => {
      const rolePerms = new Set(prev[roleId] || []);
      if (rolePerms.has(permId)) {
        rolePerms.delete(permId);
      } else {
        rolePerms.add(permId);
      }
      return {
        ...prev,
        [roleId]: rolePerms,
      };
    });
  };

  const handleSaveRole = async (roleId: number) => {
    try {
      setSavingRoleId(roleId);
      setError(null);
      setSuccessMsg(null);
      const selectedIds = Array.from(matrixState[roleId] || []);
      await permissionService.updateRolePermissions(roleId, selectedIds);
      setSuccessMsg(`Cập nhật quyền hạn cho vai trò thành công!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Cập nhật quyền hạn thất bại.');
      }
    } finally {
      setSavingRoleId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-medium">Đang tải danh sách phân quyền...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Phân Quyền (RBAC)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập danh sách quyền hạn chi tiết cho từng vai trò trong hệ thống
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 text-sm font-semibold text-gray-700 min-w-[240px]">
                Quyền hạn / Vai trò
              </th>
              {roles.map((role) => (
                <th key={role.id} className="py-4 px-6 text-sm font-semibold text-gray-700 text-center min-w-[140px]">
                  <div>
                    <span className="capitalize font-bold text-indigo-600">{role.name}</span>
                    <div className="text-xs text-gray-400 font-normal mt-0.5">{role.description}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3.5 px-6">
                  <div className="font-mono text-xs font-semibold text-gray-800">{perm.name}</div>
                  <div className="text-xs text-gray-500">{perm.description || 'Không có mô tả'}</div>
                </td>
                {roles.map((role) => {
                  const isChecked = matrixState[role.id]?.has(perm.id) || false;
                  return (
                    <td key={role.id} className="py-3.5 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(role.id, perm.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="py-4 px-6 font-semibold text-gray-700">Hành động</td>
              {roles.map((role) => (
                <td key={role.id} className="py-4 px-6 text-center">
                  <button
                    onClick={() => handleSaveRole(role.id)}
                    disabled={savingRoleId === role.id}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                  >
                    {savingRoleId === role.id ? 'Đang lưu...' : 'Lưu lại'}
                  </button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PermissionManagementPage;
