# 🧪 Kịch bản Test Zero-Downtime Blue-Green Deployment

> Kịch bản test toàn diện cho dự án MedVisionHub (`jenkins_self_study`).
> Gồm 6 bài test, từ cơ bản đến nâng cao, giúp bạn chứng minh Zero-Downtime hoạt động đúng.

## Yêu cầu trước khi bắt đầu

- Docker và Docker Compose đã cài đặt
- Terminal (hoặc mở 2 tab Terminal)
- Đang ở thư mục dự án:
  ```bash
  cd /home/minhvh/Self_Study/jenkins_self_study
  ```

---

## Bài Test 1: Khởi động hệ thống lần đầu

### Mục tiêu
Đảm bảo hệ thống Blue-Green chạy được từ đầu.

### Các bước thực hiện

```bash
# 1. Dọn sạch container cũ (nếu có) để test từ đầu
docker compose -f docker-compose.yml down 2>/dev/null
docker compose -f docker-compose.blue-green.yml down 2>/dev/null

# 2. Start PostgreSQL trước, chờ healthy
docker compose -f docker-compose.blue-green.yml up -d postgres

# 3. Chờ Postgres sẵn sàng (khoảng 5-10 giây)
echo "⏳ Chờ PostgreSQL khởi động..."
sleep 10

# 4. Start Backend Blue
docker compose -f docker-compose.blue-green.yml up -d backend-blue

# 5. Chờ Backend khởi động (khoảng 5-10 giây)
echo "⏳ Chờ Backend Blue khởi động..."
sleep 10

# 6. Start Frontend
docker compose -f docker-compose.blue-green.yml up -d frontend
sleep 5
```

### Kiểm tra kết quả

```bash
# Kiểm tra 3 container đang chạy
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**✅ Kết quả mong đợi:** 3 container đang chạy:

| Container | Status | Ports |
|---|---|---|
| `medvision-postgres` | Up ... (healthy) | `0.0.0.0:5433->5432/tcp` |
| `medvision-backend-blue` | Up ... | `0.0.0.0:8082->8080/tcp` |
| `medvision-frontend` | Up ... | `0.0.0.0:3000->80/tcp` |

```bash
# Kiểm tra Health Check qua backend trực tiếp
curl http://localhost:8082/api/health
```
**✅ Mong đợi:** `{"message":"MedVision Hub API is running"}`

```bash
# Kiểm tra Health Check qua Frontend Nginx (đi qua upstream)
curl http://localhost:3000/api/health
```
**✅ Mong đợi:** Cùng kết quả `{"message":"MedVision Hub API is running"}`

```bash
# Kiểm tra nginx.conf đang trỏ vào Blue
grep "server medvision" nginx/nginx.conf
```
**✅ Mong đợi:** `server medvision-backend-blue:8080;`

> [!TIP]
> Mở trình duyệt truy cập `http://localhost:3000` để xem giao diện web MedVisionHub.

---

## Bài Test 2: Deploy lần đầu (Blue → Green)

### Mục tiêu
Chạy script deploy và kiểm tra hệ thống chuyển từ Blue sang Green thành công.

### Các bước thực hiện

```bash
# Chạy deploy
./scripts/deploy-blue-green.sh
```

### Kết quả mong đợi trên màn hình

```
═══════════════════════════════════════════════════
🚀 MedVisionHub — Zero-Downtime Deployment
═══════════════════════════════════════════════════

🔍 [Step 1/5] Detecting active deployment color...
   📌 Currently active : blue
   🎯 Deploy target    : green (port 8083)

📦 [Step 2/5] Building and starting backend-green...
   ✅ Container backend-green started

⏳ [Step 3/5] Running health checks on backend-green...
   ⏳ Attempt 1/15: HTTP 000 — waiting 2s...
   ⏳ Attempt 2/15: HTTP 000 — waiting 2s...
   ✅ Attempt 3/15: HTTP 200 — PASSED!

🔄 [Step 4/5] Switching traffic to backend-green...
   ✅ Traffic switched to backend-green

🧹 [Step 5/5] Stopping old container: backend-blue...
   ✅ Container backend-blue stopped

═══════════════════════════════════════════════════
🎉 ZERO-DOWNTIME DEPLOYMENT COMPLETED SUCCESSFULLY
═══════════════════════════════════════════════════
   ✅ Active  : backend-green (port 8083)
   🛑 Stopped : backend-blue
   🕐 Time    : 2026-08-12 16:50:00
═══════════════════════════════════════════════════
```

### Kiểm tra kết quả

```bash
# 1. Kiểm tra container — Blue phải TẮT, Green phải BẬT
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**✅ Mong đợi:**

| Container | Status | Ports |
|---|---|---|
| `medvision-postgres` | Up ... (healthy) | `0.0.0.0:5433->5432/tcp` |
| `medvision-backend-green` | Up ... | `0.0.0.0:8083->8080/tcp` |
| `medvision-frontend` | Up ... | `0.0.0.0:3000->80/tcp` |

(`medvision-backend-blue` KHÔNG còn trong danh sách)

```bash
# 2. Kiểm tra nginx.conf đã đổi sang Green
grep "server medvision" nginx/nginx.conf
```
**✅ Mong đợi:** `server medvision-backend-green:8080;`

```bash
# 3. Kiểm tra API vẫn hoạt động qua Frontend
curl http://localhost:3000/api/health
```
**✅ Mong đợi:** `{"message":"MedVision Hub API is running"}`

---

## Bài Test 3: Deploy lần 2 (Green → Blue)

### Mục tiêu
Xác nhận script tự động đổi chiều: lần này sẽ deploy Blue và tắt Green.

### Các bước thực hiện

```bash
# Chạy deploy lần nữa
./scripts/deploy-blue-green.sh
```

### Kiểm tra kết quả

```bash
# 1. Kiểm tra container — Green phải TẮT, Blue phải BẬT
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**✅ Mong đợi:**

| Container | Status |
|---|---|
| `medvision-backend-blue` | Up ... |
| `medvision-frontend` | Up ... |
| `medvision-postgres` | Up ... (healthy) |

(`medvision-backend-green` KHÔNG còn)

```bash
# 2. Kiểm tra nginx.conf đã trỏ lại Blue
grep "server medvision" nginx/nginx.conf
```
**✅ Mong đợi:** `server medvision-backend-blue:8080;`

```bash
# 3. API vẫn hoạt động
curl http://localhost:3000/api/health
```
**✅ Mong đợi:** `{"message":"MedVision Hub API is running"}`

---

## Bài Test 4: Chứng minh Zero-Downtime (BÀI TEST QUAN TRỌNG NHẤT)

### Mục tiêu
Chứng minh rằng trong suốt quá trình deploy, **không có request nào bị lỗi**.

### Các bước thực hiện

> [!IMPORTANT]
> Bài test này cần mở **2 Terminal** cùng lúc.

#### Terminal 1 — Giả lập QC đang test liên tục

```bash
cd /home/minhvh/Self_Study/MedVisionHub

# Gọi API mỗi 0.5 giây, ghi log kết quả
echo "🧪 Bắt đầu giả lập QC test liên tục (nhấn Ctrl+C để dừng)..."
echo ""

TOTAL=0
FAIL=0

while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        http://localhost:3000/api/health 2>/dev/null || echo "000")
    TOTAL=$((TOTAL + 1))

    if [ "${STATUS}" = "200" ]; then
        echo "$(date '+%H:%M:%S') — HTTP ${STATUS} ✅"
    else
        FAIL=$((FAIL + 1))
        echo "$(date '+%H:%M:%S') — HTTP ${STATUS} ❌ DOWNTIME DETECTED!"
    fi

    sleep 0.5
done
```

#### Terminal 2 — Thực hiện deploy

```bash
cd /home/minhvh/Self_Study/MedVisionHub

# Chạy deploy
./scripts/deploy-blue-green.sh
```

### Kiểm tra kết quả

Quan sát **Terminal 1** trong suốt quá trình deploy:

**✅ PASS — Zero-Downtime thành công nếu:**
```
16:50:01 — HTTP 200 ✅
16:50:01 — HTTP 200 ✅
16:50:02 — HTTP 200 ✅    ← Deploy đang chạy ở Terminal 2
16:50:02 — HTTP 200 ✅    ← Vẫn 200!
16:50:03 — HTTP 200 ✅
16:50:03 — HTTP 200 ✅    ← Switch traffic xảy ra ở đây
16:50:04 — HTTP 200 ✅    ← Vẫn 200! Không bị gián đoạn!
16:50:04 — HTTP 200 ✅
```
Tất cả đều `HTTP 200 ✅`, không có dòng nào hiện `❌ DOWNTIME DETECTED!`

**❌ FAIL — Có downtime nếu:**
```
16:50:02 — HTTP 200 ✅
16:50:03 — HTTP 502 ❌ DOWNTIME DETECTED!
16:50:03 — HTTP 000 ❌ DOWNTIME DETECTED!
16:50:04 — HTTP 200 ✅
```
Nếu thấy dòng ❌ → cần kiểm tra lại cấu hình nginx hoặc timing.

> [!TIP]
> Sau khi test xong, nhấn `Ctrl+C` ở Terminal 1 để dừng vòng lặp.

---

## Bài Test 5: Test Rollback thủ công

### Mục tiêu
Kiểm tra khả năng quay về phiên bản cũ khi phát hiện lỗi sau deploy.

### Các bước thực hiện

```bash
# 1. Xem trạng thái hiện tại trước rollback
echo "=== TRƯỚC ROLLBACK ==="
grep "server medvision" nginx/nginx.conf
docker ps --format "table {{.Names}}\t{{.Status}}"

# 2. Chạy rollback
./scripts/rollback.sh

# 3. Xem trạng thái sau rollback
echo "=== SAU ROLLBACK ==="
grep "server medvision" nginx/nginx.conf
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Kiểm tra kết quả

**✅ Mong đợi:** Nginx đổi chiều và container swap lại:

| Thời điểm | Nginx trỏ vào | Container đang chạy |
|---|---|---|
| Trước rollback | `backend-green` | `medvision-backend-green` |
| Sau rollback | `backend-blue` | `medvision-backend-blue` |

(Hoặc ngược lại, tùy trạng thái trước đó)

```bash
# API vẫn hoạt động sau rollback
curl http://localhost:3000/api/health
```
**✅ Mong đợi:** `{"message":"MedVision Hub API is running"}`

---

## Bài Test 6: Test Auto-Rollback khi deploy lỗi

### Mục tiêu
Giả lập trường hợp code mới bị lỗi crash — xác nhận script tự động hủy deploy và giữ nguyên bản cũ.

### Các bước thực hiện

```bash
# 1. Ghi nhận trạng thái hiện tại
echo "=== TRẠNG THÁI TRƯỚC KHI TEST ==="
grep "server medvision" nginx/nginx.conf
docker ps --format "table {{.Names}}\t{{.Status}}"
```

```bash
# 2. Tạo lỗi giả: Chiếm port của bản target để nó không bật lên được
# Xem nginx đang trỏ vào đâu để biết target là gì
if grep -q "medvision-backend-blue" nginx/nginx.conf; then
    # Target sẽ là Green (port 8083)
    echo "🔧 Chiếm port 8083 để giả lập Green bật lỗi..."
    # Chạy một container giả chiếm port 8083
    docker run -d --name port-blocker -p 8083:80 nginx:alpine
else
    # Target sẽ là Blue (port 8082)
    echo "🔧 Chiếm port 8082 để giả lập Blue bật lỗi..."
    docker run -d --name port-blocker -p 8082:80 nginx:alpine
fi
```

```bash
# 3. Chạy deploy — script sẽ thất bại vì port bị chiếm
./scripts/deploy-blue-green.sh
```

### Kết quả mong đợi trên màn hình

```
🔍 [Step 1/5] Detecting active deployment color...
   📌 Currently active : blue
   🎯 Deploy target    : green (port 8083)

📦 [Step 2/5] Building and starting backend-green...
   ✅ Container backend-green started

⏳ [Step 3/5] Running health checks on backend-green...
   ⏳ Attempt 1/15: HTTP 000 — waiting 2s...
   ⏳ Attempt 2/15: HTTP 000 — waiting 2s...
   ...
   ⏳ Attempt 15/15: HTTP 000 — waiting 2s...

   ❌ HEALTH CHECK FAILED after 15 attempts!
   🔄 Auto-rollback: stopping backend-green...

   ⚠️  Deploy ABORTED — backend-blue vẫn đang phục vụ bình thường.
```

### Kiểm tra kết quả

```bash
# 1. Nginx vẫn trỏ vào bản cũ (KHÔNG BỊ ĐỔI)
grep "server medvision" nginx/nginx.conf
```
**✅ Mong đợi:** Vẫn giữ nguyên `server medvision-backend-blue:8080;` (không bị đổi sang green)

```bash
# 2. Bản cũ vẫn chạy bình thường
curl http://localhost:3000/api/health
```
**✅ Mong đợi:** `{"message":"MedVision Hub API is running"}`

```bash
# 3. Dọn dẹp container giả
docker stop port-blocker && docker rm port-blocker
```

---

## Bảng tổng kết 6 bài test

| Bài | Tên test | Mục đích | Tiêu chí PASS |
|---|---|---|---|
| 1 | Khởi động lần đầu | Hệ thống chạy được | 3 container Up, API trả 200 |
| 2 | Deploy Blue → Green | Script deploy hoạt động | Green Up, Blue Stop, nginx trỏ Green |
| 3 | Deploy Green → Blue | Script tự đổi chiều | Blue Up, Green Stop, nginx trỏ Blue |
| 4 | **Chứng minh Zero-Downtime** | **Không gián đoạn khi deploy** | **100% request trả HTTP 200** |
| 5 | Rollback thủ công | Quay về bản cũ | Container swap lại, API vẫn 200 |
| 6 | Auto-rollback khi lỗi | Script tự hủy deploy lỗi | Nginx KHÔNG đổi, bản cũ vẫn chạy |

> [!IMPORTANT]
> **Bài Test 4 là bài test quan trọng nhất** — đây chính là bằng chứng bạn cần đưa cho Quản lý để chứng minh Zero-Downtime Deployment hoạt động thành công.
