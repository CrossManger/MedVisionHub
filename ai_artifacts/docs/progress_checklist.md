# Bảng Theo Dõi Tiến Độ (Progress Checklist)

Danh sách kiểm tra tiến độ toàn diện cho 6 giai đoạn phát triển của dự án MedVision Hub.

## Phase 1: Project Setup (Khởi tạo Dự án) - Tiến độ: 100%
- [x] **Backend:** Khởi tạo dự án Golang
- [x] **Backend:** Định nghĩa các Models cơ bản
- [x] **Backend:** Thiết lập kết nối Database (PostgreSQL)
- [x] **Backend:** Tích hợp GORM AutoMigrate
- [x] **Backend:** Viết Script Seeding dữ liệu mẫu cơ bản
- [x] **Frontend:** Khởi tạo dự án ReactJS + Vite + TypeScript
- [x] **Frontend:** Tích hợp TailwindCSS
- [x] **Frontend:** Tích hợp Ant Design
- [x] **Frontend:** Thiết lập cấu trúc Layout cơ bản (Header, Sidebar)
- [x] **Frontend:** Cấu hình React Router

## Phase 2: Authentication (Xác thực) - Tiến độ: 0%
- [ ] **Backend:** Tạo Auth Controller, Service, Repo
- [ ] **Backend:** Xử lý mã hóa mật khẩu (Bcrypt)
- [ ] **Backend:** Tạo JWT Token (Access & Refresh)
- [ ] **Backend:** Xây dựng middleware xác thực JWT
- [ ] **Frontend:** Dựng giao diện trang Đăng nhập (Login)
- [ ] **Frontend:** Dựng giao diện trang Đăng ký (Register)
- [ ] **Frontend:** Tích hợp Zustand store để quản lý Auth State
- [ ] **Frontend:** Viết API service gọi Auth endpoints

## Phase 3: Patient CRUD (Quản lý Bệnh nhân) - Tiến độ: 0%
- [ ] **Backend:** Tạo APIs thêm, sửa, xóa, lấy danh sách bệnh nhân
- [ ] **Backend:** Phân trang và tìm kiếm bệnh nhân
- [ ] **Frontend:** Giao diện trang Danh sách bệnh nhân (Data table)
- [ ] **Frontend:** Giao diện Thêm mới/Chỉnh sửa thông tin bệnh nhân
- [ ] **Frontend:** Giao diện Chi tiết bệnh nhân

## Phase 4: Scan & Image Upload (Ca chụp & Tải Ảnh) - Tiến độ: 0%
- [ ] **Backend:** APIs quản lý ca chụp (Scan sessions)
- [ ] **Backend:** Xử lý file upload cho hình ảnh (Images)
- [ ] **Backend:** Lưu trữ metadata hình ảnh vào DB
- [ ] **Frontend:** Giao diện tạo và quản lý ca chụp
- [ ] **Frontend:** Upload component hỗ trợ kéo thả, hiển thị tiến độ
- [ ] **Frontend:** Tích hợp DICOM/Image viewer cơ bản (hiển thị ảnh)

## Phase 5: RBAC & Permissions (Phân quyền truy cập) - Tiến độ: 0%
- [ ] **Backend:** Xây dựng APIs quản lý Roles & Permissions
- [ ] **Backend:** Tạo middleware kiểm tra quyền truy cập route
- [ ] **Frontend:** Giao diện quản lý phân quyền (Cho Admin)
- [ ] **Frontend:** Cơ chế ẩn/hiện menu, nút bấm dựa trên Roles

## Phase 6: Realtime Notifications (Thông báo thời gian thực) - Tiến độ: 0%
- [ ] **Backend:** Thiết lập server WebSocket
- [ ] **Backend:** Quản lý danh sách client kết nối và gửi tin nhắn
- [ ] **Frontend:** Tích hợp WebSocket client
- [ ] **Frontend:** Giao diện hiển thị Notification Toast/Bells
- [ ] **Frontend:** Lịch sử thông báo
