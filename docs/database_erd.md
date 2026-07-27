# 🗄️ Database ERD - MedVision Hub

## Entity Relationship Diagram

```mermaid
erDiagram
    ROLES {
        bigint id PK
        varchar name UK "admin | doctor | patient"
        text description
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        bigint id PK
        varchar name UK "can_view_patient, can_upload_image..."
        text description
        timestamp created_at
    }

    ROLE_PERMISSIONS {
        bigint id PK
        bigint role_id FK
        bigint permission_id FK
        timestamp created_at
    }

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar full_name
        bigint role_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PATIENTS {
        bigint id PK
        bigint user_id FK "nullable - map tài khoản patient"
        varchar full_name
        date date_of_birth
        varchar gender
        varchar phone
        text address
        text medical_history
        bigint created_by FK "Doctor tạo hồ sơ"
        timestamp created_at
        timestamp updated_at
    }

    SCAN_SESSIONS {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        varchar scan_type "xray | mri | ct_scan | ultrasound"
        varchar status "pending | in_progress | completed"
        text notes
        timestamp created_at
        timestamp updated_at
    }

    IMAGES {
        bigint id PK
        bigint session_id FK
        varchar file_name
        varchar file_url
        bigint file_size
        varchar mime_type
        text diagnostic_result
        bigint uploaded_by FK
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        varchar title
        text message
        varchar type "info | success | warning | error"
        boolean is_read
        varchar related_entity
        bigint related_id
        timestamp created_at
    }

    ROLES ||--o{ ROLE_PERMISSIONS : "has"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "assigned_to"
    ROLES ||--o{ USERS : "assigned"
    USERS ||--o| PATIENTS : "has_account"
    USERS ||--o{ PATIENTS : "created_by"
    USERS ||--o{ SCAN_SESSIONS : "doctor"
    PATIENTS ||--o{ SCAN_SESSIONS : "has"
    SCAN_SESSIONS ||--o{ IMAGES : "contains"
    USERS ||--o{ IMAGES : "uploaded_by"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

---

## Mô tả Quan hệ (Relationships)

| Quan hệ                          | Loại        | Mô tả                                                    |
| --------------------------------- | ----------- | --------------------------------------------------------- |
| Roles ↔ Permissions              | Many-to-Many| Qua bảng trung gian `role_permissions`                    |
| Roles → Users                    | One-to-Many | Mỗi user có 1 role, 1 role có nhiều users                |
| Users → Patients (user_id)       | One-to-One  | Bệnh nhân có thể map với 1 tài khoản (optional)          |
| Users → Patients (created_by)    | One-to-Many | 1 bác sĩ tạo nhiều hồ sơ bệnh nhân                      |
| Users → Scan_Sessions (doctor_id)| One-to-Many | 1 bác sĩ thực hiện nhiều ca chụp                         |
| Patients → Scan_Sessions         | One-to-Many | 1 bệnh nhân có nhiều ca chụp                             |
| Scan_Sessions → Images           | One-to-Many | 1 ca chụp có nhiều hình ảnh                               |
| Users → Images (uploaded_by)     | One-to-Many | 1 user upload nhiều ảnh                                   |
| Users → Notifications            | One-to-Many | 1 user nhận nhiều thông báo                               |

---

## Ghi chú thiết kế

1. **Soft Delete:** Hiện tại chưa implement soft delete. Nếu cần sau này, thêm cột `deleted_at TIMESTAMP NULL` vào các bảng `users`, `patients`, `scan_sessions`, `images`.

2. **Bảng `patients` tách riêng khỏi `users`:** Cho phép bác sĩ tạo hồ sơ bệnh nhân mà bệnh nhân chưa cần có tài khoản. Nếu bệnh nhân muốn tự đăng nhập xem kết quả, admin sẽ tạo tài khoản và link `user_id`.

3. **Cột `related_entity` + `related_id` trong `notifications`:** Dùng polymorphic association đơn giản để link notification tới entity cụ thể (VD: click notification → mở trang scan detail).

4. **Index strategy:**
   - `users`: index trên `email`, `username` (unique lookup khi login)
   - `scan_sessions`: index trên `patient_id`, `doctor_id` (query theo bệnh nhân/bác sĩ)
   - `images`: index trên `session_id` (load ảnh theo ca chụp)
   - `notifications`: composite index trên `[user_id, is_read]` (query thông báo chưa đọc)
