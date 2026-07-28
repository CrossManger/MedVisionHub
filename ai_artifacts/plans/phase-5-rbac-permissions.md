# Kế Hoạch Triển Khai Phase 5: RBAC & Permission Management

**Thời gian dự kiến:** ~2-3 ngày
**Mục tiêu chính:** Cấu hình hệ thống Phân quyền truy cập dựa trên vai trò (Role-Based Access Control - RBAC) chặt chẽ, đồng thời cho phép Admin dễ dàng quản lý quyền hạn của từng Role thông qua giao diện người dùng. Tích hợp tính năng Quên/Đặt lại mật khẩu.

---

## 🧑💻 Phân Công Nhiệm Vụ (Feature-based: Full-stack)

Cả A và B đều là full-stack developers. Mỗi người đảm nhận toàn bộ MỘT TÍNH NĂNG bao gồm cả backend API và frontend UI.

| Người | Feature | Backend tasks | Frontend tasks | Ước tính |
|-------|---------|---------------|----------------|----------|
| 👤 A | RBAC Middleware + UI Guards | rbac_middleware.go, apply to all Phase 3&4 routes | authStore permissions, RequirePermission component, Sidebar conditional, hide/show buttons | 1.5 ngày |
| 👤 B | Permission Management + Forgot/Reset Password | role_repo, permission_repo, role_permission_repo, permission_service, permission_controller, admin routes, ForgotPassword/ResetPassword in auth service | PermissionManagementPage.tsx, ForgotPasswordPage.tsx, ResetPasswordPage.tsx, permissionService.ts, types/permission.ts | 1.5 ngày |
| 👥 A + B | RBAC Testing & Integration | - | - | 0.5 ngày |

---

## 1. Tính Năng 1: RBAC Middleware & Permission-aware UI (👤 A)

**Người đảm nhận: 👤 A (Full-stack)**

### Backend Tasks (👤 A - BE)
- **Tạo Middleware RBAC (`internal/middlewares/rbac_middleware.go`):**
  - Hàm `RequirePermission(permName string) gin.HandlerFunc`.
  - Logic: Lấy user claims từ JWT context, truy vấn bảng `role_permissions` để kiểm tra role hiện tại có quyền `permName` không. Nếu không, trả về 403 JSON.
- **Áp dụng Middleware vào toàn bộ Route Phase 3 & 4:**
  - `GET /patients` → yêu cầu `can_view_patient`
  - `POST /patients` → yêu cầu `can_create_patient`
  - `PUT /patients/:id` → yêu cầu `can_edit_patient`
  - `DELETE /patients/:id` → yêu cầu `can_delete_patient`
  - `POST /patients/:patient_id/scans` → yêu cầu `can_create_scan`
  - `POST /scans/:scan_id/images` → yêu cầu `can_upload_image`
  - `GET /scans/:scan_id/images` → yêu cầu `can_view_image`

### Frontend Tasks (👤 A - FE)
- **Cập nhật `authStore.ts`:**
  - Lưu `permissions: string[]` lấy từ response khi login.
- **Tạo UI Component `RequirePermission`:**
  - Component nhận prop `permission`. Component sẽ kiểm tra trong `authStore`, nếu có quyền thì render `children`, không thì render `null` hoặc giao diện dự phòng.
- **Áp dụng UI Guards trên toàn bộ ứng dụng:**
  - Bọc các nút "Thêm bệnh nhân", "Upload ảnh", "Tạo ca chụp", các nút Sửa/Xóa trong danh sách bệnh nhân.
- **Cập nhật `Sidebar.tsx` (Conditional Rendering):**
  - Chỉ hiển thị menu dựa trên quyền (Admin thấy toàn bộ, Doctor thấy Patients, Patient chỉ thấy Dashboard).

---

## 2. Tính Năng 2: Permission Management & Forgot/Reset Password (👤 B)

**Người đảm nhận: 👤 B (Full-stack)**

### Backend Tasks (👤 B - BE)
- **Data Transfer Objects (`internal/dto/permission_dto.go`):**
  - Định nghĩa `PermissionResponse`, `RoleWithPermissionsResponse`, `UpdateRolePermissionsRequest` (chứa array `permission_ids`).
- **Repositories & Services:**
  - `internal/repos/role_repo.go`: `FindAllWithPermissions` (sử dụng GORM Preload), `FindRoleByID`.
  - `internal/repos/permission_repo.go`: `FindAll`, `FindByIDs`.
  - `internal/repos/role_permission_repo.go`: `DeleteByRoleID`, `BatchCreate` (trong transaction).
  - `internal/services/permission_service.go`: `GetAllRoles`, `GetAllPermissions`, `UpdateRolePermissions` (thực hiện DELETE cũ → INSERT mới trong DB transaction).
- **Controllers & Routes:**
  - `internal/controllers/permission_controller.go`: Các handler `GetRoles`, `GetPermissions`, `UpdateRolePermissions`.
  - Đăng ký group `/api/v1/admin` với JWT middleware và RBAC `can_manage_permissions`.
- **Flow Quên/Đặt lại mật khẩu (`auth_service.go` & `auth_controller.go`):**
  - `ForgotPassword`: Tạo crypto random token, lưu trong bộ nhớ map (hoặc Redis) với TTL 15 phút, log URL reset ra console.
  - `ResetPassword`: Kiểm tra token hết hạn, mã hóa (bcrypt) mật khẩu mới, cập nhật user, xóa token.
  - Thêm Routes: `POST /auth/forgot-password` và `POST /auth/reset-password`.

### Frontend Tasks (👤 B - FE)
- **Types & Services:**
  - `types/permission.ts`: Các interface `Role`, `Permission`, `RoleWithPermissions`.
  - `services/permissionService.ts`: Các hàm API `getRoles`, `getPermissions`, `updateRolePermissions`.
- **Trang Permission Management (`pages/PermissionManagementPage.tsx`):**
  - Hiển thị Permission Matrix dạng Bảng Ant Design (Rows: Permissions, Columns: Roles).
  - Mỗi ô là một Checkbox Ant Design.
  - Lưu trạng thái cục bộ (local state).
  - Nút "Lưu Thay Đổi": Gọi API update cho các role đã thay đổi, hiện toast success/error.
- **Flow Quên/Đặt lại mật khẩu:**
  - `pages/ForgotPasswordPage.tsx`: Input email, nút submit, gọi API và hiện thông báo.
  - `pages/ResetPasswordPage.tsx`: Lấy token từ URL param, 2 ô nhập mật khẩu mới, xác nhận, gọi API, redirect về trang login khi thành công.
- **Cập nhật `App.tsx` Routes:**
  - Thêm protected route `/admin/permissions` (chỉ dành cho admin).
  - Thêm public routes `/forgot-password` và `/reset-password`.

---

## 3. Tích Hợp & Kiểm Thử (👥 A + B)

- **Test RBAC:**
  - Đăng nhập Patient: verify backend API trả về 403 khi gọi API trái phép, giao diện bị ẩn đi các nút không được cấp quyền.
- **Test Admin Matrix:**
  - Thay đổi quyền của Doctor trên Permission Management page → Verify có hiệu lực ngay ở lần đăng nhập tiếp theo.
- **Test flow Forgot/Reset Password E2E.**
- **Code Review:** Đảm bảo chất lượng mã nguồn chéo giữa 2 tính năng.
