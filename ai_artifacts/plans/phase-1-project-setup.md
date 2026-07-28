# Phase 1: Project Setup & Boilerplate
> **Trạng thái: ✅ COMPLETED**

## Tổng quan
Giai đoạn này tập trung vào việc khởi tạo bộ khung (skeleton) cho cả Backend (Golang) và Frontend (ReactJS). Mục đích là xây dựng một nền tảng vững chắc, chuẩn hóa cấu trúc thư mục, thiết lập các thư viện cốt lõi, kết nối thành công tới Database (PostgreSQL) và đảm bảo cả hai môi trường có thể chạy local thành công mà không gặp lỗi.

## 🧑💻 Phân Công Nhiệm Vụ

| Người | Vai trò | Feature phụ trách | Ước tính |
|-------|---------|-------------------|----------|
| 👤 A | Full-stack | Backend boilerplate (Go + DB setup) | 3-4 giờ |
| 👤 B | Full-stack | Frontend boilerplate (Vite + React setup) | 3-4 giờ |
| 👥 A + B | Cả hai | Layout components, README, Git setup | 1-2 giờ |

## Mục tiêu
- **Backend:** (👤 A - BE) Chạy server Golang với framework Gin, kết nối thành công PostgreSQL qua GORM, tự động migrate các bảng dữ liệu (AutoMigrate) và nạp sẵn dữ liệu mẫu (Seed data) cho Roles & Permissions.
- **Frontend:** (👤 B - FE) Chạy dev server với Vite, ReactJS + TypeScript, tích hợp thành công TailwindCSS 4, Ant Design 6. Cấu hình React Router và hiển thị layout cơ bản (Header, Sidebar, MainContent).
- **Môi trường:** (👥 A + B) Kết nối từ Frontend gọi API sang Backend qua CORS thành công, push code lên GitHub, thiết lập README.md.

## Yêu cầu trước (Prerequisites)
- [x] (👥 A + B) Node.js >= 20 và npm/pnpm đã được cài đặt.
- [x] (👤 A - BE) Go >= 1.22 đã được cài đặt.
- [x] (👤 A - BE) PostgreSQL server đang chạy tại `localhost:5432`.
- [x] (👥 A + B) Đã thiết kế xong `db_schema.yaml` và `api_contracts.json`.

---

## Danh sách công việc chi tiết đã hoàn thành

### 1. Kiến trúc Backend (Golang + Gin + GORM)
Backend được khởi tạo theo mô hình chuẩn, chia tách các module rõ ràng:
- **Khởi tạo module:** (👤 A - BE) `go mod init app/backend`
- **Kết nối Database:** (👤 A - BE) Cấu hình thư viện `gorm.io/gorm` và `gorm.io/driver/postgres` để kết nối tới PostgreSQL thông qua DSN đọc từ file `.env`.
- **Auto Migrate & Seeder:** (👤 A - BE) Tự động tạo các bảng từ models. Nạp sẵn 3 roles: `admin`, `doctor`, `patient` và 9 permissions cơ bản.
- **API Server & Middleware:** (👤 A - BE) Cấu hình Gin router tại `cmd/main.go`, thêm middleware CORS để cho phép Frontend (Vite) truy cập. Phục vụ static files và tạo endpoint `/health` để kiểm tra trạng thái server.

#### Dependency Backend (`go.mod`)
```go
module app/backend

go 1.22

require (
	github.com/gin-contrib/cors v1.7.0
	github.com/gin-gonic/gin v1.9.1
	github.com/joho/godotenv v1.5.1
	gorm.io/driver/postgres v1.5.7
	gorm.io/gorm v1.25.7
)
```

#### Các Files Backend đã tạo và chức năng:
- (👤 A - BE) `app/backend/cmd/main.go`: Entry point của ứng dụng. Load `.env`, gọi hàm kết nối DB, thực thi AutoMigrate, Seeder, cấu hình Gin, CORS và định nghĩa routes.
- (👤 A - BE) `app/backend/internal/models/user.go`: Định nghĩa GORM model cho User.
- (👤 A - BE) `app/backend/internal/models/role.go`: Định nghĩa GORM model cho Role.
- (👤 A - BE) `app/backend/internal/models/permission.go`: Định nghĩa GORM model cho Permission.
- (👤 A - BE) `app/backend/internal/models/role_permission.go`: Bảng trung gian (Many-to-Many) giữa Role và Permission.
- (👤 A - BE) `app/backend/internal/models/patient.go`: Định nghĩa GORM model cho Patient.
- (👤 A - BE) `app/backend/internal/models/scan_session.go`: Định nghĩa GORM model cho ScanSession.
- (👤 A - BE) `app/backend/internal/models/image.go`: Định nghĩa GORM model cho Image.
- (👤 A - BE) `app/backend/internal/models/notification.go`: Định nghĩa GORM model cho Notification.
- (👤 A - BE) `app/backend/pkg/config/config.go`: Đọc và load các biến môi trường từ file `.env`.
- (👤 A - BE) `app/backend/pkg/database/db.go`: Hàm khởi tạo kết nối PostgreSQL trả về `*gorm.DB`.
- (👤 A - BE) `app/backend/pkg/database/migrate.go`: Hàm gọi `db.AutoMigrate()` với tất cả 8 models.
- (👤 A - BE) `app/backend/pkg/database/seed.go`: Hàm tự động insert các Role và Permission mặc định nếu bảng trống.
- (👤 A - BE) `app/backend/.env.example`: File mẫu chứa các cấu hình như `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.

---

### 2. Kiến trúc Frontend (ReactJS + Vite + TailwindCSS + Ant Design)
Frontend được thiết lập để mang lại trải nghiệm phát triển nhanh với Vite và giao diện đồng nhất với Ant Design kết hợp TailwindCSS.
- **Khởi tạo Vite:** (👤 B - FE) `npm create vite@latest app/frontend -- --template react-ts`
- **Giao diện & UI Framework:** (👤 B - FE) Cài đặt `tailwindcss` (v4), `@ant-design/v5-patch-for-react-19` hoặc phiên bản AntD tương thích React 19.
- **Quản lý State & API:** (👤 B - FE) Cài đặt `zustand` (v5) để quản lý global state, `axios` cho việc call API.
- **Cấu trúc Layout:** (👥 A + B) Xây dựng layout dashboard chuyên nghiệp với Sidebar (Navigation) và Header (User Profile).

#### Dependency Frontend (`package.json`)
```json
{
  "dependencies": {
    "antd": "^6.0.0",
    "axios": "^1.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0"
  }
}
```

#### Các Files Frontend đã tạo và chức năng:
- (👤 B - FE) `app/frontend/src/main.tsx`: Entry point React, bọc `BrowserRouter`.
- (👤 B - FE) `app/frontend/src/index.css`: Cấu hình import TailwindCSS (`@tailwind base; @tailwind components; @tailwind utilities;`).
- (👤 B - FE) `app/frontend/src/App.tsx`: Cấu hình các Routes (`/`, `/login`, `/register`, `/dashboard`, `*`).
- (👥 A + B) `app/frontend/src/components/layout/MainLayout.tsx`: Component layout cha bọc Header, Sidebar và thẻ `<Outlet />`.
- (👥 A + B) `app/frontend/src/components/layout/Header.tsx`: Thanh điều hướng phía trên, chứa logo, tên ứng dụng và khu vực hiển thị User / nút Đăng xuất.
- (👥 A + B) `app/frontend/src/components/layout/Sidebar.tsx`: Menu bên trái với các mục điều hướng (Dashboard, Patients, Scans...).
- (👤 B - FE) `app/frontend/src/pages/DashboardPage.tsx`: Trang chính sau khi đăng nhập thành công.
- (👤 B - FE) `app/frontend/src/pages/LoginPage.tsx`: Giao diện trang Đăng nhập (UI mock sẵn).
- (👤 B - FE) `app/frontend/src/pages/RegisterPage.tsx`: Giao diện trang Đăng ký (UI mock sẵn).
- (👤 B - FE) `app/frontend/src/pages/NotFoundPage.tsx`: Trang lỗi 404 (Không tìm thấy).
- (👤 B - FE) `app/frontend/src/services/api.ts`: Khởi tạo instance của Axios, thiết lập `baseURL` và `interceptors` (sẽ gắn JWT ở Phase 2).
- (👤 B - FE) `app/frontend/src/services/authService.ts`: Chứa các hàm gọi API mock cho đăng nhập, đăng ký.
- (👤 B - FE) `app/frontend/src/stores/authStore.ts`: Zustand store quản lý state `user`, `token`, `isAuthenticated`, và các hàm `login()`, `logout()`.
- (👤 B - FE) `app/frontend/src/types/user.ts`: Định nghĩa interface `User` và `LoginResponse`.

---

## Tiêu chí hoàn thành (Acceptance Criteria) & Xác minh

**1. Database Verification:**
- [x] (👤 A - BE) Khi chạy backend `go run cmd/main.go`, log hiển thị kết nối DB thành công.
- [x] (👤 A - BE) Log GORM hiển thị các lệnh `CREATE TABLE` được thực thi cho 8 bảng.
- [x] (👤 A - BE) Log báo hiệu Seeder đã insert thành công dữ liệu vào bảng `roles` (admin, doctor, patient) và `permissions`.

**2. Backend API Verification:**
- [x] (👤 A - BE) Truy cập `http://localhost:8080/health` trả về JSON `{"status": "ok"}`.
- [x] (👤 A - BE) Các thư mục code được phân chia đúng the nguyên tắc Clean Architecture / MVC cơ bản.

**3. Frontend Dev Server Verification:**
- [x] (👤 B - FE) Chạy `npm run dev` không báo lỗi, mở được `http://localhost:5173`.
- [x] (👤 B - FE) Truy cập Route `/` tự chuyển hướng đúng đắn.
- [x] (👤 B - FE) Truy cập Route `/login` hiển thị Form đăng nhập của Ant Design.
- [x] (👤 B - FE) Truy cập Route `/dashboard` hiển thị được Header, Sidebar, và Main Content. Tailwind classes hoạt động chính xác (màu sắc, spacing).
- [x] (👥 A + B) File `api.ts` có thể ping thử đến endpoint `/health` của backend mà không bị lỗi CORS.

## Kết luận Phase 1
Hệ thống MedVisionHub đã có bộ khung vững chắc hoàn chỉnh. Frontend đã có Store (Zustand), API client (Axios), Routing và UI framework (AntD + TailwindCSS). Backend đã sẵn sàng ORM (GORM), Router (Gin) và các models cần thiết.
**Sẵn sàng tiến vào Phase 2: Authentication.**
