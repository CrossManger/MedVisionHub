# Danh sách API Routes (API Routes Skeletons)

Tài liệu này liệt kê các nhóm API routes trong hệ thống backend, kèm theo quyền hạn yêu cầu và phân bổ giai đoạn.

## 1. Authentication (`/api/v1/auth/*`)
- **Trách nhiệm:** Quản lý đăng nhập, đăng ký và tokens.
- **Giai đoạn:** Phase 2
- **Endpoints:**
  - `POST /register` - Đăng ký tài khoản (Guest)
  - `POST /login` - Đăng nhập nhận JWT (Guest)
  - `POST /refresh` - Cấp lại Access Token (Guest, cần Refresh token)
  - `POST /logout` - Đăng xuất (Tất cả Roles)

## 2. Patient Management (`/api/v1/patients/*`)
- **Trách nhiệm:** Quản lý hồ sơ bệnh nhân.
- **Giai đoạn:** Phase 3
- **Endpoints:**
  - `GET /` - Lấy danh sách bệnh nhân (Doctor, Nurse, Admin)
  - `POST /` - Thêm bệnh nhân mới (Doctor, Nurse, Admin)
  - `GET /:id` - Xem chi tiết bệnh nhân (Doctor, Nurse, Admin)
  - `PUT /:id` - Cập nhật thông tin (Doctor, Nurse, Admin)
  - `DELETE /:id` - Xóa hồ sơ (Admin)

## 3. Scan Sessions (`/api/v1/patients/:id/scans/*`)
- **Trách nhiệm:** Quản lý các ca chụp y khoa của từng bệnh nhân.
- **Giai đoạn:** Phase 4
- **Endpoints:**
  - `GET /` - Lấy lịch sử ca chụp của bệnh nhân (Doctor, Nurse, Admin)
  - `POST /` - Tạo ca chụp mới (Doctor, Admin)
  - `GET /:scan_id` - Xem chi tiết ca chụp (Doctor, Admin)

## 4. Image Management (`/api/v1/scans/:id/images/*`)
- **Trách nhiệm:** Upload và truy xuất hình ảnh (DICOM, JPG, PNG) của ca chụp.
- **Giai đoạn:** Phase 4
- **Endpoints:**
  - `GET /` - Lấy danh sách hình ảnh của ca chụp (Doctor, Admin)
  - `POST /` - Upload hình ảnh (Multipart Form) (Doctor, Admin)
  - `DELETE /:image_id` - Xóa hình ảnh (Doctor, Admin)

## 5. Permission Management (`/api/v1/admin/*`)
- **Trách nhiệm:** Quản lý Users, Roles và Permissions.
- **Giai đoạn:** Phase 5
- **Endpoints:**
  - `GET /users` - Lấy danh sách tài khoản hệ thống (Admin)
  - `PUT /users/:id/role` - Cập nhật Role cho user (Admin)
  - `GET /roles` - Lấy danh sách Roles (Admin)

## 6. Notifications (`/api/v1/notifications/*`)
- **Trách nhiệm:** Lấy lịch sử thông báo của người dùng.
- **Giai đoạn:** Phase 6
- **Endpoints:**
  - `GET /` - Lấy danh sách thông báo cá nhân (Tất cả Roles)
  - `PUT /:id/read` - Đánh dấu đã đọc (Tất cả Roles)

## 7. WebSocket (`/ws/notifications`)
- **Trách nhiệm:** Kết nối realtime để đẩy thông báo.
- **Giai đoạn:** Phase 6
- **Endpoints:**
  - `GET /ws/notifications` - Nâng cấp kết nối HTTP lên WebSocket (Tất cả Roles)
