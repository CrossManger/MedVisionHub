# Kế Hoạch Triển Khai Phase 6: Realtime Notifications & Polish

**Thời gian dự kiến:** ~2-3 ngày
**Mục tiêu chính:** Xây dựng hệ thống thông báo theo thời gian thực (Realtime Notifications) qua WebSocket khi có cập nhật quan trọng (ví dụ: hoàn tất chẩn đoán). Hoàn thiện (polish) trải nghiệm người dùng, đảm bảo UI/UX mượt mà trên cả Desktop và thiết bị di động (Mobile).

---

## 🎯 NEW Strategy Core Rules: Zero-Conflict File Ownership
1. **Mỗi file chỉ có DUY NHẤT 1 người sửa** - Không bao giờ 2 người sửa cùng 1 file trong cùng 1 phase.
2. **Permanent File Ownership:**
   - **A sở hữu**: `cmd/main.go`, `components/layout/Sidebar.tsx`
   - **B sở hữu**: `App.tsx`, `index.css`
3. Khi B cần thêm route vào main.go, B gửi hướng dẫn cho A. Khi A cần thêm page route vào App.tsx, A gửi hướng dẫn cho B.

Labeling: **(👤 A)**, **(👤 B)**, **(👥 A + B)**

---

## 🧑💻 Phân Công Nhiệm Vụ (Zero-Conflict)

Phase 6 split: **A = WebSocket + Notification Module, B = CompleteScan + Mobile Polish**

### 👤 A - WebSocket & Notification Module Owner:
**Backend:**
- Tạo mới: `internal/websocket/hub.go` (Chạy go get github.com/gorilla/websocket, Struct Hub, channel register, unregister, broadcast)
- Tạo mới: `internal/websocket/client.go` (Struct Client, ReadPump, WritePump)
- Tạo mới: `internal/websocket/handler.go` (HandleWebSocket nâng cấp kết nối HTTP, lấy JWT token)
- Tạo mới: `internal/repos/notification_repo.go` (Create, FindByUserID, MarkAsRead, CountUnread)
- Tạo mới: `internal/services/notification_service.go` (GetNotifications, MarkAsRead, CreateAndBroadcast)
- Tạo mới: `internal/controllers/notification_controller.go`
- Cập nhật: `cmd/main.go` - Init Hub, add WS route, notification REST routes, CompleteScan route (A sở hữu main.go)

**Frontend:**
- Tạo mới: `stores/notificationStore.ts` (state: list, unreadCount, wsConn)
- Tạo mới: `hooks/useWebSocket.ts` (kết nối WS dùng token từ authStore, lắng nghe onmessage, onclose)
- Tạo mới: `services/notificationService.ts` (getNotifications, markAsRead)
- Cập nhật: `components/layout/Header.tsx` - Thêm Bell icon + Badge + Dropdown (A sở hữu Header cho Phase 6)

### 👤 B - CompleteScan + Mobile Polish Module Owner:
**Backend:**
- Cập nhật: `internal/services/scan_service.go` - Thêm CompleteScan() method (B sở hữu scan_service cho Phase 6 update)
- Cập nhật: `internal/controllers/scan_controller.go` - Thêm CompleteScanHandler (B sở hữu scan_controller cho Phase 6 update)

**Frontend:**
- Cập nhật: `pages/ScanDetailPage.tsx` - Thêm nút "Hoàn tất chẩn đoán" + Modal kết quả (B sở hữu ScanDetailPage cho Phase 6)
- Tạo mới: `components/common/NotificationToast.tsx` (wrapper cho notification.open)
- Cập nhật: `components/layout/MainLayout.tsx` - Responsive Drawer cho mobile (B sở hữu MainLayout cho Phase 6)
- Cập nhật: `App.tsx` - Handle edge cases, Check token hết hạn, Empty states (B sở hữu App.tsx)
- Cập nhật: `index.css` - Mobile responsive styles (B sở hữu)

### File Ownership Table:
| File | Owner | Action |
|------|-------|--------|
| internal/websocket/hub.go | 👤 A | Tạo mới |
| internal/websocket/client.go | 👤 A | Tạo mới |
| internal/websocket/handler.go | 👤 A | Tạo mới |
| internal/repos/notification_repo.go | 👤 A | Tạo mới |
| internal/services/notification_service.go | 👤 A | Tạo mới |
| internal/controllers/notification_controller.go | 👤 A | Tạo mới |
| cmd/main.go | 👤 A | Cập nhật |
| stores/notificationStore.ts | 👤 A | Tạo mới |
| hooks/useWebSocket.ts | 👤 A | Tạo mới |
| services/notificationService.ts | 👤 A | Tạo mới |
| components/layout/Header.tsx | 👤 A | Cập nhật |
| internal/services/scan_service.go | 👤 B | Cập nhật |
| internal/controllers/scan_controller.go | 👤 B | Cập nhật |
| pages/ScanDetailPage.tsx | 👤 B | Cập nhật |
| components/common/NotificationToast.tsx | 👤 B | Tạo mới |
| components/layout/MainLayout.tsx | 👤 B | Cập nhật |
| App.tsx | 👤 B | Cập nhật |
| index.css | 👤 B | Cập nhật |

### Assignment table:
| Người | Module | Số file sở hữu | Ước tính |
|-------|--------|----------------|----------|
| 👤 A | WebSocket Hub + Notification | 11 files | 1.5 ngày |
| 👤 B | CompleteScan + Mobile Polish | 7 files | 1.5 ngày |
| 👥 A + B | E2E Realtime Test | - | 0.5 ngày |

---

## 3. Tích Hợp & Kiểm Thử (👥 A + B)

- **Test Realtime E2E:**
  - Bác sĩ bấm "Hoàn tất chẩn đoán", bệnh nhân phải lập tức nhận được WebSocket notification ở trình duyệt kia.
- **Mobile Responsive Test:**
  - Bật dev-tools mobile mode và kiểm tra thao tác Sidebar/Table/Form/Toast.
- **Documentation:**
  - Dọn dẹp code, update `docs/workflows.md` với biểu đồ luồng WebSocket Notification.
