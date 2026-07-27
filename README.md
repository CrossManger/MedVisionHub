# 🏥 MedVision Hub

> **Nền tảng Quản lý & Cổng dữ liệu Hình ảnh Y tế**

MedVision Hub là một hệ thống web cho phép bệnh viện và phòng khám quản lý hồ sơ bệnh nhân, lưu trữ và xem hình ảnh y tế (X-quang, MRI), phân quyền truy cập theo vai trò (RBAC), và thông báo kết quả chẩn đoán theo thời gian thực.

---

## 📋 Tính năng chính

- **Xác thực & Phân quyền (RBAC):** Đăng nhập/Đăng ký với JWT, phân quyền theo Role (Admin, Doctor, Patient) với hệ thống Permission CRUD.
- **Quản lý Bệnh nhân:** Tạo, xem, sửa, xóa hồ sơ bệnh nhân.
- **Quản lý Ca chụp & Hình ảnh:** Tạo ca chụp (Scan Session), upload và xem hình ảnh X-quang/MRI.
- **Thông báo Realtime:** WebSocket push notification khi bác sĩ cập nhật kết quả chẩn đoán.
- **Responsive UI:** Hỗ trợ cả giao diện Desktop và Mobile.

---

## 🏗️ Kiến trúc Hệ thống

| Thành phần   | Công nghệ                                    |
| ------------ | --------------------------------------------- |
| **Frontend** | ReactJS + TypeScript, Vite, TailwindCSS, Ant Design, Zustand |
| **Backend**  | Golang, Gin, GORM, Gorilla WebSocket         |
| **Database** | PostgreSQL                                    |
| **Storage**  | Local Static File Serving (mở rộng: AWS S3)  |

```
Client (React) ──HTTP/REST──▶ Backend (Golang/Gin)
                                    │
              ◀──WebSocket──────────┤
                                    │
                              PostgreSQL DB
                                    │
                              Local Storage (uploads/)
```

---

## 📁 Cấu trúc Dự án

```text
medvision-hub/
├── ai_artifacts/           # Single Source of Truth (DB schema, API contracts, conventions)
├── docs/                   # Tài liệu kiến trúc, luồng nghiệp vụ, ERD
├── app/
│   ├── frontend/           # ReactJS (Vite + TypeScript + TailwindCSS)
│   └── backend/            # Golang (Gin + GORM)
└── README.md
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **Go** >= 1.21
- **PostgreSQL** >= 15
- **Git**

### 1. Clone repository

```bash
git clone https://github.com/<your-org>/medvision-hub.git
cd medvision-hub
```

### 2. Chạy Backend

```bash
cd app/backend
cp .env.example .env        # Cấu hình database, JWT secret
go mod download
go run cmd/main.go
```

Backend sẽ chạy tại: `http://localhost:8080`

### 3. Chạy Frontend

```bash
cd app/frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 📅 Lộ trình Phát triển

| Phase | Mô tả                                   | Thời gian  | Trạng thái     |
| ----- | ---------------------------------------- | ---------- | -------------- |
| 1     | Project Setup & Boilerplate              | ~1 ngày    | 🔲 Chưa bắt đầu |
| 2     | Authentication (Đăng nhập / Đăng ký)     | ~2-3 ngày  | 🔲 Chưa bắt đầu |
| 3     | Patient Management CRUD                  | ~2-3 ngày  | 🔲 Chưa bắt đầu |
| 4     | Scan Sessions & Image Upload (**Demo**)  | ~2-3 ngày  | 🔲 Chưa bắt đầu |
| 5     | RBAC & Permission Management             | ~2-3 ngày  | 🔲 Chưa bắt đầu |
| 6     | Realtime Notifications & Polish          | ~2-3 ngày  | 🔲 Chưa bắt đầu |

---

## 👥 Thành viên

| Vai trò        | Thành viên       |
| -------------- | ---------------- |
| Developer 1    | *Vũ Hoàng Minh* |
| Developer 2    | *Nguyễn Đình Gia Khánh* |

---

## 📄 License

Dự án phục vụ mục đích học tập.
