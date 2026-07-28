# Kho Component UI (Component Inventory)

Danh sách tổng hợp toàn bộ các UI components (đã có và dự kiến) trong dự án Frontend.

## 1. Layout Components (Vỏ bọc ứng dụng)

| Tên Component | Đường dẫn (Path) | Giai đoạn | Trạng thái | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| **MainLayout** | `components/layout/MainLayout.tsx` | Phase 1 | ✅ Hoàn thành | Layout chính bọc toàn bộ app (sau khi login) |
| **Header** | `components/layout/Header.tsx` | Phase 1 | ✅ Hoàn thành | Thanh điều hướng trên cùng, user menu, bell thông báo |
| **Sidebar** | `components/layout/Sidebar.tsx` | Phase 1 | ✅ Hoàn thành | Menu điều hướng bên trái |
| **AuthLayout** | `components/layout/AuthLayout.tsx` | Phase 2 | 🔲 Chưa làm | Layout dành riêng cho các trang Login/Register |

## 2. Common Components (Thành phần dùng chung)

| Tên Component | Đường dẫn (Path) | Giai đoạn | Trạng thái | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| **PatientForm** | `components/common/PatientForm.tsx` | Phase 3 | 🔲 Chưa làm | Form thêm mới hoặc chỉnh sửa bệnh nhân |
| **ScanForm** | `components/common/ScanForm.tsx` | Phase 4 | 🔲 Chưa làm | Form tạo thông tin ca chụp y khoa |
| **ImageViewer** | `components/common/ImageViewer.tsx`| Phase 4 | 🔲 Chưa làm | Component hiển thị, zoom, pan hình ảnh/DICOM |
| **NotificationToast** | `components/common/NotificationToast.tsx`| Phase 6 | 🔲 Chưa làm | Popup thông báo ở góc màn hình |
| **DataTable** | `components/common/DataTable.tsx` | Phase 1/3 | 🔲 Chưa làm | Bảng dữ liệu dùng chung (bọc Ant Design Table) |

## 3. Page Components (Thành phần trang)

| Tên Component | Đường dẫn (Path) | Giai đoạn | Trạng thái | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| **LoginPage** | `pages/Login/index.tsx` | Phase 2 | 🔲 Chưa làm | Trang Đăng nhập |
| **RegisterPage** | `pages/Register/index.tsx` | Phase 2 | 🔲 Chưa làm | Trang Đăng ký |
| **DashboardPage** | `pages/Dashboard/index.tsx` | Phase 1 | ✅ Hoàn thành | Màn hình Dashboard tổng quan |
| **PatientListPage** | `pages/Patients/List.tsx` | Phase 3 | 🔲 Chưa làm | Màn hình danh sách bệnh nhân |
| **PatientDetailPage** | `pages/Patients/Detail.tsx`| Phase 3 | 🔲 Chưa làm | Màn hình chi tiết bệnh nhân |
| **ScanDetailPage** | `pages/Scans/Detail.tsx` | Phase 4 | 🔲 Chưa làm | Màn hình chi tiết ca chụp |
| **PermissionsPage** | `pages/Admin/Permissions.tsx` | Phase 5 | 🔲 Chưa làm | Màn hình quản lý phân quyền (Admin) |
| **NotFoundPage** | `pages/NotFound/index.tsx` | Phase 1 | ✅ Hoàn thành | Trang 404 |
