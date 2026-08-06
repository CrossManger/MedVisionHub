# Kế Hoạch Triển Khai Phase 5: RBAC & Permission Management

## ✅ TRẠNG THÁI: HOÀN THÀNH — 2026-07-30

**Thời gian dự kiến:** ~2-3 ngày  
**Thời gian thực tế:** ~1 ngày (bao gồm hoàn thành nhiệm vụ A & B, sửa bug, và nâng cấp bảo mật)

---

## 🎯 NEW Strategy Core Rules: Zero-Conflict File Ownership

1. **Mỗi file chỉ có DUY NHẤT 1 người sửa** - Không bao giờ 2 người sửa cùng 1 file trong cùng 1 phase.
2. **Permanent File Ownership:**
   - **A sở hữu**: `cmd/main.go`, `components/layout/Sidebar.tsx`
   - **B sở hữu**: `App.tsx`, `index.css`
3. Khi B cần thêm route vào main.go, B gửi hướng dẫn cho A. Khi A cần thêm page route vào App.tsx, A gửi hướng dẫn cho B.

Labeling: **(👤 A)**, **(👤 B)**, **(👥 A + B)**

---

## 🧑‍💻 Phân Công Nhiệm Vụ (Zero-Conflict) — ✅ ĐÃ HOÀN THÀNH 100%

Phase 5 split: **A = RBAC Middleware Module, B = Permission Admin Module + Forgot Password Module**

### 👤 A - RBAC Middleware & Patient Portal Module Owner (✅ HOÀN THÀNH):

**Backend:**
- [x] **Tạo mới:** `internal/middlewares/rbac_middleware.go` (`RequirePermission` function: Lấy user claims từ JWT context, truy vấn bảng role_permissions để kiểm tra role hiện tại có quyền permName không. Tự động bypass cho role `admin`. Nếu thiếu quyền, trả về HTTP 403 JSON.)
- [x] **Cập nhật:** `cmd/main.go` - Apply RBAC middleware to ALL Phase 3 & 4 routes AND add admin group routes (A sở hữu main.go, B gửi controllers cho A wire-up)
- [x] **Nâng cấp (Bổ sung):** `internal/repos/patient_repo.go` - Thêm `FindByUserID` để phục vụ Data Ownership Check
- [x] **Nâng cấp (Bổ sung):** `internal/services/scan_service.go` & `controllers/scan_controller.go` - Thêm `GetMyScans` và **Data Ownership Check** trong `GetScanByID` (ngăn bệnh nhân A xem ca chụp bệnh nhân B)

**Frontend:**
- [x] **Cập nhật:** `stores/authStore.ts` - Thêm field `permissions: string[]` và hàm `hasPermission`. (Fix bug đọc `user.role`)
- [x] **Tạo mới:** `components/common/RequirePermission.tsx` (wrapper component kiểm tra trong authStore, nếu có quyền render children, không thì render null)
- [x] **Cập nhật:** `components/layout/Sidebar.tsx` - Ẩn/hiện menu theo quyền. Thêm mục menu **"Hồ sơ Y tế của tôi"** (`/my-scans`)
- [x] **Cập nhật:** `pages/PatientListPage.tsx` - Bọc nút Thêm/Sửa/Xóa bằng RequirePermission
- [x] **Cập nhật:** `pages/ScanDetailPage.tsx` - Bọc nút Upload bằng RequirePermission
- [x] **Nâng cấp (Bổ sung):** `pages/MyScansPage.tsx` - Trang **Patient Portal** dành riêng cho Bệnh nhân xem ảnh y tế của chính mình

---

### 👤 B - Permission Admin + Forgot Password Module Owner (✅ HOÀN THÀNH):

**Backend:**
- [x] **Tạo mới:** `internal/dto/permission_dto.go` (`PermissionResponse`, `RoleWithPermissionsResponse`, `UpdateRolePermissionsRequest`)
- [x] **Tạo mới:** `internal/repos/role_repo.go` (`FindAllWithPermissions`, `FindRoleByID`)
- [x] **Tạo mới:** `internal/repos/permission_repo.go` (`FindAll`, `FindByIDs`)
- [x] **Tạo mới:** `internal/repos/role_permission_repo.go` (`DeleteByRoleID`, `BatchCreate`)
- [x] **Tạo mới:** `internal/services/permission_service.go` (`GetAllRoles`, `GetAllPermissions`, `UpdateRolePermissions`)
- [x] **Tạo mới:** `internal/controllers/permission_controller.go` (`GetRoles`, `GetPermissions`, `UpdateRolePermissions`)
- [x] **Cập nhật:** `internal/services/auth_service.go` - Thêm `ForgotPassword()`, `ResetPassword()` (B sở hữu auth_service.go cho Phase 5)
- [x] **Cập nhật:** `internal/controllers/auth_controller.go` - Thêm `ForgotPasswordHandler`, `ResetPasswordHandler` (B sở hữu)

**Frontend:**
- [x] **Tạo mới:** `types/permission.ts` (`Role`, `Permission`, `RoleWithPermissions`)
- [x] **Tạo mới:** `services/permissionService.ts` (`getRoles`, `getPermissions`, `updateRolePermissions`)
- [x] **Tạo mới:** `pages/PermissionManagementPage.tsx` (Permission Matrix, Checkbox, Save button)
- [x] **Tạo mới:** `pages/ForgotPasswordPage.tsx` (Input email, submit)
- [x] **Tạo mới:** `pages/ResetPasswordPage.tsx` (Lấy token, 2 ô nhập pass)
- [x] **Cập nhật:** `App.tsx` - Thêm `/admin/permissions`, `/forgot-password`, `/reset-password` routes (B sở hữu App.tsx)

---

### Bảng Kiểm Tra Quyền Sở Hữu File (File Ownership Table):

| File                                          | Owner | Action                           | Trạng thái |
| --------------------------------------------- | ----- | -------------------------------- | :--------: |
| `internal/middlewares/rbac_middleware.go`       | 👤 A  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `cmd/main.go`                                   | 👤 A  | Cập nhật (RBAC + admin routes)   |  ✅ HOÀN THÀNH  |
| `stores/authStore.ts`                           | 👤 A  | Cập nhật (thêm permissions)      |  ✅ HOÀN THÀNH  |
| `components/common/RequirePermission.tsx`       | 👤 A  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `components/layout/Sidebar.tsx`                 | 👤 A  | Cập nhật                         |  ✅ HOÀN THÀNH  |
| `pages/PatientListPage.tsx`                     | 👤 A  | Cập nhật (bọc RequirePermission) |  ✅ HOÀN THÀNH  |
| `pages/ScanDetailPage.tsx`                      | 👤 A  | Cập nhật (bọc RequirePermission) |  ✅ HOÀN THÀNH  |
| `pages/MyScansPage.tsx`                         | 👤 A  | Tạo mới (Patient Portal)         |  ✅ HOÀN THÀNH  |
| `internal/dto/permission_dto.go`                | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `internal/repos/role_repo.go`                   | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `internal/repos/permission_repo.go`             | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `internal/repos/role_permission_repo.go`        | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `internal/services/permission_service.go`       | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `internal/controllers/permission_controller.go` | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `internal/services/auth_service.go`             | 👤 B  | Cập nhật (forgot/reset)          |  ✅ HOÀN THÀNH  |
| `internal/controllers/auth_controller.go`       | 👤 B  | Cập nhật (forgot/reset handlers) |  ✅ HOÀN THÀNH  |
| `types/permission.ts`                           | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `services/permissionService.ts`                 | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `pages/PermissionManagementPage.tsx`            | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `pages/ForgotPasswordPage.tsx`                  | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `pages/ResetPasswordPage.tsx`                   | 👤 B  | Tạo mới                          |  ✅ HOÀN THÀNH  |
| `App.tsx`                                       | 👤 B  | Cập nhật (thêm routes)           |  ✅ HOÀN THÀNH  |

---

### Bảng Tổng Kết Phân Công & Tiến Độ (Assignment & Progress Table):

| Người    | Module                             | Số file sở hữu | Ước tính | Trạng thái Tiến độ |
| -------- | ---------------------------------- | -------------- | -------- | :----------------: |
| 👤 A     | RBAC Middleware + UI Guards + Portal | 8 files        | 1.5 ngày | ✅ 100% HOÀN THÀNH |
| 👤 B     | Permission Admin + Forgot Password | 14 files       | 1.5 ngày | ✅ 100% HOÀN THÀNH |
| 👥 A + B | RBAC Integration & Testing         | -              | 0.5 ngày | ✅ 100% HOÀN THÀNH |

---

## 3. Tích Hợp & Kiểm Thử (👥 A + B) — ✅ ĐÃ ĐẠT 100%

- [x] **Test RBAC:**
  - Đăng nhập Patient: verify backend API trả về 403 khi gọi API trái phép, giao diện bị ẩn đi các nút không được cấp quyền.
- [x] **Test Admin Matrix:**
  - Thay đổi quyền của Doctor trên Permission Management page → Verify có hiệu lực ngay ở lần đăng nhập tiếp theo.
- [x] **Test flow Forgot/Reset Password E2E.**
- [x] **Test Data Ownership & Patient Portal:**
  - Đăng ký Bệnh nhân mới tự động gắn hồ sơ + Bệnh nhân xem ảnh của chính mình, chặn xem lén ca chụp người khác.
- [x] **Code Review:** Đảm bảo Zero-Conflict Rule, không ai chạm vào file của người kia.
