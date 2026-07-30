# MedVisionHub - Kế Hoạch Triển Khai (Implementation Plans)

## Tổng quan
Thư mục `plans/` chứa các tài liệu chi tiết về kế hoạch phát triển và triển khai cho từng giai đoạn (phase) của dự án **MedVisionHub - Nền tảng Quản lý & Cổng dữ liệu Hình ảnh Y tế**. 
Các tài liệu này phục vụ như một bản thiết kế (blueprint) và hướng dẫn thực thi (runbook) cho đội ngũ phát triển (2 developers + AI Agent).

## ⚠️ CHIẾN LƯỢC ZERO-CONFLICT FILE OWNERSHIP (Áp dụng từ Phase 3)

> **Bài học từ Phase 2:** Cả A và B cùng sửa chung các file (`auth_service.go`, `auth_dto.go`, `user_repo.go`, `main.go`) dẫn đến **hàng loạt Git Conflict**, ảnh hưởng nghiêm trọng đến tốc độ phát triển.

### Quy tắc vàng: "Mỗi file chỉ có DUY NHẤT 1 người sửa"

### 🔒 Quyền Sở Hữu File Cố Định (Permanent File Ownership)
| File | Người sở hữu | Lý do |
|------|---------------|-------|
| `cmd/main.go` | 👤 A | Đăng ký routes, init services, middleware |
| `components/layout/Sidebar.tsx` | 👤 A | Menu navigation theo quyền |
| `App.tsx` | 👤 B | React Router, page routes |
| `index.css` | 👤 B | Global styles, responsive |

### 📋 Quy trình khi cần sửa file của người khác
1. **B cần thêm route vào `main.go`** → B tạo controller xong, gửi tin nhắn cho A: *"Anh ơi wire-up giúp em route `GET /admin/roles` vào `permissionController.GetRoles` nhé"*.
2. **A cần thêm page route vào `App.tsx`** → A tạo page xong, gửi tin nhắn cho B: *"Bạn thêm giúp route `/scans/:id` → `ScanDetailPage` vào App.tsx nhé"*.

### 🗺️ Chiến Lược Chia Việc Theo Phase

| Phase | Chiến lược | 👤 A sở hữu | 👤 B sở hữu |
|-------|-----------|-------------|-------------|
| **Phase 3** | Layer split (BE/FE) | Toàn bộ file Go (Patient backend) | Toàn bộ file TS/TSX (Patient frontend) |
| **Phase 4** | Module split | Scan module (BE+FE) | Image module (BE+FE) |
| **Phase 5** | Module split | RBAC middleware + UI guards | Permission admin + Forgot password |
| **Phase 6** | Module split | WebSocket + Notification | CompleteScan + Mobile polish |

---

## 👥 Phân Công Đội Ngũ
- **Người A:** Backend specialist, sở hữu `main.go` và `Sidebar.tsx`.
- **Người B:** Frontend specialist, sở hữu `App.tsx` và `index.css`.
- **AI Agent:** Trợ lý hỗ trợ cả hai, sinh code, review, tư vấn kiến trúc.

## Danh sách các giai đoạn (Phases)

1. **[Phase 1: Project Setup & Boilerplate](phase-1-project-setup.md)**
   - Khởi tạo dự án Frontend và Backend. Cấu hình các công cụ cơ bản, kết nối cơ sở dữ liệu và dựng layout cho giao diện.
2. **[Phase 2: Authentication](phase-2-authentication.md)**
   - Xây dựng hệ thống đăng ký, đăng nhập và phân quyền cơ bản với JWT token.
3. **[Phase 3: Patient Management](phase-3-patient-management.md)**
   - Quản lý hồ sơ bệnh nhân (CRUD) dành cho bác sĩ và quản trị viên.
4. **[Phase 4: Scan Sessions & Image Data](phase-4-scan-image-upload.md)**
   - Quản lý các phiên chụp (Scan Sessions) và tải lên/hiển thị hình ảnh y tế.
5. **[Phase 5: Role & Permission Management](phase-5-rbac-permissions.md)**
   - Cung cấp API và giao diện cho Admin để cấu hình Role và Permission động; thêm tính năng Quên/Đặt lại mật khẩu.
6. **[Phase 6: Real-time Notifications](phase-6-realtime-notifications.md)**
   - Tích hợp thông báo theo thời gian thực (WebSocket) khi có kết quả chụp hoặc cập nhật quan trọng.

## Hướng dẫn sử dụng tài liệu
- **Đọc kỹ trước khi thực thi**: Đọc toàn bộ tài liệu Phase, đặc biệt là bảng **File Ownership** để biết mình được phép sửa file nào.
- **Thực hiện theo trình tự**: Hoàn thành Phase N trước khi sang Phase N+1.
- **Kiểm tra bảng File Ownership**: Trước khi sửa bất kỳ file nào, kiểm tra xem mình có quyền sở hữu file đó không.
- **Tuân thủ Architecture**: Bám sát cấu trúc thư mục đã định sẵn.

## Bảng theo dõi tiến độ (Status Tracker)

| Giai đoạn | Tính năng chính | Trạng thái | A (%) | B (%) | Tổng (%) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Phase 1** | Project Setup & Boilerplate | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 2** | Authentication (Login/Register) | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 3** | Patient Management | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 4** | Scan Sessions & Image Data | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 5** | Role & Permission Management | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 6** | Real-time Notifications | ✅ COMPLETED | 100% | 100% | 100% |

---
*Cập nhật lần cuối: 2026-07-30 (Phase 6 hoàn thành 100% — Realtime WebSocket & CompleteScan integrated)*
