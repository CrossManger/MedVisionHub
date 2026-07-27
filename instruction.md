Quyết định quay lại với **MedVision Hub** (Nền tảng Quản lý & Cổng dữ liệu Hình ảnh Y tế) là một lựa chọn cực kỳ an toàn và thực tế cho thời gian 3 tuần, đồng thời vẫn đảm bảo tính học thuật cao. 

Dưới đây là bản thiết kế chi tiết về kiến trúc (Architecture), cơ sở dữ liệu (Database), và luồng hoạt động (Flow) để 2 bạn có thể bắt tay vào code ngay.

### 1. Kiến trúc Hệ thống (System Architecture)

Dự án sẽ sử dụng mô hình Client-Server tiêu chuẩn, giao tiếp qua RESTful API và WebSocket.

*   **Frontend (ReactJS / TypeScript):**
    *   **Framework:** Sử dụng Vite để khởi tạo project nhanh và build tối ưu.
    *   **State Management:** Zustand hoặc Redux Toolkit (để quản lý state đăng nhập, thông báo).
    *   **UI/Styling:** TailwindCSS kết hợp với thư viện component như Ant Design hoặc MUI (giúp code responsive cho Mobile/Desktop nhanh gọn).
*   **Backend (Golang):**
    *   **Web Framework:** Gin hoặc Fiber (cực kỳ nhẹ và tốc độ cao).
    *   **ORM:** GORM để thao tác với Database.
    *   **Realtime:** Gorilla WebSocket cho tính năng Notification.
*   **Database:** PostgreSQL (khuyên dùng vì hỗ trợ cấu trúc dữ liệu phức tạp tốt) hoặc MySQL.
*   **Lưu trữ File (Storage):** Ở giai đoạn Demo, có thể lưu file ảnh trực tiếp vào thư mục local của server (Static File Serving). Sau này hoàn thiện có thể gắn AWS S3 hoặc Cloudinary.

### 2. Thiết kế Cơ sở dữ liệu (Database Schema)

Để đáp ứng đầy đủ yêu cầu CRUD và Permission CRUD, bạn cần thiết kế các bảng (Tables) lõi sau:

1.  **Users:** `ID`, `Username`, `Password_Hash`, `Email`, `Role_ID` (Khớp với tính năng Login, Register).
2.  **Roles & Permissions:** 
    *   Bảng `Roles`: Admin, Doctor, Patient.
    *   Bảng `Permissions`: Can_View_Patient, Can_Create_Patient, Can_Upload_Image, Can_Manage_System...
    *   Bảng trung gian `Role_Permissions` (Khớp với tính năng Permission Management CRUD).
3.  **Patients (Hồ sơ bệnh nhân):** `ID`, `User_ID` (Map với tài khoản nếu bệnh nhân tự đăng nhập), `Full_Name`, `DOB`, `Gender`, `Medical_History`.
4.  **Scan_Sessions (Ca chụp):** `ID`, `Patient_ID`, `Doctor_ID`, `Scan_Type` (MRI, X-Ray), `Status`, `Created_At`.
5.  **Images (Hình ảnh y tế):** `ID`, `Session_ID`, `File_URL`, `Diagnostic_Result` (Kết quả chẩn đoán).
6.  **Notifications:** `ID`, `User_ID`, `Message`, `Is_Read`, `Created_At`.

### 3. Luồng Nghiệp vụ Cốt lõi (System Flows)

**Luồng 1: Xác thực & Phân quyền (Auth & Permission Flow)**
*   Người dùng truy cập web (hỗ trợ cả giao diện Desktop và Mobile).
*   Thực hiện Login. Golang kiểm tra database, nếu đúng trả về JWT Token.
*   Frontend lưu Token. Mỗi khi Frontend gọi API (VD: *Thêm bệnh nhân*), backend Golang sẽ check Middleware: "User này có Role là gì? Role này có Permission `Can_Create_Patient` không?". Nếu không, trả về lỗi 403 Forbidden.
*   Admin có một màn hình riêng (CRUD Permission) để tích/bỏ tích các quyền của từng Role, cấu hình này lưu thẳng xuống Database.

**Luồng 2: Quản lý Bệnh nhân & Hình ảnh (Management CRUD)**
*   **Bác sĩ** tạo một Hồ sơ Bệnh nhân mới (Tạo bản ghi trong bảng `Patients`).
*   Bác sĩ tạo tiếp một Ca chụp (`Scan_Sessions`) cho bệnh nhân đó.
*   Bác sĩ upload ảnh. Quá trình này Golang tiếp nhận multipart/form-data, lưu file ảnh và tạo bản ghi vào bảng `Images`.
*   *(Góc mở rộng kỹ thuật)*: Hệ thống backend sau khi nhận ảnh có thể được thiết kế để mở rộng kết nối với các AI microservices (ví dụ gọi qua API Python) sử dụng các mô hình phân vùng ảnh y tế như H-vmunet hay nnMamba. Khi đó, hệ thống không chỉ lưu trữ mà có thể tự động chạy phân vùng khối u/bất thường, sau đó trả kết quả bounding box/mask về lưu trữ và hiển thị cho bác sĩ.

**Luồng 3: Thông báo Thời gian thực (Notification Flow)**
*   Khi Bác sĩ nhấn "Hoàn tất chẩn đoán" cho một ca chụp, backend Golang lưu kết quả vào Database.
*   Ngay lập tức, thông qua kết nối WebSocket đã mở, Golang bắn một event kèm message: *"Bác sĩ đã cập nhật kết quả X-quang của bạn"*.
*   Frontend (ReactJS) của Bệnh nhân (đang mở trên Mobile hoặc Desktop) nhận tín hiệu WebSocket và hiển thị pop-up/toast notification ở góc màn hình.

### 4. Kế hoạch Chạy Nước Rút (Roadmap)

Với đội hình 2 người, các bạn nên chia việc như sau để khớp với mốc 1 tuần Demo và 2 tuần hoàn thiện:

**Tuần 1: Chạy đua cho Demo (MVP)**
*   **BE:** Setup cấu trúc Gin/Fiber, tạo DB PostgreSQL. Làm API Login/Register, API tạo Bệnh nhân, API Upload ảnh. Chưa cần làm check quyền phức tạp, cứ cho qua hết để test luồng.
*   **FE:** Dựng khung UI (Header, Sidebar). Làm trang Login, trang Danh sách Bệnh nhân, và trang Chi tiết Bệnh nhân có chức năng chọn file tải ảnh lên.
*   *Mục tiêu Demo:* Show cho giảng viên xem việc đăng nhập thành công, tạo được một bệnh nhân và tải được một bức ảnh X-quang/MRI lên hiện ra màn hình.

**Tuần 2: Ráp hệ thống tính năng bắt buộc**
*   **BE:** Cài đặt JWT Middleware, viết API CRUD cho Permission (Cấp quyền). Viết luồng Forgot/Reset Password. Tích hợp Gorilla WebSocket.
*   **FE:** Xây dựng màn hình Admin quản lý quyền. Tích hợp WebSocket client để lắng nghe thông báo. Ráp logic chặn UI (ẩn nút Upload nếu tài khoản chỉ là Bệnh nhân).

**Tuần 3: Hoàn thiện & Tối ưu Trải nghiệm (UX/UI)**
*   Kiểm tra toàn bộ UI trên Mobile (đảm bảo bảng dữ liệu không bị tràn viền, thanh menu rút gọn thành Hamburger menu).
*   Testing bắt bug các trường hợp nhập sai form, upload nhầm file không phải là ảnh.
*   Trang trí thêm tính năng phụ ở trang xem ảnh (nút phóng to, thu nhỏ, xoay ảnh cơ bản).

Bộ khung này cover 100% yêu cầu của đề bài và có sự liên kết rất logic giữa các Entity với nhau. Các bạn có thể bám sát luồng này để chia task trên Trello hoặc Jira bắt đầu code luôn nhé!


Việc gom toàn bộ code web vào chung một thư mục `app` là một cách tổ chức rất gọn gàng, đặc biệt tiện lợi nếu sau này bạn muốn triển khai (deploy) toàn bộ ứng dụng bằng Docker (sử dụng docker-compose) hoặc thêm các thư mục khác như `mobile_app` hay `scripts`.

Dưới đây là file `AI_INSTRUCTIONS.md` đã được cập nhật lại phần **2. CẤU TRÚC THƯ MỤC DỰ ÁN** theo đúng yêu cầu của bạn:

```markdown
# MỤC TIÊU CỦA AI AGENT
Bạn là một AI Senior Fullstack Engineer (ReactJS/TypeScript & Golang). Nhiệm vụ của bạn là hỗ trợ nhóm chúng tôi (gồm 2 lập trình viên) xây dựng dự án "MedVision Hub" - Nền tảng Quản lý & Cổng dữ liệu Hình ảnh Y tế. 
Bạn cần tuân thủ nghiêm ngặt các quy ước về cấu trúc thư mục, nguồn dữ liệu chuẩn (Single Source of Truth) và lộ trình phát triển theo từng Phase dưới đây.

---

# 1. QUY ƯỚC LÀM VIỆC CỦA ĐỘI NGŨ
- **Team Size:** Dự án được phát triển bởi 2 lập trình viên chính và bạn (AI Agent) đóng vai trò là lập trình viên thứ 3 hỗ trợ sinh code, review code và thiết kế hệ thống.
- **Tư duy Code:** Code cần tối giản, dễ bảo trì, áp dụng đúng Design Patterns cho Golang (như Clean Architecture hoặc MVC) và Component-based cho ReactJS.
- **Quy trình Xác nhận:** Khi được yêu cầu code một tính năng mới, hãy luôn kiểm tra file tài liệu trong thư mục `docs/` và `ai_artifacts/` để đảm bảo không đi lệch hướng kiến trúc.

---

# 2. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)
Dự án phải luôn được duy trì theo cấu trúc sau. Bất kỳ khi nào tạo file mới, hãy đặt nó vào đúng vị trí này:

```text
medvision-hub/
│
├── ai_artifacts/           # (SINGLE SOURCE OF TRUTH) Chứa các file JSON/YAML/MD quy định chuẩn code, schema database gốc, và API contracts do AI sinh ra hoặc quản lý.
│   ├── db_schema.yaml
│   ├── api_contracts.json
│   └── code_conventions.md
│
├── docs/                   # Tài liệu mô tả hệ thống dành cho con người và AI đọc hiểu
│   ├── architecture.md     # Kiến trúc Client-Server, thiết kế mở rộng tích hợp microservices xử lý ảnh y tế.
│   ├── workflows.md        # Luồng hoạt động (Auth flow, Permission flow, Image upload flow).
│   └── database_erd.md     # Mô tả thực thể và quan hệ cơ sở dữ liệu.
│
├── app/                    # 📦 Toàn bộ source code của ứng dụng Web
│   │
│   ├── frontend/           # Workspace cho ReactJS (Vite + TypeScript + Tailwind)
│   │   ├── src/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── pages/      # Page views (Dashboard, PatientList, ScanDetails)
│   │   │   ├── stores/     # State management (Zustand/Redux)
│   │   │   └── services/   # API call logic
│   │   └── package.json
│   │
│   └── backend/            # Workspace cho Golang (Gin/Fiber + GORM)
│       ├── cmd/            # Entry point (main.go)
│       ├── internal/
│       │   ├── controllers/# Xử lý HTTP requests
│       │   ├── models/     # Định nghĩa Database Models/Structs
│       │   ├── repos/      # Giao tiếp với Database
│       │   ├── services/   # Xử lý Business Logic
│       │   └── middlewares/# JWT Auth, RBAC Permissions
│       ├── pkg/            # Các tiện ích dùng chung (Logger, Config)
│       └── go.mod
│
└── README.md               # Tổng quan dự án, cách setup môi trường, cách run frontend/backend và thông tin thành viên.
```

---

# 3. LỘ TRÌNH PHÁT TRIỂN (DEVELOPMENT PHASES)
Chúng ta sẽ code cuốn chiếu theo từng Phase. AI Agent không được tự ý sinh code của Phase sau nếu Phase trước chưa được xác nhận hoàn thành.

## Phase 1: Project Setup & Boilerplate (~1 ngày)
*Mục tiêu: Chạy được cả Frontend và Backend ở local, kết nối Database thành công.*
*Công việc yêu cầu:*
- Khởi tạo thư mục, setup boilerplate cho cả Frontend và Backend bên trong thư mục `app/`.
- Viết `README.md` tổng quan dự án.
- Thiết kế Data Schema cơ bản lưu vào `ai_artifacts/db_schema.yaml`.
- **Backend:** Khởi tạo project Go (go mod init), cài Gin + GORM, kết nối PostgreSQL, chạy AutoMigrate tạo bảng, seed data cho Roles & Permissions.
- **Frontend:** Khởi tạo Vite + React + TypeScript, cài TailwindCSS + Ant Design, dựng Layout chính (Header, Sidebar), cấu hình React Router.
- *Tiêu chí hoàn thành:* `go run cmd/main.go` chạy thành công trên port 8080, `npm run dev` hiện trang Hello World trên port 5173, database có đủ các bảng.

## Phase 2: Authentication (Đăng nhập / Đăng ký) (~2-3 ngày)
*Mục tiêu: User có thể đăng ký, đăng nhập và được cấp JWT token.*
*Công việc yêu cầu:*
- **Backend:** API `POST /auth/register` (hash password bằng bcrypt, tạo user). API `POST /auth/login` (verify password, trả JWT token kèm thông tin user + role). Viết JWT middleware cơ bản (chỉ verify token, chưa check permission).
- **Frontend:** Trang Đăng nhập (Login Page) với form username + password. Trang Đăng ký (Register Page). Lưu JWT token vào localStorage/Zustand store. Redirect về Dashboard sau khi login thành công. Hiển thị thông tin user đang đăng nhập trên Header.
- *Tiêu chí hoàn thành:* Đăng ký tài khoản mới → Đăng nhập thành công → Vào được Dashboard → Refresh trang vẫn giữ phiên đăng nhập.

## Phase 3: Patient Management CRUD (~2-3 ngày)
*Mục tiêu: Bác sĩ có thể tạo, xem, sửa, xóa hồ sơ bệnh nhân.*
*Công việc yêu cầu:*
- **Backend:** API `GET /patients` (danh sách, phân trang, tìm kiếm). API `POST /patients` (tạo mới). API `GET /patients/:id` (xem chi tiết). API `PUT /patients/:id` (cập nhật). API `DELETE /patients/:id` (xóa). Tất cả API yêu cầu JWT token hợp lệ.
- **Frontend:** Trang Danh sách Bệnh nhân (bảng dữ liệu có phân trang, ô tìm kiếm). Modal/Form tạo bệnh nhân mới. Trang Chi tiết Bệnh nhân. Chức năng sửa và xóa hồ sơ.
- *Tiêu chí hoàn thành:* CRUD đầy đủ hoạt động end-to-end từ UI → API → Database. Có phân trang và tìm kiếm.

## Phase 4: Scan Sessions & Image Upload (~2-3 ngày)
*Mục tiêu: Bác sĩ có thể tạo ca chụp và upload/xem hình ảnh y tế.*
*Công việc yêu cầu:*
- **Backend:** API `POST /patients/:patient_id/scans` (tạo ca chụp). API `GET /patients/:patient_id/scans` (danh sách ca chụp). API `POST /scans/:scan_id/images` (upload ảnh, multipart/form-data, lưu vào thư mục `uploads/`). API `GET /scans/:scan_id/images` (danh sách ảnh). API `DELETE /images/:id` (xóa ảnh). Static file serving cho thư mục `uploads/`.
- **Frontend:** Giao diện tạo Ca chụp mới (chọn loại: X-Ray, MRI, CT Scan, Ultrasound). Form upload ảnh (kéo thả hoặc chọn file, validate định dạng + kích thước). Gallery xem danh sách ảnh của ca chụp. Image Viewer cơ bản (phóng to, thu nhỏ, xoay ảnh).
- *Tiêu chí hoàn thành:* Tạo ca chụp → Upload ảnh → Xem ảnh hiển thị đúng trên UI. **Đây là mốc Demo cho giảng viên.**

## Phase 5: RBAC & Permission Management (~2-3 ngày)
*Mục tiêu: Phân quyền truy cập theo Role và Admin có thể quản lý quyền.*
*Công việc yêu cầu:*
- **Backend:** Nâng cấp JWT Middleware thành RBAC Middleware (check permission trên từng API endpoint). API `GET /admin/roles` (danh sách roles kèm permissions). API `GET /admin/permissions` (tất cả permissions). API `PUT /admin/roles/:role_id/permissions` (cập nhật permission cho role). API `POST /auth/forgot-password` và `POST /auth/reset-password`.
- **Frontend:** Trang Admin quản lý quyền (Permission Matrix: bảng checkbox Role × Permission). Ẩn/hiện nút và menu sidebar dựa trên permissions của user đang đăng nhập (VD: Patient không thấy nút "Upload ảnh", không thấy menu "Quản lý quyền"). Trang Quên mật khẩu / Đặt lại mật khẩu.
- Bổ sung tài liệu vào `docs/workflows.md`.
- *Tiêu chí hoàn thành:* Đăng nhập bằng tài khoản Patient → KHÔNG thấy nút tạo bệnh nhân, KHÔNG upload được ảnh. Admin vào trang Permission → bỏ tích quyền của Doctor → Doctor mất quyền tương ứng ngay lập tức.

## Phase 6: Realtime Notifications & Polish (~2-3 ngày)
*Mục tiêu: Thông báo realtime + Hoàn thiện UI/UX cho cả Desktop và Mobile.*
*Công việc yêu cầu:*
- **Backend:** Tích hợp Gorilla WebSocket Hub (quản lý kết nối theo user_id). API `GET /notifications` (danh sách thông báo). API `PUT /notifications/:id/read` (đánh dấu đã đọc). API `PUT /scans/:id/complete` (hoàn tất chẩn đoán → trigger notification). Khi scan hoàn tất, tự động tạo notification record và broadcast qua WebSocket.
- **Frontend:** Kết nối WebSocket client khi user đăng nhập. Hiển thị Toast/Pop-up Notification khi nhận event realtime. Icon chuông thông báo trên Header (badge đếm số chưa đọc). Dropdown danh sách thông báo. Tối ưu Responsive UI cho Mobile (Hamburger menu, bảng không tràn viền). Xử lý edge cases (báo lỗi form, file upload sai định dạng, token hết hạn).
- *Tiêu chí hoàn thành:* Bác sĩ nhấn "Hoàn tất chẩn đoán" → Bệnh nhân nhận được toast notification ngay lập tức. UI chạy mượt trên cả Desktop và Mobile.

---

