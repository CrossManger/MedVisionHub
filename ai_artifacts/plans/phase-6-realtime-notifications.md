# Kế Hoạch Triển Khai Phase 6: Realtime Notifications & Polish

## ✅ TRẠNG THÁI: HOÀN THÀNH — 2026-07-30

**Thời gian dự kiến:** ~2-3 ngày
**Thời gian thực tế:** ~1 ngày (Hoàn thành cả Module A & B)
**Mục tiêu chính:** Xây dựng hệ thống thông báo theo thời gian thực (Realtime Notifications) qua WebSocket khi có cập nhật quan trọng (ví dụ: hoàn tất chẩn đoán). Hoàn thiện (polish) trải nghiệm người dùng, đảm bảo UI/UX mượt mà trên cả Desktop và thiết bị di động (Mobile).

---

## 🎯 NEW Strategy Core Rules: Zero-Conflict File Ownership

1. **Mỗi file chỉ có DUY NHẤT 1 người sửa** - Không bao giờ 2 người sửa cùng 1 file trong cùng 1 phase.
2. **Permanent File Ownership:**
   - **A sở hữu**: `cmd/main.go`, `components/layout/AppSidebar.tsx`
   - **B sở hữu**: `App.tsx`, `index.css`
3. Khi B cần thêm route vào main.go, B gửi hướng dẫn cho A. Khi A cần thêm page route vào App.tsx, A gửi hướng dẫn cho B.

Labeling: **(👤 A)**, **(👤 B)**, **(👥 A + B)**

---

## 🧑‍💻 Phân Công Nhiệm Vụ (Zero-Conflict) — ✅ ĐÃ HOÀN THÀNH 100%

Phase 6 split: **A = WebSocket + Notification Module, B = CompleteScan + Mobile Polish**

### 👤 A - WebSocket & Notification Module Owner (✅ HOÀN THÀNH 100%):

**Backend:**
- [x] **Tạo mới:** `internal/websocket/hub.go` (Cấu hình `gorilla/websocket` v1.5.3, Struct Hub, channel register/unregister, `SendToUser` đẩy tin theo UserID)
- [x] **Tạo mới:** `internal/websocket/client.go` (Struct Client, ReadPump, WritePump xử lý Ping/Pong heartbeat)
- [x] **Tạo mới:** `internal/websocket/handler.go` (`ServeWS` nâng cấp kết nối HTTP -> WS, xác thực JWT token từ `?token=xxx`)
- [x] **Tạo mới:** `internal/repos/notification_repo.go` (`Create`, `FindByUserID`, `MarkAsRead`, `CountUnread`)
- [x] **Tạo mới:** `internal/dto/notification_dto.go` (`NotificationResponse`, `NotificationListResponse`)
- [x] **Tạo mới:** `internal/services/notification_service.go` (`GetNotifications`, `MarkAsRead`, `CreateAndBroadcast`)
- [x] **Tạo mới:** `internal/controllers/notification_controller.go` (`GetNotifications`, `MarkAsRead`)
- [x] **Cập nhật:** `cmd/main.go` - Init WebSocket Hub (`go wsHub.Run()`), wire-up route `/ws/notifications`, REST routes `GET /api/v1/notifications` và `PUT /api/v1/notifications/:id/read`

**Frontend:**
- [x] **Tạo mới:** `types/notification.ts` (`NotificationItem`, `NotificationListResponse` interfaces)
- [x] **Tạo mới:** `services/notificationService.ts` (`getNotifications`, `markAsRead`)
- [x] **Tạo mới:** `stores/notificationStore.ts` (Zustand state: `notifications`, `unreadCount`, `fetchNotifications`, `markAsRead`, `addNotification`)
- [x] **Tạo mới:** `hooks/useWebSocket.ts` (Custom React Hook kết nối WebSocket dùng JWT token, tự động reconnect, lắng nghe tin nhắn & hiển thị Ant Design Toast Popup)
- [x] **Cập nhật:** `components/layout/AppHeader.tsx` - Tích hợp `useWebSocket()`, Biểu tượng Chuông (`BellOutlined`) kèm Badge `unreadCount` & Dropdown danh sách thông báo realtime, click chuyển thẳng tới ca chụp

---

### 👤 B - CompleteScan + Mobile Polish Module Owner (✅ HOÀN THÀNH 100%):

**Backend:**
- [x] **Cập nhật:** `internal/services/scan_service.go` - Thêm `CompleteScan()` method (Tự động trigger `CreateAndBroadcast` gửi thông báo WebSocket tới Bệnh nhân)
- [x] **Cập nhật:** `internal/controllers/scan_controller.go` - Thêm handler `CompleteScan` (`PUT /api/v1/scans/:id/complete`)

**Frontend:**
- [x] **Cập nhật:** `types/scan.ts` - Thêm `diagnostic_result` vào `ScanSession` và `CompleteScanRequest` interface
- [x] **Cập nhật:** `services/scanService.ts` - Thêm `complete(scanId, data)` gọi API `PUT /scans/:id/complete`
- [x] **Cập nhật:** `pages/ScanDetailPage.tsx` - Nút **"Hoàn tất chẩn đoán"** (Màu xanh dương/lá) cho Bác sĩ + Modal nhập kết quả chẩn đoán + Banner hiển thị kết quả chẩn đoán màu xanh
- [x] **Cập nhật:** `components/layout/MainLayout.tsx` - Responsive styling, tối ưu trải nghiệm trên thiết bị di động Mobile

---

### Bảng Kiểm Tra Quyền Sở Hữu File (File Ownership Table):

| File | Owner | Action | Trạng thái |
|------|-------|--------|:----------:|
| `internal/websocket/hub.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `internal/websocket/client.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `internal/websocket/handler.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `internal/repos/notification_repo.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `internal/dto/notification_dto.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `internal/services/notification_service.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `internal/controllers/notification_controller.go` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `cmd/main.go` | 👤 A | Cập nhật | ✅ HOÀN THÀNH |
| `types/notification.ts` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `services/notificationService.ts` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `stores/notificationStore.ts` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `hooks/useWebSocket.ts` | 👤 A | Tạo mới | ✅ HOÀN THÀNH |
| `components/layout/AppHeader.tsx` | 👤 A | Cập nhật | ✅ HOÀN THÀNH |
| `internal/services/scan_service.go` | 👤 B | Cập nhật | ✅ HOÀN THÀNH |
| `internal/controllers/scan_controller.go` | 👤 B | Cập nhật | ✅ HOÀN THÀNH |
| `types/scan.ts` | 👤 B | Cập nhật | ✅ HOÀN THÀNH |
| `services/scanService.ts` | 👤 B | Cập nhật | ✅ HOÀN THÀNH |
| `pages/ScanDetailPage.tsx` | 👤 B | Cập nhật | ✅ HOÀN THÀNH |
| `components/layout/MainLayout.tsx` | 👤 B | Cập nhật | ✅ HOÀN THÀNH |

---

### Bảng Tổng Kết Phân Công & Tiến Độ (Assignment Table):

| Người | Module | Số file sở hữu | Ước tính | Trạng thái |
|-------|--------|----------------|----------|:----------:|
| 👤 A | WebSocket Hub + Notification | 13 files | 1.5 ngày | ✅ 100% HOÀN THÀNH |
| 👤 B | CompleteScan + Mobile Polish | 6 files | 1.5 ngày | ✅ 100% HOÀN THÀNH |
| 👥 A + B | E2E Realtime Test | - | 0.5 ngày | ✅ 100% HOÀN THÀNH |
