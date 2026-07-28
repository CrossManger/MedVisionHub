# Kiến trúc Module Backend (Backend Modules Skeletons)

Tài liệu này định nghĩa ranh giới và trách nhiệm của các module trong kiến trúc backend Golang của MedVision Hub. Cấu trúc tuân theo mô hình phân lớp (Layered/Clean Architecture).

## 1. `controllers/` (Xử lý HTTP Request)
- **Trách nhiệm:** Nhận HTTP request, trích xuất dữ liệu (params, query, body), gọi Services tương ứng để xử lý logic, và trả về HTTP response (JSON).
- **Quyền hạn:** Không chứa business logic trực tiếp, không truy vấn database trực tiếp.
- **Ví dụ file:** `auth_controller.go`, `patient_controller.go`

## 2. `services/` (Business Logic)
- **Trách nhiệm:** Chứa toàn bộ nghiệp vụ (business logic) của hệ thống. Nhận dữ liệu từ Controllers, kiểm tra tính hợp lệ nghiệp vụ, và tương tác với Repositories.
- **Quyền hạn:** Không biết về bối cảnh HTTP (không dùng `gin.Context` ở đây).
- **Ví dụ file:** `auth_service.go`, `patient_service.go`

## 3. `repos/` (Truy cập Database)
- **Trách nhiệm:** Giao tiếp trực tiếp với cơ sở dữ liệu (PostgreSQL) thông qua GORM. Thực hiện các thao tác CRUD.
- **Quyền hạn:** Chỉ trả về Models, không chứa logic kiểm tra nghiệp vụ phức tạp.
- **Ví dụ file:** `user_repo.go`, `patient_repo.go`

## 4. `models/` (Cấu trúc Dữ liệu - Data Structures)
- **Trách nhiệm:** Chứa các struct định nghĩa bảng trong Database (GORM models).
- **Ví dụ file:** `user.go`, `patient.go`, `scan.go`, `image.go`

## 5. `middlewares/` (Bộ lọc Trung gian)
- **Trách nhiệm:** Tiền xử lý các request trước khi vào Controllers. Xử lý bảo mật, ghi log.
- **Thành phần chính:**
  - `jwt.go`: Kiểm tra và xác thực JWT token.
  - `rbac.go`: Kiểm tra quyền truy cập dựa trên Roles (Role-Based Access Control).

## 6. `dto/` (Request/Response Objects - Data Transfer Objects)
- **Trách nhiệm:** Định nghĩa struct cho payload request (để parse và validate) và response (để ẩn đi các trường nhạy cảm trong Models).
- **Ví dụ file:** `auth_dto.go` (chứa `LoginRequest`, `LoginResponse`), `patient_dto.go`

## 7. `websocket/` (Giao tiếp Thời gian thực)
- **Trách nhiệm:** Quản lý các kết nối WebSocket, Hub phân phối tin nhắn, và broadcast thông báo đến các client.
- **Ví dụ file:** `hub.go`, `client.go`
