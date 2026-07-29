# 🔑 Danh Sách Tài Khoản Mẫu Test Hệ Thống (Demo Accounts)

Hệ thống **MedVision Hub** đã được tích hợp tính năng **Auto-Seed**, tự động khởi tạo 3 tài khoản mặc định đại diện cho 3 vai trò (Roles) trong hệ thống ngay khi Backend khởi chạy.

Tất cả các lập trình viên (Developer A, Developer B) và AI Agent có thể sử dụng 3 tài khoản này để test mượt mà các tính năng trên giao diện Web mà không cần phải tự đăng ký thủ công.

---

## 📋 Danh Sách Tài Khoản Mẫu

> 🔑 **Mật khẩu dùng chung cho tất cả tài khoản mẫu:** `123456`

| Vai trò (Role) | Tên đăng nhập (`username`) | Email mẫu | Mật khẩu (`password`) | Họ và tên | Quyền hạn chính (Permissions) | Mục đích Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin@medvision.com` | `123456` | Quản Trị Viên Hệ Thống | Tất cả 9 quyền (Quyền cao nhất: Quản lý phân quyền, Quản lý tài khoản, Bệnh nhân, Ca chụp) | Test các trang Quản trị, Phân quyền Role/Permission, CRUD Bệnh nhân & Ca chụp. |
| **Bác sĩ (Doctor)** | `doctor` | `doctor@medvision.com` | `123456` | BS. Nguyễn Văn Khám | Xem/Tạo/Sửa Bệnh nhân, Tạo ca chụp, Upload & Xem ảnh y tế. | Test luồng Nghiệp vụ khám chữa bệnh chính (Phase 3 & Phase 4). |
| **Bệnh nhân (Patient)** | `patient` | `patient@medvision.com` | `123456` | Trần Văn Bệnh Nhân | Chỉ được xem hình ảnh y tế cá nhân. | Test phân quyền giao diện (UI Guard), kiểm tra Ẩn/Hiện nút thao tác theo quyền. |

---

## 🚀 Hướng Dẫn Sử Dụng Để Test

1. **Khởi chạy Backend (Auto-Seed tự động hoạt động):**
   ```bash
   cd app/backend
   go run cmd/main.go
   ```
   *Console sẽ in dòng thông báo tự động nạp dữ liệu:*
   ```text
   Seeding database...
   Seeding completed.
   ```

2. **Khởi chạy Frontend:**
   ```bash
   cd app/frontend
   npm run dev
   ```
   Truy cập địa chỉ: `http://localhost:5173/login`.

3. **Đăng nhập thử nghiệm:**
   - **Test vai trò Bác sĩ (`doctor` / `123456`):** Kiểm tra giao diện Quản lý Bệnh nhân, Thêm Bệnh nhân mới, Tạo Ca chụp mới.
   - **Test vai trò Admin (`admin` / `123456`):** Kiểm tra toàn bộ quyền hạn cao nhất trên hệ thống.
   - **Test vai trò Bệnh nhân (`patient` / `123456`):** Kiểm tra giao diện xem kết quả, xác minh các nút Tạo/Sửa/Xóa bị ẩn đúng theo phân quyền.
