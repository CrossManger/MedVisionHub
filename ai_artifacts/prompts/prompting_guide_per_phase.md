# 🤖 Hướng Dẫn Prompt AI Theo Giai Đoạn (Phase Prompting Guide)

Tài liệu này hướng dẫn cách **viết Prompt hiệu quả** cho AI Agent (như Antigravity / Gemini / ChatGPT) dành cho 2 thành viên **A** và **B** trong từng Phase của dự án **MedVisionHub**.

---

## 🎯 1. Công thức Prompt Cốt Lõi (Khung C.A.R.E)

Mỗi khi gửi yêu cầu cho AI code một tính năng, các thành viên nên tuân thủ khung **C.A.R.E**:

1. **Context (Ngữ cảnh)**: Đính kèm file plan của phase (`@ai_artifacts/plans/phase-X...`), `@ai_artifacts/api_contracts.json`, `@ai_artifacts/db_schema.yaml`.
2. **Action (Hành động)**: Nêu rõ nhiệm vụ (ví dụ: *"Tôi đảm nhận Feature X, hãy làm phần Backend trước..."*).
3. **Role (Vai trò)**: Đóng vai Senior Golang Engineer (cho BE) hoặc Senior React/TS Engineer (cho FE).
4. **Expectation (Kỳ vọng)**: Yêu cầu xử lý lỗi (Error handling), validate input, viết code sạch và tuân thủ `code_conventions.md`.

---

## 📋 2. Mẫu Prompt Chi Tiết Cho Từng Phase

---

### 🔑 PHASE 2: Authentication (Đăng nhập / Đăng ký)

#### 👤 Prompt cho Thành viên A (Tính năng Đăng ký - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy hỗ trợ tôi thực hiện tính năng **Đăng Ký (Register)** cho dự án MedVisionHub.
Tham khảo ngữ cảnh tại:
- Kế hoạch Phase 2: @ai_artifacts/plans/phase-2-authentication.md
- API Contract: @ai_artifacts/api_contracts.json
- DB Schema: @ai_artifacts/db_schema.yaml

Nhiệm vụ của tôi (Thành viên A):
1. **Backend:**
   - Viết hàm băm mật khẩu (bcrypt) tại `pkg/utils/password.go`.
   - Tạo DTO `RegisterRequest` tại `internal/dto/auth_dto.go` (validate required fields).
   - Thêm phương thức `Create`, `FindByEmail`, `FindByUsername` tại `internal/repos/user_repo.go`.
   - Viết logic `Register` tại `internal/services/auth_service.go` (check trùng email/username, gán default role 'patient' nếu không truyền).
   - Viết `RegisterHandler` tại `internal/controllers/auth_controller.go` và đăng ký route `POST /api/v1/auth/register`.

2. **Frontend:**
   - Hoàn thiện `app/frontend/src/pages/RegisterPage.tsx` sử dụng Form của Ant Design.
   - Validate form client-side (mật khẩu nhập lại khớp, định dạng email, độ dài mật khẩu >= 6).
   - Gọi API qua `authService.register()`, xử lý thông báo thành công (Toast/Message) và tự động chuyển hướng sang `/login`.

Hãy sinh code hoàn chỉnh, đúng quy chuẩn và không tự ý thay đổi API contract.
```

#### 👤 Prompt cho Thành viên B (Tính năng Đăng nhập & JWT Infrastructure - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy hỗ trợ tôi thực hiện tính năng **Đăng Nhập (Login) & Cấu trúc JWT** cho MedVisionHub.
Tham khảo ngữ cảnh tại:
- Kế hoạch Phase 2: @ai_artifacts/plans/phase-2-authentication.md
- API Contract: @ai_artifacts/api_contracts.json

Nhiệm vụ của tôi (Thành viên B):
1. **Backend:**
   - Viết hàm `GenerateToken`, `ValidateToken` tại `pkg/utils/jwt.go` (claims chứa user_id, username, role_id, exp 24h).
   - Viết logic `Login` tại `internal/services/auth_service.go` (verify password hash bằng bcrypt, trả JWT token + thông tin user).
   - Viết `auth_middleware.go` để kiểm tra Bearer Token trong header `Authorization`.
   - Đăng ký route `POST /api/v1/auth/login`.

2. **Frontend:**
   - Hoàn thiện `app/frontend/src/pages/LoginPage.tsx` (Form Ant Design).
   - Cập nhật `stores/authStore.ts` (lưu token vào localStorage, cập nhật user state).
   - Tạo component `ProtectedRoute.tsx` để bảo vệ các route cần đăng nhập.
   - Cập nhật `Header.tsx` hiển thị tên người dùng và nút Đăng xuất (Logout).

Hãy sinh code đầy đủ, xử lý kỹ trường hợp nhập sai tài khoản/mật khẩu và token hết hạn.
```

---

### 🏥 PHASE 3: Patient Management (Quản lý Hồ sơ Bệnh nhân)

#### 👤 Prompt cho Thành viên A (Xem Danh Sách & Chi Tiết Bệnh Nhân - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi làm phần **Đọc Dữ Liệu Bệnh Nhân (Read Operations)** trong Phase 3.
Tham khảo:
- Plan Phase 3: @ai_artifacts/plans/phase-3-patient-management.md
- API Contract: @ai_artifacts/api_contracts.json

Công việc của Thành viên A:
1. **Backend:**
   - Tạo DTO `PatientListResponse`, `PatientDetailResponse` kèm theo cấu trúc `Pagination`.
   - Viết Repo `patient_repo.go` hàm `FindAll` (hỗ trợ phân trang page, limit và tìm kiếm theo tên) + `FindByID` (Preload ca chụp scan_sessions).
   - Controller & Route `GET /api/v1/patients` và `GET /api/v1/patients/:id` (gắn JWT Middleware).

2. **Frontend:**
   - Tạo `types/patient.ts` và `services/patientService.ts` (hàm `getAll`, `getById`).
   - Xây dựng `pages/PatientListPage.tsx` bằng Ant Design Table (phân trang, ô tìm kiếm debounce 300ms, trạng thái loading).
   - Xây dựng `pages/PatientDetailPage.tsx` hiển thị Card thông tin bệnh nhân + danh sách ca chụp.

Hãy viết code mượt mà, tối ưu query GORM và tránh re-render thừa ở frontend.
```

#### 👤 Prompt cho Thành viên B (Tạo / Sửa / Xóa Bệnh Nhân - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi làm phần **Thao Tác Ghi (Write Operations: Create/Update/Delete)** trong Phase 3.
Tham khảo:
- Plan Phase 3: @ai_artifacts/plans/phase-3-patient-management.md
- API Contract: @ai_artifacts/api_contracts.json

Công việc của Thành viên B:
1. **Backend:**
   - DTO `CreatePatientRequest` (binding required `full_name`), `UpdatePatientRequest`.
   - Repo `patient_repo.go` (Create, Update, Delete).
   - Logic `CreatePatient` tự động gán `created_by` từ User ID trong JWT.
   - Controllers & Routes: `POST`, `PUT`, `DELETE /api/v1/patients`.

2. **Frontend:**
   - Tạo Modal Component tái sử dụng `components/common/PatientForm.tsx` (dùng cho cả Tạo mới & Chỉnh sửa).
   - Gắn sự kiện nút "Thêm bệnh nhân" mở Modal, nút "Sửa" điền thông tin cũ vào Form, nút "Xóa" hiển thị `Popconfirm` xác nhận trước khi xóa.
   - Hiển thị thông báo Toast kết quả và refresh lại danh sách sau khi thao tác thành công.

Hãy viết code cẩn thận, xử lý lỗi validation từ server và hiển thị lỗi trên form.
```

---

### 📷 PHASE 4: Scan Sessions & Image Upload (Ca chụp & Upload Ảnh Y Khoa)

#### 👤 Prompt cho Thành viên A (Quản lý Ca Chụp - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi triển khai tính năng **Ca Chụp (Scan Sessions)** cho Phase 4 (Mốc Demo).
Tham khảo: @ai_artifacts/plans/phase-4-scan-image-upload.md

Công việc của Thành viên A:
1. **Backend:**
   - DTO `CreateScanRequest` (scan_type enum: xray, mri, ct_scan, ultrasound).
   - Repo/Service/Controller cho Ca chụp. Tự động gán `doctor_id` từ JWT.
   - Routes: `POST /api/v1/patients/:patient_id/scans` và `GET /api/v1/patients/:patient_id/scans`.

2. **Frontend:**
   - Tạo Modal `components/common/ScanForm.tsx` chọn loại ca chụp và nhập ghi chú.
   - Cập nhật `PatientDetailPage.tsx` hiển thị Bảng ca chụp + Nút "Tạo ca chụp".
   - Tạo trang `ScanDetailPage.tsx` hiển thị thông tin ca chụp và chuyển hướng đến vùng ảnh.

Hãy đảm bảo code chạy ổn định để chuẩn bị cho buổi Demo!
```

#### 👤 Prompt cho Thành viên B (Upload & Xem Ảnh Y Khoa - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi triển khai tính năng **Upload & Trình Xem Ảnh Y Khoa (PACS Viewer)** cho Phase 4.
Tham khảo: @ai_artifacts/plans/phase-4-scan-image-upload.md

Công việc của Thành viên B:
1. **Backend:**
   - Xử lý multipart/form-data upload file ảnh (kiểm tra định dạng jpg/png/dicom, kích thước max 10MB).
   - Tạo tên file UUID duy nhất, lưu vào thư mục `uploads/` và lưu metadata vào DB.
   - Routes: `POST/GET /api/v1/scans/:scan_id/images` và `DELETE /api/v1/images/:id`. Khi xóa ảnh phải xóa cả file trên đĩa.

2. **Frontend:**
   - Vùng Upload kéo thả bằng Ant Design `Upload.Dragger` tại `ScanDetailPage.tsx`.
   - Validate định dạng và kích thước file ở client trước khi tải lên.
   - Tạo `components/common/ImageViewer.tsx`: Modal xem ảnh phóng to/thu nhỏ (Zoom), xoay 90 độ (Rotate), toàn màn hình (Fullscreen).

Hãy viết code xử lý file an toàn và giao diện xem ảnh thật ấn tượng.
```

---

### 🛡️ PHASE 5: RBAC & Permission Management (Phân quyền & Khôi phục mật khẩu)

#### 👤 Prompt cho Thành viên A (RBAC Middleware & UI Protection - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi xây dựng **Hệ thống Middleware Phân Quyền Động (RBAC)** cho Phase 5.
Tham khảo: @ai_artifacts/plans/phase-5-rbac-permissions.md

Công việc của Thành viên A:
1. **Backend:**
   - Viết `rbac_middleware.go`: Hàm `RequirePermission(permissionName)` kiểm tra mảng quyền của Role trong CSDL. Trả về 403 Forbidden nếu không có quyền.
   - Áp dụng Middleware này cho TẤT CẢ các API của Phase 3 & 4 (ví dụ: `POST /patients` yêu cầu `can_create_patient`).

2. **Frontend:**
   - Cập nhật `authStore.ts` lưu danh sách `permissions` của user sau khi login.
   - Tạo HOC/Component wrapper `RequirePermission.tsx` để ẩn/hiện các nút (Tải ảnh, Thêm bệnh nhân, Xóa...) dựa theo quyền.
   - Phân quyền ẩn/hiện Sidebar menu theo Role.

Hãy viết code bảo mật cao, kiểm tra kỹ cả 2 đầu API và UI.
```

#### 👤 Prompt cho Thành viên B (Trang Quản lý Quyền Admin & Quên Mật Khẩu - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi làm **Trang Admin Phân Quyền & Quên Mật Khẩu** cho Phase 5.
Tham khảo: @ai_artifacts/plans/phase-5-rbac-permissions.md

Công việc của Thành viên B:
1. **Backend:**
   - APIs Quản lý quyền: `GET /admin/roles`, `GET /admin/permissions`, `PUT /admin/roles/:id/permissions` (Transaction cập nhật quyền).
   - APIs Quên mật khẩu: `POST /auth/forgot-password` (sinh reset token), `POST /auth/reset-password`.

2. **Frontend:**
   - Xây dựng `pages/PermissionManagementPage.tsx`: Bảng Matrix (Hàng = Quyền, Cột = Role), tích chọn Checkbox để thay đổi quyền động và nút "Lưu thay đổi".
   - Trang `ForgotPasswordPage.tsx` và `ResetPasswordPage.tsx`.

Hãy đảm bảo khi Admin đổi quyền, hệ thống sẽ áp dụng hiệu lực ngay lập tức.
```

---

### ⚡ PHASE 6: Realtime Notifications & Polish (Thông báo Realtime & Tối ưu UI)

#### 👤 Prompt cho Thành viên A (WebSocket Hub & Chuông Thông Báo - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi triển khai **Hệ thống Thông báo Realtime qua WebSocket** trong Phase 6.
Tham khảo: @ai_artifacts/plans/phase-6-realtime-notifications.md

Công việc của Thành viên A:
1. **Backend:**
   - Dùng Gorilla WebSocket dựng `websocket/hub.go` và `client.go` (quản lý kết nối theo User ID).
   - API WebSocket `/ws/notifications?token=<JWT>`.
   - Service lưu thông báo vào DB và phát tín hiệu (broadcast) realtime tới client target.

2. **Frontend:**
   - Quản lý kết nối WebSocket bằng Zustand store `stores/notificationStore.ts` và custom hook `useWebSocket.ts` (tự động kết nối lại khi mất mạng).
   - Cập nhật `Header.tsx`: Icon chuông thông báo (Bell) có Badge đếm số tin chưa đọc, Dropdown danh sách thông báo. Khi click thông báo thì đánh dấu đã đọc và chuyển hướng đến trang tương ứng.

Code cần xử lý reconnect WebSocket mượt mà và tránh rò rỉ bộ nhớ (memory leak).
```

#### 👤 Prompt cho Thành viên B (Hoàn tất Chẩn đoán & Tối ưu Giao diện Mobile - Fullstack)
```markdown
Bạn là Senior Fullstack Engineer. Hãy giúp tôi làm tính năng **Hoàn Tất Chẩn Đoán & Tối Ưu UI Mobile** cho Phase 6.
Tham khảo: @ai_artifacts/plans/phase-6-realtime-notifications.md

Công việc của Thành viên B:
1. **Backend:**
   - Route `PUT /scans/:id/complete`: Cập nhật trạng thái ca chụp thành `completed`, lưu kết quả chẩn đoán và trigger bắn thông báo Realtime WebSocket tới Bệnh nhân.

2. **Frontend:**
   - Thêm nút "Hoàn tất chẩn đoán" (chỉ hiển thị cho Bác sĩ) tại `ScanDetailPage.tsx`, bật Modal nhập kết quả chẩn đoán.
   - Tối ưu Responsive Toàn bộ ứng dụng: Sidebar rút gọn thành Hamburger Menu/Drawer trên điện thoại, Bảng dữ liệu tự cuộn ngang trên màn hình nhỏ.
   - Xử lý các trường hợp lỗi biên (Edge cases): Token hết hạn tự logout, upload sai định dạng hiện thông báo rõ ràng.

Hãy đảm bảo trải nghiệm người dùng (UX) thật mượt mà trên cả Desktop và Mobile.
```

---

## 💡 3. Mẹo Làm Việc Với AI Code Tránh Lỗi

1. **Đính kèm đúng Context**: Đừng bắt AI tự đoán code. Mỗi khi mở session mới, hãy gắn tệp plan + contract liên quan.
2. **Yêu cầu làm từng bước**: Nếu task quá lớn, hãy bảo AI: *"Hãy làm phần Backend trước, kiểm tra ổn rồi mới sinh code Frontend"*.
3. **Fix Bug đúng cách**: Khi gặp lỗi build hoặc runtime error, copy **nguyên văn log lỗi/traceback** gửi cho AI thay vì chỉ tả chung chung *"Code bị lỗi rồi"*.
