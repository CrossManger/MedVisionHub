# MedVisionHub - Kế Hoạch Triển Khai (Implementation Plans)

## Tổng quan
Thư mục `plans/` chứa các tài liệu chi tiết về kế hoạch phát triển và triển khai cho từng giai đoạn (phase) của dự án **MedVisionHub - Nền tảng Quản lý & Cổng dữ liệu Hình ảnh Y tế**. 
Các tài liệu này phục vụ như một bản thiết kế (blueprint) và hướng dẫn thực thi (runbook) cho đội ngũ phát triển (2 developers + AI Agent). Việc ghi chép lại chi tiết quá trình thiết kế, kiến trúc và phân chia nhiệm vụ sẽ đảm bảo tính đồng nhất về code, giúp AI Agent dễ dàng nắm bắt ngữ cảnh và phối hợp nhịp nhàng với đội ngũ kỹ sư.

## 👥 Phân Công Đội Ngũ (Task Assignment)
Dự án được phân chia cho 2 developer chính cùng với sự hỗ trợ của AI Agent:
- **Người A (Backend Lead):** Chịu trách nhiệm Backend (Golang - Gin, GORM, PostgreSQL, JWT).
- **Người B (Frontend Lead):** Chịu trách nhiệm Frontend (ReactJS, TypeScript, TailwindCSS, Ant Design, Zustand).
- **Cả hai (A + B):** Cùng tham gia vào các task chung như setup dự án, review code, testing (đặc biệt là integration testing giữa FE và BE), và deployment. Phân chia đều thời gian và độ phức tạp.
- **AI Agent:** Đóng vai trò trợ lý hỗ trợ cả hai, giúp sinh boilerplate code, phân tích lỗi, review PRs, và tư vấn kiến trúc.

## Danh sách các giai đoạn (Phases)

1. **[Phase 1: Project Setup & Boilerplate](phase-1-project-setup.md)**
   - Khởi tạo dự án Frontend và Backend. Cấu hình các công cụ cơ bản, kết nối cơ sở dữ liệu và dựng layout cho giao diện.
2. **[Phase 2: Authentication](phase-2-authentication.md)**
   - Xây dựng hệ thống đăng ký, đăng nhập và phân quyền cơ bản với JWT token.
3. **[Phase 3: Patient Management (Dự kiến)](phase-3-patient-management.md)**
   - Quản lý hồ sơ bệnh nhân (CRUD) dành cho bác sĩ và quản trị viên.
4. **[Phase 4: Scan Sessions & Image Data (Dự kiến)](phase-4-scan-sessions.md)**
   - Quản lý các phiên chụp (Scan Sessions) và tải lên/hiển thị hình ảnh y tế.
5. **[Phase 5: Role & Permission Management (Dự kiến)](phase-5-roles-permissions.md)**
   - Cung cấp API và giao diện cho Admin để cấu hình Role và Permission động; thêm tính năng Quên/Đặt lại mật khẩu.
6. **[Phase 6: Real-time Notifications (Dự kiến)](phase-6-notifications.md)**
   - Tích hợp thông báo theo thời gian thực (WebSocket) khi có kết quả chụp hoặc cập nhật quan trọng.

## Hướng dẫn sử dụng tài liệu
- **Đọc kỹ trước khi thực thi**: Mỗi tài liệu phase sẽ chứa "Danh sách công việc chi tiết", "Yêu cầu trước" và "Files cần tạo/sửa". Vui lòng đọc kỹ toàn bộ tài liệu trước khi bắt đầu code. Việc này đặc biệt quan trọng đối với AI Agent để hiểu rõ API Contracts và DB Schema trước khi implement.
- **Thực hiện theo trình tự**: Các phase được thiết kế để thực hiện nối tiếp nhau. Vui lòng hoàn thành đầy đủ Phase N (các tests phải pass, tiêu chí hoàn thành được đáp ứng) trước khi chuyển sang Phase N+1.
- **Cập nhật trạng thái**: Khi hoàn thành các task, hãy cập nhật trạng thái trong bảng tiến độ ở file này và đánh dấu check (`[x]`) vào danh sách Checklist kiểm tra trong từng file kế hoạch.
- **Tuân thủ Architecture**: Luôn bám sát cấu trúc thư mục đã định sẵn ở Phase 1. Mọi sự thay đổi về kiến trúc thư mục cần được thống nhất giữa toàn đội và cập nhật lại vào tài liệu.

## Bảng theo dõi tiến độ (Status Tracker)

Dưới đây là bảng theo dõi tiến độ tổng thể của toàn bộ dự án MedVisionHub:

| Giai đoạn | Tính năng chính | Trạng thái | A (%) | B (%) | Tổng (%) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Phase 1** | Project Setup & Boilerplate | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 2** | Authentication (Login/Register) | ✅ COMPLETED | 100% | 100% | 100% |
| **Phase 3** | Patient Management | ⏳ NOT STARTED | 0% | 0% | 0% |
| **Phase 4** | Scan Sessions & Image Data | ⏳ NOT STARTED | 0% | 0% | 0% |
| **Phase 5** | Role & Permission Management | ⏳ NOT STARTED | 0% | 0% | 0% |
| **Phase 6** | Real-time Notifications | ⏳ NOT STARTED | 0% | 0% | 0% |

---
*Cập nhật lần cuối: Xem lịch sử git*
