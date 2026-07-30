# Kiến trúc Module Frontend (Frontend Modules Skeletons)

Tài liệu này định nghĩa cấu trúc và ranh giới trách nhiệm của các module trong thư mục `src/` của dự án ReactJS.

## 1. `components/layout/` (App Shell)
- **Trách nhiệm:** Chứa các components định hình cấu trúc chung của ứng dụng, thường là những thành phần không thay đổi khi chuyển trang.
- **File naming:** `[Name]Layout.tsx`, `Header.tsx`, `Sidebar.tsx`.

## 2. `components/common/` (Reusable UI)
- **Trách nhiệm:** Chứa các components độc lập, có khả năng tái sử dụng cao trên nhiều trang khác nhau (VD: Buttons, Modals, DataTables có tính custom cao, Forms).
- **File naming:** Viết hoa chữ cái đầu (PascalCase), ví dụ: `PatientForm.tsx`, `ImageViewer.tsx`.

## 3. `pages/` (Route-level Views)
- **Trách nhiệm:** Các components đóng vai trò là màn hình toàn trang. Chúng kết hợp layout, common components và kết nối với store/services để hiển thị dữ liệu cho một route cụ thể.
- **Quy ước:** Gom nhóm theo tính năng, ví dụ thư mục `Patients/` chứa `List.tsx`, `Detail.tsx`.
- **File naming:** `index.tsx` cho trang chính, hoặc `[ViewName].tsx`.

## 4. `services/` (API Calls)
- **Trách nhiệm:** Chứa logic giao tiếp trực tiếp với Backend APIs (sử dụng Axios hoặc Fetch). Trả về dữ liệu thô.
- **File naming:** `[module].service.ts` (VD: `auth.service.ts`, `patient.service.ts`).

## 5. `stores/` (Global State)
- **Trách nhiệm:** Quản lý trạng thái toàn cục của ứng dụng bằng Zustand.
- **File naming:** `[module]Store.ts` (VD: `useAuthStore.ts`, `useAppStore.ts`).

## 6. `types/` (TypeScript Types)
- **Trách nhiệm:** Định nghĩa các interfaces, types, enums dùng chung cho toàn dự án. Map tương ứng với DTO/Models của Backend.
- **File naming:** `[module].d.ts` hoặc `[module].type.ts` (VD: `patient.type.ts`).

## 7. `hooks/` (Custom Hooks)
- **Trách nhiệm:** Đóng gói các logic React (use state, use effect) có thể tái sử dụng.
- **File naming:** `use[Name].ts` (VD: `useWebSocket.ts`, `usePermissions.ts`).

## 8. `utils/` (Helpers)
- **Trách nhiệm:** Các hàm tiện ích thuần túy (pure functions) như format ngày tháng, xử lý chuỗi, tính toán. Không chứa React logic.
- **File naming:** `[name].ts` (VD: `formatters.ts`, `validators.ts`).
