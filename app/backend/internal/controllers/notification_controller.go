package controllers

import (
	"net/http"
	"strconv"

	"medvision-hub/internal/services"

	"github.com/gin-gonic/gin"
)

type NotificationController struct {
	notifService services.NotificationService
}

func NewNotificationController(notifService services.NotificationService) *NotificationController {
	return &NotificationController{notifService: notifService}
}

// GetNotifications handles GET /api/v1/notifications
func (c *NotificationController) GetNotifications(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	unreadOnlyStr := ctx.Query("unread_only")
	unreadOnly := unreadOnlyStr == "true" || unreadOnlyStr == "1"

	res, err := c.notifService.GetNotifications(userID, unreadOnly)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// MarkAsRead handles PUT /api/v1/notifications/:id/read
func (c *NotificationController) MarkAsRead(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	idParam := ctx.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID thông báo không hợp lệ"})
		return
	}

	if err := c.notifService.MarkAsRead(uint(id), userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Đã đánh dấu thông báo là đã đọc"})
}
