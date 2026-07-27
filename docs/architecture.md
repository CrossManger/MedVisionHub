# 🏗️ Kiến trúc Hệ thống - MedVision Hub

## 1. Tổng quan

MedVision Hub sử dụng mô hình **Client-Server** tiêu chuẩn, giao tiếp qua **RESTful API** (HTTP/JSON) và **WebSocket** (realtime notifications).

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         ReactJS + TypeScript (Vite)              │    │
│  │  ┌──────────┬──────────┬───────────┬─────────┐  │    │
│  │  │  Pages   │Components│  Stores   │Services │  │    │
│  │  │(Router)  │ (UI)     │ (Zustand) │(API)    │  │    │
│  │  └──────────┴──────────┴───────────┴─────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│         │ HTTP/REST                 │ WebSocket          │
└─────────┼───────────────────────────┼───────────────────┘
          ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVER LAYER                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Golang (Gin Framework)                │    │
│  │  ┌──────────────────────────────────────────┐   │    │
│  │  │           Middlewares                     │   │    │
│  │  │   (CORS, JWT Auth, RBAC Permission)      │   │    │
│  │  └──────────────────────────────────────────┘   │    │
│  │  ┌─────────────┬──────────────┬─────────────┐   │    │
│  │  │ Controllers  │   Services   │    Repos    │   │    │
│  │  │ (HTTP I/O)   │ (Business)   │  (DB/GORM) │   │    │
│  │  └─────────────┴──────────────┴─────────────┘   │    │
│  │  ┌──────────────────────────────────────────┐   │    │
│  │  │        WebSocket Hub (Gorilla)           │   │    │
│  │  └──────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
│         │                           │                    │
└─────────┼───────────────────────────┼───────────────────┘
          ▼                           ▼
┌────────────────────┐    ┌─────────────────────┐
│   PostgreSQL DB    │    │  Local File Storage  │
│  (GORM AutoMigrate)│    │  (uploads/)          │
└────────────────────┘    └─────────────────────┘
```

## 2. Tech Stack chi tiết

| Layer     | Công nghệ          | Mục đích                                      |
| --------- | ------------------- | --------------------------------------------- |
| Frontend  | ReactJS 18+        | Xây dựng SPA (Single Page Application)        |
| Frontend  | TypeScript          | Type safety, giảm bug runtime                 |
| Frontend  | Vite                | Build tool nhanh, HMR tối ưu                  |
| Frontend  | TailwindCSS         | Utility-first CSS framework                   |
| Frontend  | Ant Design          | Bộ component UI sẵn có (Table, Form, Modal)   |
| Frontend  | Zustand             | Lightweight state management                  |
| Frontend  | Axios               | HTTP client cho API calls                     |
| Backend   | Go 1.21+            | Ngôn ngữ backend chính                        |
| Backend   | Gin                 | Web framework nhẹ, hiệu năng cao              |
| Backend   | GORM                | ORM cho PostgreSQL                            |
| Backend   | Gorilla WebSocket   | WebSocket cho realtime notifications          |
| Backend   | golang-jwt          | JWT token generation & validation             |
| Backend   | bcrypt              | Password hashing                              |
| Database  | PostgreSQL 15+      | RDBMS chính                                   |

## 3. Luồng xử lý Request (Request Flow)

```
Client Request
    │
    ▼
[CORS Middleware]     ← Cho phép cross-origin (frontend port 5173)
    │
    ▼
[JWT Auth Middleware]  ← Extract & verify JWT token từ header
    │                    Authorization: Bearer <token>
    ▼
[RBAC Middleware]      ← Check user role + permission cho endpoint này
    │
    ▼
[Controller]           ← Parse request body/params, validate input
    │
    ▼
[Service]              ← Xử lý business logic
    │
    ▼
[Repository]           ← Query database qua GORM
    │
    ▼
[Database]             ← PostgreSQL
    │
    ▼
Response ← JSON format thống nhất
```

## 4. Thiết kế mở rộng (Extensibility)

### 4.1 AI Microservice Integration (Future)
Hệ thống được thiết kế để dễ dàng tích hợp thêm AI microservice xử lý ảnh y tế:

```
Backend (Gin) ──HTTP POST──▶ AI Service (Python/FastAPI)
                                  │
                                  ├── H-vmunet (Image Segmentation)
                                  ├── nnMamba (Tumor Detection)
                                  └── Custom Models
                                  │
              ◀── JSON Response ──┘
              (bounding boxes, masks, predictions)
```

### 4.2 Cloud Storage Migration
Hiện tại: Local file storage (`uploads/`).
Tương lai: Thay thế bằng AWS S3 / Cloudinary mà không ảnh hưởng API contract (chỉ thay đổi layer Repository/Storage).

## 5. Deployment (Reference)

```yaml
# docker-compose.yml (tham khảo)
services:
  frontend:
    build: ./app/frontend
    ports: ["5173:5173"]

  backend:
    build: ./app/backend
    ports: ["8080:8080"]
    depends_on: [db]
    environment:
      - DB_HOST=db
      - DB_PORT=5432

  db:
    image: postgres:15
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
```
