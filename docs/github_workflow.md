# 🐙 GitHub Workflow & Quy Trình Làm Việc Nhóm (MedVision Hub)

Tài liệu này quy định quy trình phối hợp làm việc qua Git/GitHub dành cho nhóm 2 lập trình viên chính và AI Agent (Antigravity).

---

## 1. Mô hình Nhánh Git (Branching Strategy)

Dự án áp dụng mô hình **Gitflow thu gọn (Feature Branch Workflow)** phù hợp với quy mô nhóm 2 người và thời gian 3 tuần.

```text
main       --------------------------------------------------------► (Production Ready)
              ▲                                       ▲
              │ Release / Merge                       │ Release / Merge
dev    ───┴───────────────────────────────────────┴────────────► (Integration)
                \                  /            \            /
feature          └── feature/auth ┘              └── feature/patient-crud ┘
```

### Quy định tên nhánh:
- **`main`**: Nhánh chứa source code ổn định nhất, đã sẵn sàng để demo hoặc deploy. *Chỉ merge từ `dev`.*
- **`dev`**: Nhánh tích hợp chính. Tất cả tính năng mới sau khi hoàn thành sẽ được tạo Pull Request (PR) để merge vào `dev`.
- **`feature/<tên-tính-năng>`**: Nhánh làm tính năng mới.
  - Ví dụ: `feature/auth-login`, `feature/patient-crud`, `feature/image-upload`, `feature/websocket-notification`.
- **`fix/<mô-tả-bug>`**: Nhánh sửa lỗi.
  - Ví dụ: `fix/jwt-middleware-expired`, `fix/upload-size-limit`.
- **`docs/<tên-tài-liệu>`**: Nhánh cập nhật tài liệu.

---

## 2. Quy trình Phát triển 1 Feature (Step-by-Step)

```text
1. Checkout dev & pull mới nhất
   └─► 2. Tạo nhánh feature/xxx
        └─► 3. Code & Commit (Tuân thủ Code Conventions)
             └─► 4. Push nhánh lên GitHub
                  └─► 5. Tạo Pull Request (PR) vào dev
                       └─► 6. Code Review (Bạn đồng đội hoặc AI)
                            └─► 7. Merge vào dev
```

### Bước 1: Cập nhật code mới nhất từ `dev`
```bash
git checkout dev
git pull -r origin dev
```

### Bước 2: Tạo nhánh tính năng mới
```bash
git checkout -b feature/auth-login
```

### Bước 3: Code và Commit
Tuân thủ định dạng commit message trong `ai_artifacts/code_conventions.md`:
```bash
git add .
git commit -m "feat: thêm API đăng nhập JWT và middleware xác thực"
```

### Bước 4: Push nhánh lên GitHub
```bash
git push -u origin feature/auth-login
```

### Bước 5: Tạo Pull Request (PR) & Review
* Quản lý PR trên GitHub: Target branch là **`dev`**.
* Đảm bảo không có xung đột (merge conflicts) trước khi ấn Merge.

---

## 3. Quy chuẩn Commit Message

| Cú pháp | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `feat:` | Thêm tính năng mới | `feat: dựng giao diện danh sách bệnh nhân` |
| `fix:` | Sửa lỗi / bug | `fix: sửa lỗi không nhận file ảnh DICOM` |
| `docs:` | Thêm/sửa tài liệu | `docs: cập nhật github_workflow.md` |
| `style:` | Format code, đổi màu UI (không đổi logic) | `style: căn chỉnh padding cho bảng bệnh nhân` |
| `refactor:` | Tái cấu trúc code (không đổi tính năng) | `refactor: tách helper lưu file ảnh ra package pkg/utils` |
| `chore:` | Cấu hình dự án, cài package | `chore: cài đặt gói ant-design và axios` |

---

## 4. Cấu hình GitHub Actions (CI Pipeline Tham khảo)

Dưới đây là file cấu hình GitHub Actions tự động kiểm tra code (Build & Test) mỗi khi tạo PR vào nhánh `dev` hoặc `main`.

File lưu tại: `.github/workflows/ci.yml`

```yaml
name: MedVision Hub CI

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  backend-check:
    name: Backend (Golang) Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'

      - name: Install dependencies & Build
        run: |
          cd app/backend
          go mod download
          go build -v ./cmd/main.go

  frontend-check:
    name: Frontend (ReactJS) Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies & Build
        run: |
          cd app/frontend
          npm ci || npm install
          npm run build
```

---

## 5. Phối hợp cùng AI Agent (Antigravity)

Khi yêu cầu AI Agent thực hiện task:
1. Cho AI đọc trước các file trong `ai_artifacts/` (`db_schema.yaml`, `api_contracts.json`, `code_conventions.md`).
2. Yêu cầu AI làm việc trên đúng nhánh `feature/xxx` hoặc sinh code theo đúng phase trong roadmap.
3. Sau khi AI hoàn thành, tự kiểm tra lại runtime và tạo PR lên `dev`.
