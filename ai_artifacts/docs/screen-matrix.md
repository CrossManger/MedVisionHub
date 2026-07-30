# Ma trận Màn hình & Trang (Screen Matrix)

Bảng liệt kê toàn bộ các màn hình/trang trong ứng dụng MedVision Hub, định tuyến, phân quyền và trạng thái hoàn thành.

| Tên Màn hình (Screen Name) | Route | Giai đoạn (Phase) | Quyền truy cập (Role Access) | Mô tả chi tiết (Description) | Trạng thái (Status) |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **Login** | `/login` | Phase 2 | Guest (Tất cả) | Trang đăng nhập vào hệ thống | 🔲 Chưa làm |
| **Register** | `/register` | Phase 2 | Guest (Tất cả) | Trang tạo tài khoản mới | 🔲 Chưa làm |
| **Forgot Password** | `/forgot-password` | Phase 2 | Guest (Tất cả) | Yêu cầu khôi phục mật khẩu | 🔲 Chưa làm |
| **Reset Password** | `/reset-password` | Phase 2 | Guest (Tất cả) | Đặt lại mật khẩu mới | 🔲 Chưa làm |
| **Dashboard** | `/` | Phase 1 | Doctor, Admin | Trang chủ hiển thị tổng quan số liệu | ✅ Hoàn thành cơ bản |
| **Patient List** | `/patients` | Phase 3 | Doctor, Admin, Nurse | Danh sách bệnh nhân (có tìm kiếm, lọc) | 🔲 Chưa làm |
| **Patient Detail** | `/patients/:id` | Phase 3 | Doctor, Admin, Nurse | Xem chi tiết hồ sơ bệnh nhân, lịch sử ca chụp | 🔲 Chưa làm |
| **Scan Detail** | `/scans/:id` | Phase 4 | Doctor, Admin | Xem chi tiết ca chụp và danh sách hình ảnh | 🔲 Chưa làm |
| **Permission Management** | `/admin/permissions` | Phase 5 | Admin | Quản lý vai trò (roles) và quyền (permissions) | 🔲 Chưa làm |
| **404 Not Found** | `*` | Phase 1 | Tất cả | Trang báo lỗi không tìm thấy đường dẫn | ✅ Hoàn thành cơ bản |
