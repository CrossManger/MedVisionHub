# Backend - MedVision Hub

> Golang + Gin + GORM + PostgreSQL + Gorilla WebSocket

Thư mục này sẽ chứa toàn bộ source code Backend.

## Khởi tạo (Phase 1)

```bash
cd app/backend
go mod init medvision-hub
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
go get -u github.com/golang-jwt/jwt/v5
go get -u github.com/gorilla/websocket
go get -u golang.org/x/crypto/bcrypt
go get -u github.com/joho/godotenv
```

## Cấu trúc dự kiến

```
app/backend/
├── cmd/
│   └── main.go              # Entry point
├── internal/
│   ├── controllers/         # HTTP handlers
│   ├── services/            # Business logic
│   ├── repos/               # Database access (GORM)
│   ├── models/              # Struct definitions
│   ├── middlewares/         # JWT, RBAC, CORS
│   └── dto/                 # Request/Response DTOs
├── pkg/
│   ├── config/              # App configuration
│   ├── utils/               # Helpers
│   └── database/            # DB connection
├── uploads/                 # Image storage (gitignored)
├── .env.example
└── go.mod
```
