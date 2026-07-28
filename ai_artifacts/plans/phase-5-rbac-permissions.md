# Kế Hoạch Triển Khai Phase 5: RBAC & Permission Management

**Thời gian dự kiến:** ~2-3 ngày
**Mục tiêu chính:** Cấu hình hệ thống Phân quyền truy cập dựa trên vai trò (Role-Based Access Control - RBAC) chặt chẽ, đồng thời cho phép Admin dễ dàng quản lý quyền hạn của từng Role thông qua giao diện người dùng. Tích hợp tính năng Quên/Đặt lại mật khẩu.

---

## 🎯 NEW Strategy Core Rules: Zero-Conflict File Ownership
1. **Mỗi file chỉ có DUY NHẤT 1 người sửa** - Không bao giờ 2 người sửa cùng 1 file trong cùng 1 phase.
2. **Permanent File Ownership:**
   - **A sở hữu**: `cmd/main.go`, `components/layout/Sidebar.tsx`
   - **B sở hữu**: `App.tsx`, `index.css`
3. Khi B cần thêm route vào main.go, B gửi hướng dẫn cho A. Khi A cần thêm page route vào App.tsx, A gửi hướng dẫn cho B.

Labeling: **(👤 A)**, **(👤 B)**, **(👥 A + B)**

---

## 🧑💻 Phân Công Nhiệm Vụ (Zero-Conflict)

Phase 5 split: **A = RBAC Middleware Module, B = Permission Admin Module + Forgot Password Module**

### 👤 A - RBAC Middleware Module Owner:
**Backend:**
- Tạo mới: `internal/middlewares/rbac_middleware.go` (RequirePermission function: Lấy user claims từ JWT context, truy vấn bảng role_permissions để kiểm tra role hiện tại có quyền permName không. Nếu không, trả về 403 JSON.)
- Cập nhật: `cmd/main.go` - Apply RBAC middleware to ALL Phase 3 & 4 routes AND add admin group routes (A sở hữu main.go, B gửi controllers cho A wire-up)

**Frontend:**
- Cập nhật: `stores/authStore.ts` - Thêm field permissions: string[] (A sở hữu file này cho Phase 5)
- Tạo mới: `components/common/RequirePermission.tsx` (wrapper component kiểm tra trong authStore, nếu có quyền render children, không thì render null)
- Cập nhật: `components/layout/Sidebar.tsx` - Ẩn/hiện menu theo quyền (A sở hữu Sidebar)
- Cập nhật: `pages/PatientListPage.tsx` - Bọc nút Thêm/Sửa/Xóa bằng RequirePermission
- Cập nhật: `pages/ScanDetailPage.tsx` - Bọc nút Upload bằng RequirePermission

### 👤 B - Permission Admin + Forgot Password Module Owner:
**Backend:**
- Tạo mới: `internal/dto/permission_dto.go` (PermissionResponse, RoleWithPermissionsResponse, UpdateRolePermissionsRequest)
- Tạo mới: `internal/repos/role_repo.go` (FindAllWithPermissions, FindRoleByID)
- Tạo mới: `internal/repos/permission_repo.go` (FindAll, FindByIDs)
- Tạo mới: `internal/repos/role_permission_repo.go` (DeleteByRoleID, BatchCreate)
- Tạo mới: `internal/services/permission_service.go` (GetAllRoles, GetAllPermissions, UpdateRolePermissions)
- Tạo mới: `internal/controllers/permission_controller.go` (GetRoles, GetPermissions, UpdateRolePermissions)
- Cập nhật: `internal/services/auth_service.go` - Thêm ForgotPassword(), ResetPassword() (B sở hữu auth_service.go cho Phase 5)
- Cập nhật: `internal/controllers/auth_controller.go` - Thêm ForgotPasswordHandler, ResetPasswordHandler (B sở hữu)

**Frontend:**
- Tạo mới: `types/permission.ts` (Role, Permission, RoleWithPermissions)
- Tạo mới: `services/permissionService.ts` (getRoles, getPermissions, updateRolePermissions)
- Tạo mới: `pages/PermissionManagementPage.tsx` (Permission Matrix, Checkbox, Save button)
- Tạo mới: `pages/ForgotPasswordPage.tsx` (Input email, submit)
- Tạo mới: `pages/ResetPasswordPage.tsx` (Lấy token, 2 ô nhập pass)
- Cập nhật: `App.tsx` - Thêm /admin/permissions, /forgot-password, /reset-password routes (B sở hữu App.tsx)

### File Ownership Table:
| File | Owner | Action |
|------|-------|--------|
| internal/middlewares/rbac_middleware.go | 👤 A | Tạo mới |
| cmd/main.go | 👤 A | Cập nhật (RBAC + admin routes) |
| stores/authStore.ts | 👤 A | Cập nhật (thêm permissions) |
| components/common/RequirePermission.tsx | 👤 A | Tạo mới |
| components/layout/Sidebar.tsx | 👤 A | Cập nhật |
| pages/PatientListPage.tsx | 👤 A | Cập nhật (bọc RequirePermission) |
| pages/ScanDetailPage.tsx | 👤 A | Cập nhật (bọc RequirePermission) |
| internal/dto/permission_dto.go | 👤 B | Tạo mới |
| internal/repos/role_repo.go | 👤 B | Tạo mới |
| internal/repos/permission_repo.go | 👤 B | Tạo mới |
| internal/repos/role_permission_repo.go | 👤 B | Tạo mới |
| internal/services/permission_service.go | 👤 B | Tạo mới |
| internal/controllers/permission_controller.go | 👤 B | Tạo mới |
| internal/services/auth_service.go | 👤 B | Cập nhật (forgot/reset) |
| internal/controllers/auth_controller.go | 👤 B | Cập nhật (forgot/reset handlers) |
| types/permission.ts | 👤 B | Tạo mới |
| services/permissionService.ts | 👤 B | Tạo mới |
| pages/PermissionManagementPage.tsx | 👤 B | Tạo mới |
| pages/ForgotPasswordPage.tsx | 👤 B | Tạo mới |
| pages/ResetPasswordPage.tsx | 👤 B | Tạo mới |
| App.tsx | 👤 B | Cập nhật (thêm routes) |

### Assignment table:
| Người | Module | Số file sở hữu | Ước tính |
|-------|--------|----------------|----------|
| 👤 A | RBAC Middleware + UI Guards | 7 files | 1.5 ngày |
| 👤 B | Permission Admin + Forgot Password | 14 files | 1.5 ngày |
| 👥 A + B | RBAC Testing | - | 0.5 ngày |

---

## 3. Tích Hợp & Kiểm Thử (👥 A + B)

- **Test RBAC:**
  - Đăng nhập Patient: verify backend API trả về 403 khi gọi API trái phép, giao diện bị ẩn đi các nút không được cấp quyền.
- **Test Admin Matrix:**
  - Thay đổi quyền của Doctor trên Permission Management page → Verify có hiệu lực ngay ở lần đăng nhập tiếp theo.
- **Test flow Forgot/Reset Password E2E.**
- **Code Review:** Đảm bảo Zero-Conflict Rule, không ai chạm vào file của người kia.
