#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# MedVisionHub — Emergency Rollback Script
# ═══════════════════════════════════════════════════════════════
#
# Khi phát hiện bản mới (Green/Blue) có lỗi sau khi đã switch,
# chạy script này để quay về phiên bản cũ ngay lập tức.
#
# Cách chạy:
#   chmod +x scripts/rollback.sh
#   ./scripts/rollback.sh
#
# ═══════════════════════════════════════════════════════════════

COMPOSE_FILE="docker-compose.blue-green.yml"
NGINX_CONF="./nginx/nginx.conf"
FRONTEND_CONTAINER="medvision-frontend"
BLUE_PORT="8082"
GREEN_PORT="8083"
HEALTH_ENDPOINT="/api/health"
MAX_RETRIES=10
RETRY_INTERVAL=2

echo ""
echo "═══════════════════════════════════════════════════"
echo "🚨 MedVisionHub — EMERGENCY ROLLBACK"
echo "═══════════════════════════════════════════════════"
echo ""

# ── Detect: Xác định màu đang active và rollback target ──────
if grep -q "medvision-backend-blue" "${NGINX_CONF}"; then
    CURRENT_COLOR="blue"
    ROLLBACK_COLOR="green"
    ROLLBACK_PORT="${GREEN_PORT}"
else
    CURRENT_COLOR="green"
    ROLLBACK_COLOR="blue"
    ROLLBACK_PORT="${BLUE_PORT}"
fi

echo "   📌 Currently active : ${CURRENT_COLOR}"
echo "   🔄 Rolling back to  : ${ROLLBACK_COLOR} (port ${ROLLBACK_PORT})"
echo ""

# ── Start: Khởi động lại container cũ ────────────────────────
echo "📦 Starting backend-${ROLLBACK_COLOR}..."
docker compose -f "${COMPOSE_FILE}" up -d postgres frontend
docker compose -f "${COMPOSE_FILE}" up -d "backend-${ROLLBACK_COLOR}"
echo ""

# ── Health Check: Đợi container cũ sẵn sàng ──────────────────
echo "⏳ Waiting for backend-${ROLLBACK_COLOR} to be healthy..."

HEALTHY=false
for i in $(seq 1 ${MAX_RETRIES}); do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        "http://localhost:${ROLLBACK_PORT}${HEALTH_ENDPOINT}" 2>/dev/null || echo "000")

    if [ "${HTTP_STATUS}" = "200" ]; then
        HEALTHY=true
        echo "   ✅ Attempt ${i}/${MAX_RETRIES}: HTTP ${HTTP_STATUS} — HEALTHY!"
        break
    fi

    echo "   ⏳ Attempt ${i}/${MAX_RETRIES}: HTTP ${HTTP_STATUS} — waiting ${RETRY_INTERVAL}s..."
    sleep "${RETRY_INTERVAL}"
done

echo ""

if [ "${HEALTHY}" = false ]; then
    echo "   ❌ Rollback target backend-${ROLLBACK_COLOR} is NOT healthy!"
    echo "   ⚠️  Please check container logs:"
    echo "      docker logs medvision-backend-${ROLLBACK_COLOR}"
    exit 1
fi

# ── Switch Traffic: Quay về container cũ ──────────────────────
echo "🔄 Switching traffic back to backend-${ROLLBACK_COLOR}..."
sed -i "s/medvision-backend-${CURRENT_COLOR}/medvision-backend-${ROLLBACK_COLOR}/g" "${NGINX_CONF}"
docker exec "${FRONTEND_CONTAINER}" nginx -s reload
echo "   ✅ Traffic switched to backend-${ROLLBACK_COLOR}"
echo ""

# ── Cleanup: Tắt container lỗi ───────────────────────────────
echo "🧹 Stopping problematic container: backend-${CURRENT_COLOR}..."
docker compose -f "${COMPOSE_FILE}" stop "backend-${CURRENT_COLOR}" 2>/dev/null || true
echo ""

# ── Summary ───────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo "✅ ROLLBACK COMPLETED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════"
echo "   ✅ Active  : backend-${ROLLBACK_COLOR} (port ${ROLLBACK_PORT})"
echo "   🛑 Stopped : backend-${CURRENT_COLOR}"
echo "   🕐 Time    : $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════"
echo ""
