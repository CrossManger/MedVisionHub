#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# MedVisionHub — Zero-Downtime Blue-Green Deploy Script
# ═══════════════════════════════════════════════════════════════
#
# Luồng thực thi:
#   1. Detect  → Xác định màu đang active (đọc từ nginx config)
#   2. Build   → Build & start container mới (màu còn lại)
#   3. Health  → Gọi /api/health liên tục cho tới khi HTTP 200
#   4. Switch  → Sửa nginx upstream & reload (không rớt kết nối)
#   5. Cleanup → Tắt container cũ để giải phóng tài nguyên
#
# Cách chạy:
#   chmod +x scripts/deploy-blue-green.sh
#   ./scripts/deploy-blue-green.sh
#
# ═══════════════════════════════════════════════════════════════

COMPOSE_FILE="docker-compose.blue-green.yml"
NGINX_CONF="./nginx/nginx.conf"
FRONTEND_CONTAINER="medvision-frontend"
BLUE_PORT="18082"
GREEN_PORT="18083"
HEALTH_ENDPOINT="/api/health"
MAX_RETRIES=15
RETRY_INTERVAL=2

echo ""
echo "═══════════════════════════════════════════════════"
echo "🚀 MedVisionHub — Zero-Downtime Deployment"
echo "═══════════════════════════════════════════════════"
echo ""

# ── 1. Detect: Xác định màu đang active từ nginx config ──────
echo "🔍 [Step 1/5] Detecting active deployment color..."

if grep -q "medvision-backend-blue" "${NGINX_CONF}"; then
    ACTIVE_COLOR="blue"
    TARGET_COLOR="green"
    TARGET_PORT="${GREEN_PORT}"
else
    ACTIVE_COLOR="green"
    TARGET_COLOR="blue"
    TARGET_PORT="${BLUE_PORT}"
fi

echo "   📌 Currently active : ${ACTIVE_COLOR}"
echo "   🎯 Deploy target    : ${TARGET_COLOR} (port ${TARGET_PORT})"
echo ""

# ── 2. Build & Start: Khởi động container mới ────────────────
echo "📦 [Step 2/5] Building and starting backend-${TARGET_COLOR}..."
# Đảm bảo postgres và frontend (Nginx Gateway) luôn ở trạng thái chạy
docker compose -f "${COMPOSE_FILE}" up -d postgres frontend
docker compose -f "${COMPOSE_FILE}" up -d --build "backend-${TARGET_COLOR}"
echo "   ✅ Container backend-${TARGET_COLOR} started"
echo ""

# ── 3. Health Check: Kiểm tra container mới đã sẵn sàng ─────
echo "⏳ [Step 3/5] Running health checks on backend-${TARGET_COLOR}..."
echo "   Endpoint: http://localhost:${TARGET_PORT}${HEALTH_ENDPOINT}"
echo "   Max attempts: ${MAX_RETRIES} (interval: ${RETRY_INTERVAL}s)"
echo ""

HEALTHY=false

for i in $(seq 1 ${MAX_RETRIES}); do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        "http://localhost:${TARGET_PORT}${HEALTH_ENDPOINT}" 2>/dev/null || echo "000")

    if [ "${HTTP_STATUS}" = "200" ]; then
        HEALTHY=true
        echo "   ✅ Attempt ${i}/${MAX_RETRIES}: HTTP ${HTTP_STATUS} — PASSED!"
        break
    fi

    echo "   ⏳ Attempt ${i}/${MAX_RETRIES}: HTTP ${HTTP_STATUS} — waiting ${RETRY_INTERVAL}s..."
    sleep "${RETRY_INTERVAL}"
done

echo ""

if [ "${HEALTHY}" = false ]; then
    echo "   ❌ HEALTH CHECK FAILED after ${MAX_RETRIES} attempts!"
    echo "   🔄 Auto-rollback: stopping backend-${TARGET_COLOR}..."
    docker compose -f "${COMPOSE_FILE}" stop "backend-${TARGET_COLOR}" 2>/dev/null || true
    echo ""
    echo "   ⚠️  Deploy ABORTED — backend-${ACTIVE_COLOR} vẫn đang phục vụ bình thường."
    echo ""
    exit 1
fi

# ── 4. Switch Traffic: Chuyển Nginx upstream ──────────────────
echo "🔄 [Step 4/5] Switching traffic to backend-${TARGET_COLOR}..."

# Sửa file nginx.conf trên host (bind mount sẽ đồng bộ vào container)
sed -i "s/medvision-backend-${ACTIVE_COLOR}/medvision-backend-${TARGET_COLOR}/g" "${NGINX_CONF}"

# Reload Nginx trong container — không rớt kết nối đang có
docker exec "${FRONTEND_CONTAINER}" nginx -s reload

echo "   ✅ Traffic switched to backend-${TARGET_COLOR}"
echo ""

# ── 5. Cleanup: Tắt container cũ ─────────────────────────────
echo "🧹 [Step 5/5] Stopping old container: backend-${ACTIVE_COLOR}..."
docker compose -f "${COMPOSE_FILE}" stop "backend-${ACTIVE_COLOR}"
echo "   ✅ Container backend-${ACTIVE_COLOR} stopped"
echo ""

# ── Summary ───────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo "🎉 ZERO-DOWNTIME DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════"
echo "   ✅ Active  : backend-${TARGET_COLOR} (port ${TARGET_PORT})"
echo "   🛑 Stopped : backend-${ACTIVE_COLOR}"
echo "   🕐 Time    : $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"
echo ""
