# Chỉ mục Nghiên cứu (Research Index)

## Mục đích của thư mục \`research/\`
Thư mục \`research/\` là nơi lưu trữ các tài liệu, bài viết, phân tích công nghệ, và các POC (Proof of Concept) để hỗ trợ việc đưa ra quyết định kỹ thuật cho dự án MedVision Hub. Mọi nghiên cứu công nghệ phức tạp hoặc các vấn đề chưa rõ ràng sẽ được phân tích và lập hồ sơ tại đây trước khi tiến hành code thực tế.

## Các chủ đề nghiên cứu tiềm năng (Potential Research Topics)
Dưới đây là danh sách các chủ đề nghiên cứu liên quan mật thiết đến sự thành công của dự án:
1. **Định dạng hình ảnh y khoa:** Xử lý, đọc, và hiển thị định dạng DICOM trên môi trường web.
2. **AI Models cho phân vùng hình ảnh y khoa:** Tích hợp và chạy các mô hình như H-vmunet, nnMamba cho chức năng AI phân tích.
3. **Thực hành tốt nhất về WebSocket (WebSocket Best Practices):** Kiến trúc cho hệ thống thông báo thời gian thực hiệu suất cao, xử lý đứt kết nối (reconnection), và mở rộng.
4. **Bảo mật JWT (JWT Security Best Practices):** Lưu trữ token an toàn, cơ chế refresh token, và phòng chống XSS/CSRF.
5. **Design Patterns cho RBAC (Role-Based Access Control):** Cấu trúc database tối ưu cho phân quyền, caching quyền hạn để tăng tốc độ truy vấn.
6. **Bảo mật và Xác thực File Upload:** Quét virus, chống tải lên các file độc hại, giới hạn dung lượng và loại file.
7. **Responsive Design cho Ứng dụng Y tế:** Hiển thị an toàn và rõ ràng các thông tin sức khỏe/hình ảnh chụp trên màn hình điện thoại, máy tính bảng.

## Mẫu Tài liệu Nghiên cứu (Template for Future Research Documents)

Mỗi tài liệu nghiên cứu mới nên tuân theo cấu trúc sau:

```markdown
# Tiêu đề Nghiên cứu

## 1. Vấn đề (Problem Statement)
Mô tả tóm tắt vấn đề kỹ thuật cần giải quyết hoặc công nghệ cần tìm hiểu.

## 2. Các phương án tiếp cận (Approaches)
- **Phương án A:** Ưu điểm / Nhược điểm
- **Phương án B:** Ưu điểm / Nhược điểm

## 3. Quyết định (Decision)
Công nghệ/Giải pháp nào được chọn và lý do tại sao nó phù hợp với MedVision Hub.

## 4. Kế hoạch tích hợp (Integration Plan)
Các bước cơ bản để áp dụng vào hệ thống hiện tại.

## 5. Tài liệu tham khảo (References)
Các đường link, bài viết, tài liệu chính thức.
```
