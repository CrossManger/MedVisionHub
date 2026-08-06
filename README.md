# 🏥 MedVision Hub

> **Nền tảng Quản lý & Cổng dữ liệu Hình ảnh Y tế**

MedVision Hub là một hệ thống web toàn diện cho phép bệnh viện và phòng khám quản lý hồ sơ bệnh nhân, lưu trữ và xem hình ảnh y tế (X-quang, MRI, CT Scan, Siêu âm), phân quyền truy cập theo vai trò (RBAC), và thông báo kết quả chẩn đoán theo thời gian thực qua WebSocket.

---

## 📋 Tính năng chính

- **Xác thực & Phân quyền (RBAC):** Đăng nhập/Đăng ký với JWT, phân quyền theo 3 vai trò (Admin, Doctor, Patient) với 9 quyền hạn chi tiết.
- **Quản lý Bệnh nhân:** Tạo, xem, sửa, xóa hồ sơ bệnh nhân (CRUD hoàn chỉnh).
- **Quản lý Ca chụp & Hình ảnh Y tế:** Tạo ca chụp (X-Ray/MRI/CT Scan/Siêu âm), upload hình ảnh y tế (JPEG/PNG/DICOM, tối đa 10MB), xem ảnh với công cụ Zoom/Rotate/Fullscreen.
- **Chẩn đoán & Hoàn tất Ca chụp:** Bác sĩ nhập kết quả chẩn đoán và hoàn tất ca chụp.
- **Thông báo Realtime:** WebSocket push notification khi bác sĩ cập nhật kết quả chẩn đoán cho bệnh nhân.
- **Dashboard Thống kê:** Hiển thị KPI tổng quan (Tổng bệnh nhân, Tổng ca chụp, Tỷ lệ hoàn thành, Phân loại ca chụp theo loại).
- **Quên / Đặt lại Mật khẩu:** Quy trình reset password qua JWT token.
- **Giao diện Role-Based:** Sidebar, Dashboard, Breadcrumb tự động thay đổi theo vai trò người dùng.
- **Responsive UI:** Hỗ trợ cả giao diện Desktop và Mobile.

---

## 🏗️ Kiến trúc Hệ thống

### Công nghệ sử dụng

| Thành phần    | Công nghệ                                                              |
| ------------- | ----------------------------------------------------------------------- |
| **Frontend**  | ReactJS 19 + TypeScript + Vite + Ant Design 6 + TailwindCSS 4 + Zustand 5 + Axios |
| **Backend**   | Golang + Gin Framework + GORM ORM                                       |
| **Database**  | PostgreSQL 16                                                           |
| **Real-time** | Gorilla WebSocket (Hub/Client pattern với Goroutines)                   |
| **Auth**      | JWT (golang-jwt v5) + bcrypt                                            |
| **Storage**   | Local Static File Serving (`uploads/`)                                  |
| **CI/CD**     | Docker + Docker Compose + Jenkins Pipeline                              |

### Sơ đồ Kiến trúc

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Trình duyệt)                        │
│                      http://localhost:3000                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Nginx Reverse Proxy │  ← Container Frontend
                    │  (React SPA + Proxy) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │ /api/*         │ /ws/*           │ /uploads/*
              ▼                ▼                 ▼
    ┌─────────────────────────────────────────────────┐
    │              Backend (Golang / Gin)              │  ← Container Backend
    │     Controller → Service → Repository (3-layer) │
    │     Middleware: CORS → JWT Auth → RBAC Permission│
    └──────────────────────┬──────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   PostgreSQL 16  │  ← Container Database
                  │  (Docker Volume) │
                  └─────────────────┘
```

---

## 📁 Cấu trúc Dự án

```text
MedVisionHub/
├── docker-compose.yml              # Điều phối 3 Container (Postgres + Backend + Frontend)
├── docker-compose.jenkins.yml      # Jenkins Server Container cho CI/CD
├── Jenkinsfile                     # Declarative Pipeline (4 Stages tự động)
├── README.md
├── summary.md
│
├── docs/                           # Tài liệu kiến trúc, ERD, luồng nghiệp vụ
│   ├── architecture.md
│   ├── database_erd.md
│   ├── demo_accounts.md
│   ├── github_workflow.md
│   └── workflows.md
│
└── app/
    ├── backend/                    # Golang Backend API
    │   ├── Dockerfile              # Multi-stage build (golang:alpine → alpine)
    │   ├── .env.example
    │   ├── go.mod / go.sum
    │   ├── cmd/main.go             # Entry point, Route definitions, DI
    │   ├── internal/
    │   │   ├── controllers/        # HTTP Handlers (auth, patient, scan, image, notification, permission)
    │   │   ├── dto/                # Data Transfer Objects (Request/Response structs)
    │   │   ├── middlewares/        # JWT Auth + RBAC Permission middleware
    │   │   ├── models/             # GORM Models (user, role, permission, patient, scan_session, image, notification)
    │   │   ├── repos/              # Database Repository layer
    │   │   ├── services/           # Business Logic layer
    │   │   └── websocket/          # WebSocket Hub/Client/Handler
    │   └── pkg/
    │       ├── config/             # Environment config loader
    │       ├── database/           # DB connection + Auto-seed
    │       └── utils/              # JWT + Password utilities
    │
    └── frontend/                   # ReactJS Frontend SPA
        ├── Dockerfile              # Multi-stage build (node:22-alpine → nginx:alpine)
        ├── nginx.conf              # Nginx Reverse Proxy config
        ├── package.json
        ├── vite.config.ts
        └── src/
            ├── App.tsx             # React Router (Routes definition)
            ├── main.tsx / index.css
            ├── components/
            │   ├── common/         # ImageGallery, ImageUpload, ImageViewer, PatientForm, ScanForm, RequirePermission
            │   └── layout/         # AppHeader, AppSidebar, MainLayout, ProtectedRoute
            ├── hooks/              # useWebSocket (realtime notifications)
            ├── pages/              # LoginPage, RegisterPage, DashboardPage, PatientListPage, PatientDetailPage,
            │                       # ScanDetailPage, MyProfilePage, MyScansPage, PermissionManagementPage, ...
            ├── services/           # Axios API services (auth, patient, scan, image, notification, permission)
            ├── stores/             # Zustand stores (authStore, notificationStore)
            └── types/              # TypeScript interfaces (user, patient, scan, image, notification, permission)
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy

### Cách 1: Chạy bằng Docker (Khuyên dùng — Không cần cài Go/Node/Postgres)

#### Yêu cầu hệ thống

- **Docker** >= 20.x
- **Docker Compose** >= 2.x

#### Các bước thực hiện

```bash
# 1. Clone repository
git clone https://github.com/CrossManger/MedVisionHub.git
cd MedVisionHub

# 2. Khởi chạy toàn bộ ứng dụng (Postgres + Backend + Frontend) chỉ bằng 1 lệnh
docker compose up -d

# 3. Kiểm tra trạng thái các Container
docker compose ps

# 4. Xem log realtime (nếu cần debug)
docker compose logs -f
```

#### Truy cập ứng dụng

| Dịch vụ       | Địa chỉ                      |
| ------------- | ----------------------------- |
| 🌐 Web App    | `http://localhost:3000`       |
| 🔧 Backend API| `http://localhost:8082`       |
| 🗄️ PostgreSQL | `localhost:5433` (User: `postgres`, Password: `postgres123`, DB: `medvisionhub`) |

#### Quản lý Container hàng ngày

```bash
# Dừng tạm thời (giải phóng RAM, giữ nguyên dữ liệu)
docker compose stop

# Khởi chạy lại
docker compose start

# Hạ toàn bộ Container (giữ dữ liệu CSDL)
docker compose down

# Hạ toàn bộ VÀ xóa sạch dữ liệu CSDL (làm lại từ đầu)
docker compose down -v
```

---

### Cách 2: Chạy thủ công trên máy Local (Dành cho Dev)

#### Yêu cầu hệ thống

- **Go** >= 1.21
- **Node.js** >= 18.x
- **PostgreSQL** >= 15
- **Git**

#### Chạy Backend

```bash
cd app/backend
cp .env.example .env        # Cấu hình database, JWT secret
go mod download
go run cmd/main.go
```

Backend sẽ chạy tại: `http://localhost:8080`

#### Chạy Frontend

```bash
cd app/frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🐋 Docker — Chi tiết Cấu hình

### Kiến trúc Docker Compose

```text
┌───────────────────────────────────────────────────────────────────┐
│                      docker-compose.yml                           │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  medvision-      │  │  medvision-       │  │  medvision-     │  │
│  │  postgres         │  │  backend          │  │  frontend       │  │
│  │  (PostgreSQL 16)  │  │  (Golang API)     │  │  (React+Nginx)  │  │
│  │  Port: 5433:5432  │  │  Port: 8082:8080  │  │  Port: 3000:80  │  │
│  └────────┬──────────┘  └────────┬─────────┘  └────────┬────────┘  │
│           │                      │                      │          │
│           └──────────────────────┴──────────────────────┘          │
│                    Docker Internal Network                         │
└───────────────────────────────────────────────────────────────────┘
```

### Dockerfile Backend (Multi-Stage Build)

- **Stage 1 (Builder):** `golang:alpine` — Biên dịch mã nguồn Go thành file thực thi `server`.
- **Stage 2 (Runtime):** `alpine:latest` (~5MB) — Chỉ copy file `server` đã biên dịch, giúp Image siêu nhẹ (~15-20MB).

### Dockerfile Frontend (Multi-Stage Build)

- **Stage 1 (Builder):** `node:22-alpine` — Cài dependencies, kiểm tra TypeScript, build Production (`dist`).
- **Stage 2 (Runtime):** `nginx:alpine` (~20MB) — Phục vụ web tĩnh + Reverse Proxy tới Backend.

### Nginx Reverse Proxy

Nginx trong Container Frontend tự động điều hướng:
- `/api/*` → `http://backend:8080/api/*` (REST API)
- `/ws/*` → `http://backend:8080/ws/*` (WebSocket)
- `/uploads/*` → `http://backend:8080/uploads/*` (File ảnh y tế)

---

## ⚙️ Jenkins CI/CD Pipeline (Local-First)

### Khởi chạy Jenkins Server

```bash
# Jenkins Server chạy tại http://localhost:8080
# Đã được cấu hình sẵn với Docker socket mount
docker start my-jenkins-server
```

### Jenkinsfile — 4 Stages tự động

| Stage | Mô tả | Môi trường cô lập |
| ----- | ------ | ------------------ |
| **1. Checkout Code** | Kéo mã nguồn từ Git repository | Jenkins built-in |
| **2. Run Backend Unit Tests** | Chạy `go test -v ./...` | Container `golang:alpine` |
| **3. Run Frontend Build & Type Check** | Chạy `npm install`, `npx tsc --noEmit`, `npm run build` | Container `node:22-alpine` |
| **4. Verify Docker Compose Build** | Chạy `docker compose build` đóng gói Images | Container `docker:cli` |

### Cấu hình Poll SCM

Jenkins tự động kiểm tra code mới mỗi 5 phút (`H/5 * * * *`) và tự động trigger build khi phát hiện commit mới.

---

## 🗄️ Database Schema (8 bảng)

| Bảng               | Mô tả                                                         |
| ------------------- | ------------------------------------------------------------- |
| `roles`             | 3 vai trò: Admin, Doctor, Patient                              |
| `permissions`       | 9 quyền hạn chi tiết (can_view_patient, can_create_scan, ...) |
| `role_permissions`  | Bảng trung gian Many-to-Many (roles ↔ permissions)            |
| `users`             | Tài khoản người dùng (username, email, password_hash, role_id)|
| `patients`          | Hồ sơ bệnh nhân (có thể liên kết tới user qua user_id)       |
| `scan_sessions`     | Ca chụp y tế (X-Ray/MRI/CT/Siêu âm), trạng thái: pending → in_progress → completed |
| `images`            | File hình ảnh y tế (JPEG/PNG/DICOM)                           |
| `notifications`     | Thông báo realtime cho bệnh nhân                              |

### Auto-Seed khi khởi động

Khi Backend khởi chạy lần đầu, hệ thống tự động tạo sẵn:
- 3 vai trò (Admin, Doctor, Patient) với 9 quyền hạn được phân bổ mặc định.
- 3 tài khoản demo để test ngay (xem mục Tài khoản Demo bên dưới).

---

## 🔑 Tài khoản Demo

| Vai trò  | Username  | Email                    | Mật khẩu  |
| -------- | --------- | ------------------------ | ---------- |
| Admin    | `admin`   | `admin@medvision.com`    | `123456`   |
| Doctor   | `doctor`  | `doctor@medvision.com`   | `123456`   |
| Patient  | `patient` | `patient@medvision.com`  | `123456`   |

---

## 📡 API Endpoints

### Xác thực (Public)

| Method | Endpoint                      | Mô tả                          |
| ------ | ----------------------------- | ------------------------------- |
| POST   | `/api/v1/auth/register`       | Đăng ký tài khoản              |
| POST   | `/api/v1/auth/login`          | Đăng nhập, trả về JWT token    |
| POST   | `/api/v1/auth/forgot-password`| Yêu cầu đặt lại mật khẩu      |
| POST   | `/api/v1/auth/reset-password` | Đặt lại mật khẩu bằng token    |

### Dashboard & Hồ sơ cá nhân (Authenticated)

| Method | Endpoint                | Mô tả                              |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/api/v1/dashboard/stats` | Thống kê tổng quan Dashboard     |
| GET    | `/api/v1/me`            | Thông tin người dùng hiện tại       |
| GET    | `/api/v1/my-patient`    | Xem hồ sơ bệnh nhân của mình       |
| PUT    | `/api/v1/my-patient`    | Cập nhật thông tin cá nhân          |
| GET    | `/api/v1/my-scans`      | Xem danh sách ca chụp của mình      |

### Quản lý Bệnh nhân (Doctor/Admin — RBAC)

| Method | Endpoint                | Quyền hạn           | Mô tả               |
| ------ | ----------------------- | -------------------- | -------------------- |
| GET    | `/api/v1/patients`      | `can_view_patient`   | Danh sách bệnh nhân |
| POST   | `/api/v1/patients`      | `can_create_patient` | Tạo hồ sơ mới       |
| GET    | `/api/v1/patients/:id`  | `can_view_patient`   | Chi tiết bệnh nhân  |
| PUT    | `/api/v1/patients/:id`  | `can_edit_patient`   | Cập nhật hồ sơ      |
| DELETE | `/api/v1/patients/:id`  | `can_delete_patient` | Xóa hồ sơ           |

### Quản lý Ca chụp & Hình ảnh

| Method | Endpoint                         | Mô tả                              |
| ------ | -------------------------------- | ----------------------------------- |
| POST   | `/api/v1/patients/:id/scans`     | Tạo ca chụp mới cho bệnh nhân      |
| GET    | `/api/v1/patients/:id/scans`     | Danh sách ca chụp theo bệnh nhân   |
| GET    | `/api/v1/scans/:id`              | Chi tiết ca chụp                    |
| PUT    | `/api/v1/scans/:id/complete`     | Hoàn tất chẩn đoán (gửi notification) |
| POST   | `/api/v1/scans/:id/images`       | Upload hình ảnh y tế                |
| GET    | `/api/v1/scans/:id/images`       | Danh sách hình ảnh theo ca chụp     |
| DELETE | `/api/v1/images/:id`             | Xóa hình ảnh                        |

### Thông báo & WebSocket

| Method | Endpoint                          | Mô tả                        |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/v1/notifications`           | Danh sách thông báo           |
| PUT    | `/api/v1/notifications/:id/read`  | Đánh dấu đã đọc              |
| WS     | `/ws/notifications`               | WebSocket realtime            |

### Quản trị Phân quyền (Admin)

| Method | Endpoint                                    | Mô tả                         |
| ------ | ------------------------------------------- | ------------------------------ |
| GET    | `/api/v1/admin/roles`                       | Danh sách vai trò              |
| GET    | `/api/v1/admin/permissions`                 | Danh sách quyền hạn            |
| PUT    | `/api/v1/admin/roles/:role_id/permissions`  | Cập nhật quyền cho vai trò     |

---

## 🧪 Kiểm thử

### Backend Unit Tests

```bash
cd app/backend
go test -v ./...
```

Các bài test hiện có:
- `TestGenerateAndValidateToken` — Kiểm tra tạo và xác thực JWT token.
- `TestHashPasswordAndCheckPassword` — Kiểm tra mã hóa và so khớp mật khẩu bcrypt.

### Frontend Type Check & Build

```bash
cd app/frontend
npx tsc --noEmit       # Kiểm tra lỗi kiểu TypeScript
npm run build           # Build production bundle
```

---

## 🎨 Thiết kế Giao diện

- **Design Concept:** Clinical Hospital Theme — Tông màu chính `#0c5da5`, nền `#f0f4f8`, navy `#0a1628`.
- **UI Framework:** Ant Design 6 + TailwindCSS 4.
- **Typography:** Clean, tối giản, card-based layout.
- **Responsive:** Hỗ trợ cả Desktop và Mobile.
- **Role-Based UI:** Giao diện Sidebar, Dashboard, Breadcrumb tự động thay đổi tùy theo vai trò người dùng (Admin/Doctor/Patient).

---

## 📅 Lộ trình Phát triển

| Phase | Mô tả                                    | Trạng thái        |
| ----- | ----------------------------------------- | ------------------ |
| 1     | Project Setup & Boilerplate               | ✅ Hoàn thành      |
| 2     | Authentication (Đăng nhập / Đăng ký)      | ✅ Hoàn thành      |
| 3     | Patient Management CRUD                   | ✅ Hoàn thành      |
| 4     | Scan Sessions & Image Upload              | ✅ Hoàn thành      |
| 5     | RBAC & Permission Management              | ✅ Hoàn thành      |
| 6     | Realtime Notifications & Polish           | ✅ Hoàn thành      |
| 7     | Dockerize Application                     | ✅ Hoàn thành      |
| 8     | Jenkins Local CI/CD Pipeline              | ✅ Hoàn thành      |

---

## 🔧 Biến Môi Trường (`.env.example`)

```env
# Server
APP_PORT=8080
APP_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=medvision_hub

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY_HOURS=24

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/dicom

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 👥 Thành viên

| Vai trò      | Thành viên                |
| ------------ | ------------------------- |
| Developer 1  | *Vũ Hoàng Minh*           |
| Developer 2  | *Nguyễn Đình Gia Khánh*   |

---

## 📄 License

Dự án phục vụ mục đích học tập.
