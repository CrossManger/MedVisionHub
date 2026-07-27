# 🔄 Luồng Nghiệp vụ (System Workflows) - MedVision Hub

---

## Luồng 1: Xác thực & Phân quyền (Auth & Permission Flow)

### 1.1 Đăng ký (Register)
```
User ──▶ Fill form (username, email, password, role)
  │
  ▼
Frontend ──POST /auth/register──▶ Backend
  │                                  │
  │                                  ├── Validate input
  │                                  ├── Check trùng username/email
  │                                  ├── Hash password (bcrypt)
  │                                  ├── Create user record
  │                                  └── Assign default role permissions
  │                                  │
  ◀── 201 Created ─────────────────┘
  │
  ▼
Redirect to Login page
```

### 1.2 Đăng nhập (Login)
```
User ──▶ Enter username + password
  │
  ▼
Frontend ──POST /auth/login──▶ Backend
  │                                │
  │                                ├── Find user by username
  │                                ├── Compare password hash (bcrypt)
  │                                ├── Load user role + permissions
  │                                └── Generate JWT token (24h expiry)
  │                                │
  ◀── 200 { token, user } ──────┘
  │
  ▼
Frontend lưu token vào localStorage
  │
  ▼
Redirect to Dashboard
```

### 1.3 Authorization trên mỗi Request
```
Frontend ──▶ API Request
  │           Header: "Authorization: Bearer <JWT>"
  ▼
[JWT Middleware]
  ├── Token missing/invalid ──▶ 401 Unauthorized
  │
  ▼
[RBAC Middleware]
  ├── Extract role_id từ JWT claims
  ├── Query role_permissions cho endpoint cần permission gì
  ├── User KHÔNG có permission ──▶ 403 Forbidden
  │
  ▼
[Controller] ──▶ Xử lý bình thường
```

### 1.4 Admin quản lý quyền (Phase 2)
```
Admin ──▶ Mở trang Permission Management
  │
  ▼
Frontend ──GET /admin/roles──▶ Backend
  │                              │
  ◀── Danh sách roles kèm permissions (checkbox matrix)
  │
  ▼
Admin tích/bỏ tích permission cho Role "Doctor"
  │
  ▼
Frontend ──PUT /admin/roles/:id/permissions──▶ Backend
  │                                              │
  │                                              ├── Xóa hết role_permissions cũ
  │                                              └── Insert permission_ids mới
  │                                              │
  ◀── 200 Success ─────────────────────────────┘
```

---

## Luồng 2: Quản lý Bệnh nhân & Hình ảnh (Management CRUD)

### 2.1 Tạo Hồ sơ Bệnh nhân
```
Doctor ──▶ Mở form "Thêm bệnh nhân"
  │
  ▼
Fill: Họ tên, Ngày sinh, Giới tính, SĐT, Địa chỉ, Tiền sử bệnh
  │
  ▼
Frontend ──POST /patients──▶ Backend
  │                            │
  │                            ├── Validate input
  │                            ├── Set created_by = current user ID
  │                            └── Insert vào bảng patients
  │                            │
  ◀── 201 { patient } ──────┘
  │
  ▼
Redirect to Patient Detail page
```

### 2.2 Tạo Ca chụp (Scan Session)
```
Doctor ──▶ Ở trang Patient Detail, nhấn "Tạo ca chụp mới"
  │
  ▼
Chọn loại chụp: X-Ray / MRI / CT Scan / Ultrasound
  │
  ▼
Frontend ──POST /patients/:id/scans──▶ Backend
  │                                       │
  │                                       ├── Create scan_session (status: pending)
  │                                       └── Set doctor_id = current user ID
  │                                       │
  ◀── 201 { scan_session } ────────────┘
```

### 2.3 Upload Hình ảnh Y tế
```
Doctor ──▶ Ở trang Scan Detail, nhấn "Upload ảnh"
  │
  ▼
Chọn file ảnh (JPG/PNG/DICOM, max 10MB)
  │
  ▼
Frontend ──POST /scans/:id/images──▶ Backend (multipart/form-data)
  │                                     │
  │                                     ├── Validate file type & size
  │                                     ├── Generate unique filename
  │                                     ├── Save file to uploads/ directory
  │                                     ├── Create image record in DB
  │                                     └── Return file_url
  │                                     │
  ◀── 201 { image } ─────────────────┘
  │
  ▼
Frontend hiển thị ảnh vừa upload (thumbnail + full view)
```

### 2.4 Xem & Tương tác Ảnh (Phase 3 enhancement)
```
User ──▶ Click vào thumbnail ảnh
  │
  ▼
Mở Image Viewer:
  ├── Phóng to (Zoom In)
  ├── Thu nhỏ (Zoom Out)
  ├── Xoay ảnh (Rotate 90°)
  └── Toàn màn hình (Fullscreen)
```

---

## Luồng 3: Thông báo Thời gian thực (Notification Flow) — Phase 3

### 3.1 Thiết lập kết nối WebSocket
```
User đăng nhập thành công
  │
  ▼
Frontend ──WebSocket Connect──▶ ws://localhost:8080/ws/notifications?token=<JWT>
  │                                  │
  │                                  ├── Verify JWT token
  │                                  ├── Register client vào WebSocket Hub
  │                                  └── Map: user_id → WebSocket connection
  │                                  │
  ◀── Connection Established ──────┘
```

### 3.2 Gửi thông báo khi hoàn tất chẩn đoán
```
Doctor ──▶ Nhấn "Hoàn tất chẩn đoán" cho scan session
  │
  ▼
Frontend ──PUT /scans/:id/complete──▶ Backend
  │                                      │
  │                                      ├── Update scan status → "completed"
  │                                      ├── Lưu diagnostic_result vào images
  │                                      ├── Create notification record
  │                                      └── WebSocket Hub: broadcast to patient
  │                                      │
  ◀── 200 Success ────────────────────┘

  Đồng thời:
  WebSocket Hub ──push──▶ Patient's Frontend
                             │
                             ▼
                        Toast Notification:
                        "Bác sĩ Nguyễn đã cập nhật
                         kết quả X-quang của bạn"
```
