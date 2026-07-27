# 📏 MedVision Hub - Code Conventions

> Tài liệu quy ước coding cho toàn bộ team. Mọi thành viên (bao gồm AI Agent) phải tuân thủ.

---

## 1. Quy ước chung

- **Ngôn ngữ code:** Tiếng Anh (biến, hàm, comment trong code).
- **Ngôn ngữ tài liệu:** Tiếng Việt (README, docs, commit message có thể dùng tiếng Việt).
- **Git Branch Strategy:**
  - `main` — Production-ready code
  - `develop` — Branch tích hợp chính
  - `feature/<tên-tính-năng>` — Nhánh tính năng
  - `fix/<mô-tả-bug>` — Nhánh sửa lỗi

---

## 2. Backend - Golang Conventions

### 2.1 Cấu trúc thư mục
```
app/backend/
├── cmd/main.go              # Entry point duy nhất
├── internal/
│   ├── controllers/         # HTTP handlers, nhận request → gọi service → trả response
│   ├── services/            # Business logic, KHÔNG truy cập DB trực tiếp
│   ├── repos/               # Repository pattern, truy cập DB qua GORM
│   ├── models/              # GORM models, struct definition
│   ├── middlewares/         # JWT auth, RBAC, CORS, logging
│   └── dto/                 # Data Transfer Objects (request/response structs)
├── pkg/
│   ├── config/              # Load .env, app config
│   ├── utils/               # Helper functions (hash password, generate JWT, etc.)
│   └── database/            # Database connection setup
├── uploads/                 # Thư mục lưu file ảnh (gitignored)
├── .env.example
└── go.mod
```

### 2.2 Naming Conventions
| Loại             | Convention        | Ví dụ                          |
| ---------------- | ----------------- | ------------------------------ |
| Package          | lowercase         | `controllers`, `services`      |
| File             | snake_case        | `patient_controller.go`        |
| Struct           | PascalCase        | `Patient`, `ScanSession`       |
| Function (public)| PascalCase        | `GetAllPatients()`             |
| Function (private)| camelCase        | `hashPassword()`               |
| Variable         | camelCase         | `patientID`, `scanType`        |
| Constant         | PascalCase hoặc ALL_CAPS | `MaxFileSize`, `JWT_SECRET` |

### 2.3 Error Handling
- Luôn trả về error từ function, KHÔNG panic.
- Sử dụng custom error types khi cần.
- HTTP response error format thống nhất:
```json
{
  "error": "Mô tả lỗi ngắn gọn",
  "details": "Chi tiết lỗi (optional)"
}
```

### 2.4 API Response Format
```json
// Success (single item)
{ "message": "Success", "data": { ... } }

// Success (list)
{ "data": [...], "pagination": { "page": 1, "limit": 10, "total": 50, "total_pages": 5 } }

// Error
{ "error": "Error message" }
```

---

## 3. Frontend - ReactJS/TypeScript Conventions

### 3.1 Cấu trúc thư mục
```
app/frontend/src/
├── components/              # Reusable UI components
│   ├── common/              # Button, Input, Modal, Table...
│   └── layout/              # Header, Sidebar, Footer
├── pages/                   # Page-level components (mỗi route 1 file)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PatientListPage.tsx
│   └── PatientDetailPage.tsx
├── services/                # API call functions (axios/fetch wrappers)
│   ├── authService.ts
│   ├── patientService.ts
│   └── api.ts               # Axios instance config
├── stores/                  # Zustand stores
│   ├── authStore.ts
│   └── notificationStore.ts
├── types/                   # TypeScript interfaces/types
│   ├── user.ts
│   ├── patient.ts
│   └── api.ts
├── hooks/                   # Custom React hooks
├── utils/                   # Helper/utility functions
├── App.tsx
├── main.tsx
└── index.css
```

### 3.2 Naming Conventions
| Loại             | Convention         | Ví dụ                          |
| ---------------- | ------------------ | ------------------------------ |
| Component file   | PascalCase.tsx     | `PatientCard.tsx`              |
| Component name   | PascalCase         | `PatientCard`                  |
| Hook file        | camelCase.ts       | `useAuth.ts`                   |
| Hook name        | camelCase (use*)   | `useAuth()`, `usePatients()`   |
| Service file     | camelCase.ts       | `patientService.ts`            |
| Type/Interface   | PascalCase         | `Patient`, `LoginRequest`      |
| Store file       | camelCase.ts       | `authStore.ts`                 |
| CSS class        | kebab-case         | `patient-card`, `nav-header`   |
| Constant         | UPPER_SNAKE_CASE   | `API_BASE_URL`                 |

### 3.3 Component Structure
```tsx
// 1. Imports
import { useState } from 'react';
import { Button } from '../components/common/Button';

// 2. Types/Interfaces (nếu chỉ dùng trong file này)
interface Props { ... }

// 3. Component
const PatientCard: React.FC<Props> = ({ ... }) => {
  // Hooks
  // State
  // Handlers
  // Render
  return ( ... );
};

export default PatientCard;
```

### 3.4 State Management
- Dùng **Zustand** cho global state (auth, notifications).
- Dùng **useState/useReducer** cho local component state.
- KHÔNG lưu dữ liệu có thể fetch từ API vào global state (trừ user session).

---

## 4. Git Commit Message Format

```
<type>: <mô tả ngắn>

[body - mô tả chi tiết nếu cần]
```

**Types:**
- `feat:` — Tính năng mới
- `fix:` — Sửa bug
- `docs:` — Cập nhật tài liệu
- `style:` — Format code (không ảnh hưởng logic)
- `refactor:` — Tái cấu trúc code
- `chore:` — Setup, config, dependencies

**Ví dụ:**
```
feat: thêm API đăng ký tài khoản
fix: sửa lỗi upload ảnh quá 10MB không báo lỗi
docs: cập nhật database schema cho bảng notifications
```
