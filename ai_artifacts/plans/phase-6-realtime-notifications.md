# Kế Hoạch Triển Khai Phase 6: Realtime Notifications & Polish

**Thời gian dự kiến:** ~2-3 ngày
**Mục tiêu chính:** Xây dựng hệ thống thông báo theo thời gian thực (Realtime Notifications) qua WebSocket khi có cập nhật quan trọng (ví dụ: hoàn tất chẩn đoán). Hoàn thiện (polish) trải nghiệm người dùng, đảm bảo UI/UX mượt mà trên cả Desktop và thiết bị di động (Mobile).

---

## 🧑💻 Phân Công Nhiệm Vụ (Feature-based: Full-stack)

Cả A và B đều là full-stack developers. Mỗi người đảm nhận toàn bộ MỘT TÍNH NĂNG bao gồm cả backend API và frontend UI.

| Người | Feature | Backend tasks | Frontend tasks | Ước tính |
|-------|---------|---------------|----------------|----------|
| 👤 A | WebSocket Hub + Notification Bell | websocket/hub.go, client.go, handler.go, notification_repo, notification_service, notification routes, Hub init in main.go | notificationStore.ts, useWebSocket.ts, Header bell+dropdown, notificationService.ts | 1.5 ngày |
| 👤 B | Complete Scan + Mobile Polish | scan_service CompleteScan(), CompleteScanHandler, PUT /scans/:id/complete route | ScanDetailPage complete button+modal, Responsive UI (mobile drawer, table scroll, form), NotificationToast.tsx, edge cases handling | 1.5 ngày |
| 👥 A + B | E2E Realtime Test + Polish | - | - | 0.5 ngày |

---

## 1. Tính Năng 1: WebSocket Hub & Notification Bell UI (👤 A)

**Người đảm nhận: 👤 A (Full-stack)**

### Backend Tasks (👤 A - BE)
- **Khởi tạo WebSocket Hub:**
  - Chạy `go get github.com/gorilla/websocket`.
  - `internal/websocket/hub.go`: Struct `Hub` với `clients map[uint]*Client`, các channel `register`, `unregister`, `broadcast` (với payload bao gồm `UserID` và nội dung byte). Hàm `Run()` xử lý các sự kiện trong select block.
  - `internal/websocket/client.go`: Struct `Client` (chứa hub, kết nối ws, userID, send channel). `ReadPump()` đọc dữ liệu và ném vào hub, `WritePump()` đẩy dữ liệu ra client có kèm ping/pong.
  - `internal/websocket/handler.go`: Hàm `HandleWebSocket(gin.HandlerFunc)` nâng cấp kết nối HTTP qua gorilla Upgrader, lấy JWT token từ query param `?token=xxx`, trích xuất userID, khởi tạo `Client` và đăng ký với Hub.
- **Thông báo Repository & Service:**
  - `internal/repos/notification_repo.go`: `Create`, `FindByUserID` (lọc theo is_read), `MarkAsRead`, `CountUnread`.
  - `internal/services/notification_service.go`: `GetNotifications`, `MarkAsRead`, hàm đặc biệt `CreateAndBroadcast` (Lưu thông báo vào DB sau đó gọi `hub.BroadcastToUser(userID, payload)`).
- **Routes & Main Init:**
  - Đăng ký các routes: `GET /ws/notifications`, `GET /notifications`, `PUT /notifications/:id/read`.
  - Trong `main.go`: Khởi tạo `hub := websocket.NewHub()` và chạy ngầm `go hub.Run()`.

### Frontend Tasks (👤 A - FE)
- **Zustand Store (`stores/notificationStore.ts`):**
  - Chứa state: list notifications, unreadCount, wsConn (kết nối WS).
  - Actions: `connect(token)` (mở kết nối ws://localhost:8080/ws/notifications?token=xxx), `disconnect()`, `addNotification`, `markAsRead`, `setNotifications`, `setUnreadCount`.
- **WebSocket Hook (`hooks/useWebSocket.ts`):**
  - Chạy `useEffect` lúc mount, dùng token từ `authStore` kết nối.
  - Lắng nghe `onmessage`: gọi `addNotification` vào store, hiển thị toast qua `notification.open()` của Ant Design.
  - Lắng nghe `onclose`: tự động thử kết nối lại sau 3s (exponential backoff).
- **Giao Diện Header (`Header.tsx`):**
  - Render icon `BellOutlined` từ Ant Design Icons với `Badge` cho số lượng chưa đọc.
  - Sử dụng Component `Dropdown` hiển thị list thông báo (tối đa 5 cái gần nhất, kèm link "Xem tất cả").
  - Click từng item sẽ gọi API cập nhật trạng thái đã đọc và navigate tới entity tương ứng (scan/patient).
- **API Service (`services/notificationService.ts`):**
  - Hàm `getNotifications(unread_only)` và `markAsRead`.

---

## 2. Tính Năng 2: Complete Scan Flow & Mobile Polish (👤 B)

**Người đảm nhận: 👤 B (Full-stack)**

### Backend Tasks (👤 B - BE)
- **Xử lý Luồng "Hoàn tất chẩn đoán" (`internal/services/scan_service.go`):**
  - Thêm phương thức `CompleteScan(scanID uint, doctorID uint, diagnosticResult string)`.
  - Chuyển trạng thái scan sang `completed`, nếu có kết quả chẩn đoán thì update vào trường `diagnostic_result`.
  - Tạo một Notification cho bệnh nhân bằng cách gọi `notification_service.CreateAndBroadcast` với nội dung: title="Kết quả chẩn đoán mới", message="Bác sĩ đã cập nhật kết quả [scan_type] của bạn", type="success", related_entity="scan_session", related_id=scanID.
- **Scan Controller (`scan_controller.go`):**
  - Hàm `CompleteScanHandler`: parse ID, kiểm tra quyền bác sĩ, gọi service.
  - Đăng ký route: `PUT /scans/:id/complete` (kèm JWT + RBAC `can_create_scan`).

### Frontend Tasks (👤 B - FE)
- **Cập nhật `ScanDetailPage.tsx`:**
  - Thêm nút "Hoàn tất chẩn đoán", chỉ hiển thị cho role Bác sĩ (Dùng component `RequirePermission` từ Phase 5).
  - Click mở Ant Design Modal, nhập kết luận (text area), submit lên PUT route, hiện success toast.
- **Mobile Polish & Responsive UI:**
  - Cập nhật Sidebar: Thu gọn thành Drawer trên mobile (dùng component Ant Design Drawer, nút hamburger ở Header).
  - Table ngang: Bọc các bảng trong thẻ có `overflow-x: auto`.
  - Layout Form: Đảm bảo responsive hiển thị dọc trên mobile (dùng props `Col` của Antd Grid).
  - Component hiển thị ảnh (ImageViewer): Hỗ trợ thao tác cảm ứng tốt (ví dụ: pinch zoom, `touch-action` CSS).
- **UX & Edge Cases:**
  - Viết wrapper `NotificationToast.tsx` cho `notification.open` để giao diện nhất quán.
  - Nếu token hết hạn (401), setup Axios Interceptor redirect về trang `/login`.
  - Empty states (Component `Empty` của Antd) cho các danh sách không có dữ liệu, hiển thị bộ khung Skeleton lúc loading.
  - Check file upload: Nếu lỗi định dạng `beforeUpload` return false và hiện message lỗi thân thiện.

---

## 3. Tích Hợp & Kiểm Thử (👥 A + B)

- **Test Realtime E2E:**
  - Bác sĩ bấm "Hoàn tất chẩn đoán", bệnh nhân phải lập tức nhận được WebSocket notification ở trình duyệt kia.
- **Mobile Responsive Test:**
  - Bật dev-tools mobile mode và kiểm tra thao tác Sidebar/Table/Form/Toast.
- **Documentation:**
  - Dọn dẹp code, update `docs/workflows.md` với biểu đồ luồng WebSocket Notification.
