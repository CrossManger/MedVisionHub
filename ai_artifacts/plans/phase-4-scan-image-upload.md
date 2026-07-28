# Kế Hoạch Giai Đoạn 4: Ca Chụp Hình Ảnh & Tải Lên (Scan Sessions & Image Upload)

**Thời gian dự kiến:** ~2-3 ngày
**Mục tiêu chính:** Cho phép Bác sĩ tạo mới các ca chụp y tế (Scan Sessions) cho bệnh nhân. Cốt lõi của Phase này là tính năng Upload và Quản lý file hình ảnh y khoa (X-Ray, MRI, CT Scan, Ultrasound). 
**LƯU Ý QUAN TRỌNG:** Đây là mốc DEMO quan trọng của đồ án, cần đặc biệt chăm chút về UI/UX phần hiển thị ảnh và tính năng tương tác với hình ảnh. Sẽ có sự tham gia của Giảng viên chấm điểm. Việc thể hiện độ chi tiết và xử lý luồng trơn tru là tiêu chí đánh giá cốt lõi.

---

## 🧑💻 Phân Công Nhiệm Vụ (Task Assignment)

Chiến lược phân công: Feature-based (Full-stack per person). Mỗi người chịu trách nhiệm cả Backend và Frontend cho tính năng của mình.

| Người | Feature | Backend tasks | Frontend tasks | Ước tính |
|-------|---------|---------------|----------------|----------|
| **👤 A** | Ca chụp (Scan Sessions) | scan_dto, scan_repo, scan_service, scan_controller, scan routes | ScanForm.tsx, ScanDetailPage.tsx (header), PatientDetailPage update, scanService.ts, types/scan.ts | 1.5 ngày |
| **👤 B** | Upload & Xem Ảnh (Images) | image_dto, image_repo, image_service (file handling), image_controller, image routes | ImageViewer.tsx, Upload component, image gallery, imageService.ts, types/image.ts | 1.5 ngày |
| **👥 A + B** | Demo Prep & Integration | - | - | 0.5 ngày |

---

## 1. Trọng Tâm Phiên Bản Demo (Demo Milestone Focus)

Vì đây là mốc demo gửi cho Giảng viên/Instructor, hệ thống cần show được các tính năng "Ăn tiền" sau:
1.  **Giao diện Upload Mượt Mà:** Sử dụng thao tác Drag & Drop để kéo thả file ảnh. Hiển thị thanh tiến trình (progress bar) chân thực. Trạng thái tải lên phải mượt mà. Đảm bảo hỗ trợ upload nhiều file cùng lúc (Batch Upload).
2.  **Trình Xem Ảnh Chuyên Nghiệp (Image Viewer):** Không chỉ là xem ảnh bình thường, mà là một Modal hiển thị ảnh lớn, có nút phóng to (Zoom In), thu nhỏ (Zoom Out), xoay ảnh (Rotate), xem toàn màn hình (Fullscreen) tạo cảm giác giống phần mềm y khoa PACS thực thụ của các bệnh viện lớn.
3.  **Validate File Nghiêm Ngặt:** Phải trình diễn được việc hệ thống từ chối file > 10MB hoặc file không phải là định dạng hình ảnh/dicom. Hệ thống sẽ báo lỗi màu đỏ nếu vi phạm (Sử dụng Toast/Message của Ant Design).
4.  **Tốc Độ Truy Xuất (Performance):** Tải và xem trước ảnh Thumbnail siêu tốc, thao tác mở ảnh lớn tức thì. Tối ưu ảnh để không bị crash trình duyệt.
5.  **Luồng Xóa (Delete Flow):** Minh họa luồng xóa hoàn chỉnh, từ việc xác nhận UI (Modal Confirm), xóa DB và xóa file vật lý trên ổ cứng của server.

```mermaid
flowchart TD
    A[Bác sĩ / Người dùng] --> B(Vào chi tiết Bệnh nhân)
    B --> C{Tạo Ca Chụp Mới?}
    C -->|Có| D[Nhập thông tin: Loại ca chụp, Ghi chú, Bác sĩ chỉ định]
    D --> E[Lưu Database: scan_sessions table]
    E --> F[Điều hướng đến trang Chi tiết Ca Chụp]
    C -->|Không| F
    F --> G[Người dùng Kéo thả file ảnh (Upload Drag & Drop - Antd)]
    G --> H{Kiểm tra Validate File (Type & Max Size)}
    H -->|Hợp lệ| I[Gửi Multipart Form-Data Request lên API Backend]
    H -->|Không hợp lệ| J[Hiển thị thông báo lỗi màu đỏ (Antd Message Error)]
    I --> K[Backend: Tạo UUID chống trùng lặp, Lưu vào thư mục /uploads/images/]
    K --> L[Backend: Lấy Metadata: file_size, mime_type]
    L --> M[Backend: Lưu MetaData vào Database: images table]
    M --> N[Frontend: Phản hồi tiến trình Axios 100%, Cập nhật lưới ảnh (Gallery Grid)]
    N --> O[Click vào ảnh hiển thị Image Viewer Mode chuyên sâu với công cụ Zoom/Pan]
```

---

## 2. Chi Tiết Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Để Phase 4 hoạt động trơn tru, cấu trúc bảng liên quan phải được thiết lập đúng đắn bằng GORM.
*   **(👤 A) Bảng `scan_sessions`:**
    *   `id` (Primary Key, Auto Increment)
    *   `patient_id` (Foreign Key -> patients.id, ON DELETE CASCADE)
    *   `doctor_id` (Foreign Key -> users.id, ON DELETE RESTRICT)
    *   `scan_type` (Enum/String: `xray`, `mri`, `ct_scan`, `ultrasound`)
    *   `status` (Enum/String: `pending`, `in_progress`, `completed`)
    *   `notes` (Text, Nullable)
    *   `created_at`, `updated_at`, `deleted_at` (GORM standard)

*   **(👤 B) Bảng `images`:**
    *   `id` (Primary Key)
    *   `session_id` (Foreign Key -> scan_sessions.id, ON DELETE CASCADE)
    *   `file_name` (String, Not Null) - Tên UUID của file lưu trên đĩa
    *   `file_url` (String, Not Null) - Đường dẫn tĩnh, VD: `/uploads/images/abc.jpg`
    *   `file_size` (BigInt) - Kích thước file (bytes) để quản lý dung lượng
    *   `mime_type` (String) - Loại định dạng (image/jpeg, image/png)
    *   `diagnostic_result` (Text, Nullable) - Kết quả chẩn đoán ghi trên từng hình ảnh
    *   `uploaded_by` (Foreign Key -> users.id, ON DELETE SET NULL)
    *   `created_at`, `updated_at`, `deleted_at`

---

## 3. Chi Tiết Các Tác Vụ Backend (Backend Tasks)

### 3.1. DTOs (Data Transfer Objects)
**File:** `app/backend/internal/dto/scan_dto.go`
*   **(👤 A) CreateScanRequest**:
    *   `scan_type` (bắt buộc, enum: `xray`, `mri`, `ct_scan`, `ultrasound`), validate bằng tag `binding:"required"`.
    *   `notes` (chuỗi, optional).
*   **(👤 A) ScanResponse**: Trả về đủ thông tin cấu trúc: `id`, `patient_id`, `doctor_id`, `status`, `scan_type`, `created_at`.
*   **(👤 A) ScanListResponse**: Mảng ScanResponse, kèm trường bổ sung `image_count` (tổng số ảnh trong ca chụp, giúp UI đỡ trống trải).

**File:** `app/backend/internal/dto/image_dto.go`
*   **(👤 B) ImageResponse/ImageUploadResponse**: Cấu trúc trả về sau khi upload thành công: `id`, `file_name`, `file_url`, `file_size`, `mime_type`, `diagnostic_result`, `uploaded_by`, `created_at`. Phải serialize sang camelCase JSON `fileUrl`, `fileSize`.
*   **(👤 B) ImageListResponse**: Danh sách các hình ảnh.

### 3.2. Repositories (Truy Xuất Dữ Liệu)
**File:** `app/backend/internal/repos/scan_session_repo.go`
*   **(👤 A) Create(scan *models.ScanSession)**: Thêm Record vào bảng `scan_sessions`.
*   **(👤 A) FindAllByPatientID(patientID uint)**: Lấy danh sách ca chụp, dùng GORM `Preload` hoặc Left Join để đếm tổng số hình ảnh đi kèm. Sắp xếp `ORDER BY created_at DESC`.
*   **(👤 A) FindByID(id uint)**: Lấy chi tiết một ca chụp, bao gồm các thông tin bác sĩ phụ trách.
*   **(👤 A) UpdateStatus(id uint, status string)**: Đổi trạng thái ca chụp.

**File:** `app/backend/internal/repos/image_repo.go`
*   **(👤 B) Create(image *models.Image)**: Lưu bản ghi DB sau khi file vật lý đã lưu xuống.
*   **(👤 B) FindAllByScanID(scanID uint)**: Lấy mảng ảnh thuộc ca chụp. Sắp xếp theo thứ tự upload.
*   **(👤 B) Delete(id uint)**: Xóa thông tin ảnh khỏi Database. Bao gồm xóa file `os.Remove`.
*   **(👤 B) FindByID(id uint)**: Truy vấn thông tin file vật lý trước khi xóa.

### 3.3. Services (Logic Nghiệp Vụ Chuyên Sâu)
**File:** `app/backend/internal/services/scan_service.go`
*   **(👤 A) CreateScan**: Xử lý logic tạo ca chụp. Lấy `DoctorID` từ JWT token context. Mặc định status ban đầu là `in_progress`.
*   **(👤 A) GetScansByPatient**: Gọi Repo lấy list và đếm tổng số hình ảnh đi kèm để tiện hiển thị UI.
*   **(👤 A) GetScanByID**: Truy xuất chi tiết 1 ca chụp.

**File:** `app/backend/internal/services/image_service.go`
*   **(👤 B) UploadImage(scanID uint, userID uint, file *multipart.FileHeader)**:
    1.  **Validate Chặt Chẽ Bằng Code (Backend Protection)**:
        *   Dùng `file.Size` kiểm tra dung lượng (Max `10 << 20` bytes = 10MB).
        *   Dùng `http.DetectContentType(buffer)` (đọc 512 byte đầu) thay vì chỉ tin tưởng extension ở tên file để đảm bảo an toàn bảo mật.
    2.  **Generate Filename**: Sử dụng thư viện `google/uuid` để tạo chuỗi ID ngẫu nhiên.
    3.  **Save File To Disk**: Đọc luồng dữ liệu, tạo thư mục `os.MkdirAll` uploads/, tạo file vật lý tại `./uploads/images/`. Trả về lỗi 500 nếu thiếu quyền ghi.
    4.  **Save Record DB**: Tạo object `models.Image`, gọi Repo lưu DB. Gán trường `uploaded_by`. Trả về URL.
*   **(👤 B) GetImagesByScan**: Trả mảng thông tin để Frontend Render Gallery.
*   **(👤 B) DeleteImage**: Lấy thông tin DB của ID ảnh. Xóa file hệ thống `os.Remove`. Gọi hàm Repo xóa DB.

### 3.4. Controllers (Xử lý HTTP & Parse Form)
**File:** `app/backend/internal/controllers/scan_controller.go`
*   **(👤 A) CreateScan**: Parse JSON qua `dto.CreateScanRequest`. Validate trả 400 Bad Request nếu lỗi.
*   **(👤 A) GetScansByPatient**: Lấy param `patient_id`.

**File:** `app/backend/internal/controllers/image_controller.go`
*   **(👤 B) UploadImage**:
    *   Sử dụng `c.FormFile("file")` của Gin. Hỗ trợ Multipart.
    *   Lấy `scan_id`, `user_id`.
    *   Gọi Service.
*   **(👤 B) GetImages**: Lấy mảng ImageDTO.
*   **(👤 B) DeleteImage**: Xóa ảnh bằng ID.

### 3.5. Cấu hình hệ thống & Routes (Routing)
Cập nhật trong file Router chính `app/backend/cmd/main.go` hoặc `routes.go`:
*   **(👤 A) Scan Routes**:
    *   `POST /api/v1/patients/:patient_id/scans`
    *   `GET /api/v1/patients/:patient_id/scans`
*   **(👤 B) Image Routes**:
    *   `POST /api/v1/scans/:scan_id/images`
    *   `GET /api/v1/scans/:scan_id/images`
    *   `DELETE /api/v1/images/:id`
*   **(👤 B) Cấu Hình Phục Vụ Tĩnh (Static Files Directory):**
    *   Bắt buộc phải thêm dòng này vào setup của Gin Engine: `r.Static("/uploads", "./uploads")`

---

## 4. Chi Tiết Các Tác Vụ Frontend (Frontend Tasks)

### 4.1. Types & API Services
*   **File:** `app/frontend/src/types/scan.ts`, `app/frontend/src/services/scanService.ts`
    *   **(👤 A)** Khai báo Enum Type: `export type ScanType = 'xray' | 'mri' | 'ct_scan' | 'ultrasound';`
    *   **(👤 A)** Interface `CreateScanRequest`, `ScanSession`.
    *   **(👤 A)** Các API calls: `createScan`, `getScansByPatient`, `getScanById`.
*   **File:** `app/frontend/src/types/image.ts`, `app/frontend/src/services/imageService.ts`
    *   **(👤 B)** Interface `MedImage`.
    *   **(👤 B)** Các API calls: `uploadImage` (với FormData), `getImages`, `deleteImage`. Cần thiết lập `onUploadProgress`.

### 4.2. Cập nhật Trang Chi Tiết Bệnh Nhân (PatientDetailPage.tsx)
*   **(👤 A)** Tại phần "Lịch sử Ca chụp" ở nửa dưới trang, thêm nút **"Tạo ca chụp mới"** (Type="primary", Icon Plus) mở `ScanForm`.
*   **(👤 A)** `ScanForm.tsx`: Chứa Form Component (Select Loại Y tế, TextArea ghi chú).
*   **(👤 A)** Lưới danh sách các ca chụp cũ (type/status/image_count/created_at/actions), có một Action "Xem Ca Chụp" chuyển đến route `/scans/:id`.
*   **(👤 A)** Cập nhật `App.tsx` thêm Route `/scans/:id`.

### 4.3. Trang Chi Tiết Ca Chụp & Tải Lên (ScanDetailPage.tsx)
**File:** `app/frontend/src/pages/ScanDetailPage.tsx`
*   **(👤 A) Phần Header (Overview Section):** Card tổng quan hiển thị: Tên Bệnh nhân, Loại chụp, Trạng thái, Thời gian tạo, Tên Bác sĩ điều trị, Ghi chú chẩn đoán.
*   **(👤 B) Khu vực Upload Ảnh Bằng Kéo Thả (Drag & Drop Zone):**
    *   Sử dụng component `Upload.Dragger` cao cấp của Ant Design.
    *   **Validate Client-Side Trước Khi Up:** Sử dụng prop `beforeUpload`:
        *   Kiểm tra `file.size / 1024 / 1024 < 10` (ngăn không cho up file >10MB).
        *   Kiểm tra `file.type.startsWith('image/')`.
    *   **Custom Request Logic:** customRequest tự gọi hàm `uploadImage` thông qua Axios (quản lý phần trăm `%` progress bar).
*   **(👤 B) Image Gallery Grid (Lưới hiển thị hình ảnh y khoa):**
    *   Mỗi ảnh hiển thị dạng Thumbnail hình vuông, sử dụng CSS Object-fit (Cover).
    *   Hiển thị nút Xóa (có Popconfirm).
    *   Hiển thị nút Xem Chi Tiết gọi `ImageViewer`.

### 4.4. Trình Xem Ảnh Y Khoa PACS thu nhỏ (ImageViewer.tsx) - Tính năng "WOW"
**File:** `app/frontend/src/components/common/ImageViewer.tsx`
*   **(👤 B)** Modal hiển thị toàn màn hình, background đen thẫm.
*   **(👤 B)** Hỗ trợ thanh công cụ: Zoom In, Zoom Out, Rotate Right, Reset, Close. Sử dụng thuộc tính CSS `transform` (scale, rotate).

---

## 5. Tiêu Chí Nghiệm Thu (Acceptance Criteria) & Kịch Bản Thuyết Trình Testing (Demo Script)

### Kịch Bản Demo Chuẩn Trong Ngày Trình Bày
1.  **Bước 1:** Đăng nhập với tài khoản Bác sĩ -> Bấm menu Bệnh nhân -> Truy cập trang chi tiết Bệnh nhân "Nguyễn Văn A".
2.  **Bước 2:** Di chuyển chuột xuống phần "Ca Chụp". Bấm nút "Tạo ca chụp mới", form hiện ra mượt mà, chọn Loại dịch vụ là **X-Ray Phổi**, nhập ghi chú. Bấm Lưu.
3.  **Bước 3:** Hệ thống thông báo thành công và tự động chuyển hướng vào ca chụp vừa tạo.
4.  **Bước 4 (Cố tình tạo lỗi):** Kéo và thả cố ý 1 file văn bản PDF vào vùng Dragger -> Trình diễn lỗi từ chối báo ngay lập tức.
5.  **Bước 5 (Cố tình tạo lỗi):** Kéo thả file ảnh JPG nhưng kích thước 15MB -> Trình diễn lỗi kích thước quá lớn.
6.  **Bước 6 (Tạo WOW factor):** Kéo thả cùng lúc 3-4 file ảnh y tế thực tế hợp lệ vào vùng Dragger. -> Các thanh tiến trình chạy mượt, cập nhật Gallery thời gian thực.
7.  **Bước 7:** Click vào nút Xem trên Thumbnail -> **Image Viewer Mode** bật lên lấp đầy màn hình.
8.  **Bước 8:** Phóng to, Thu nhỏ, và xoay hình ảnh mượt mà.
9.  **Bước 9:** Tắt Image Viewer. Nhấn nút Thùng Rác để Xóa một ảnh, minh họa ảnh biến mất và API `DELETE` được gọi thành công.

### Danh Sách Kiểm Tra Kỹ Thuật (Developer Technical Checklist)
- [ ] **(👤 B)** Backend Security: Thuật toán đọc `DetectContentType` từ buffer chặn đứng malware.
- [ ] **(👤 B)** Backend Naming: Thư viện UUID được tích hợp để sinh tên ngẫu nhiên tuyệt đối.
- [ ] **(👤 B)** Backend Disk I/O: File vật lý thực sự được lưu vào thư mục `/uploads/images/`.
- [ ] **(👤 B)** Backend Clean Up: API Delete Image có gọi lệnh hệ thống `os.Remove`.
- [ ] **(👤 B)** Frontend UI/UX: Hàm Axios bắt chính xác sự kiện byte gửi đi (`onUploadProgress`) và tính phép chia ra `percent%`.
- [ ] **(👤 B)** Frontend Styling: Tính năng CSS Transform trong `ImageViewer` chạy siêu mượt.
- [ ] **(👤 B)** Frontend Routing: Load File tĩnh từ URL backend.
- [ ] **(👤 A)** Frontend: Tính năng tạo ca chụp hoạt động trơn tru.
- [ ] **(👤 A)** Frontend: Header thông tin ca chụp đầy đủ.
- [ ] **(👥 A + B)** Integration: End-to-end test flow (Create patient → Create scan → Upload image → View image).
- [ ] **(👥 A + B)** Integration: Prepare demo flow for instructor.
- [ ] **(👥 A + B)** Integration: Fix any UI/UX issues together.

---

## 6. Tổng Kết Cấu Trúc Thư Mục & File Để Dev (Danh sách chuẩn xác)

*Backend (Golang / Framework Gin / ORM GORM):*
- `app/backend/internal/dto/scan_dto.go` **(👤 A)**
- `app/backend/internal/dto/image_dto.go` **(👤 B)**
- `app/backend/internal/repos/scan_session_repo.go` **(👤 A)**
- `app/backend/internal/repos/image_repo.go` **(👤 B)**
- `app/backend/internal/services/scan_service.go` **(👤 A)**
- `app/backend/internal/services/image_service.go` **(👤 B)**
- `app/backend/internal/controllers/scan_controller.go` **(👤 A)**
- `app/backend/internal/controllers/image_controller.go` **(👤 B)**
- Sửa đổi router: `app/backend/cmd/main.go` **(👥 A + B)**

*Frontend (ReactJS / Vite / TypeScript):*
- `app/frontend/src/types/scan.ts` **(👤 A)**
- `app/frontend/src/types/image.ts` **(👤 B)**
- `app/frontend/src/services/scanService.ts` **(👤 A)**
- `app/frontend/src/services/imageService.ts` **(👤 B)**
- `app/frontend/src/pages/PatientDetailPage.tsx` **(👤 A)**
- `app/frontend/src/pages/ScanDetailPage.tsx` **(👤 A - Header, 👤 B - Upload/Gallery)**
- `app/frontend/src/components/common/ScanForm.tsx` **(👤 A)**
- `app/frontend/src/components/common/ImageViewer.tsx` **(👤 B)**
- Sửa đổi: `app/frontend/src/App.tsx` **(👤 A)**

Tài liệu này đóng vai trò là kim chỉ nam tối thượng để hoàn thành Phase 4 - mốc Demo quan trọng nhất của toàn bộ quá trình thực tập/đồ án dự án MedVisionHub. Làm theo từng bước thật cẩn thận, test từng block mã để đảm bảo khi Demo sẽ không phát sinh lỗi bất ngờ.
