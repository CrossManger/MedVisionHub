package middlewares

import (
	"net/http"

	"medvision-hub/pkg/database"

	"github.com/gin-gonic/gin"
)

// RequirePermission checks if the authenticated user's role possesses the specified permission
func RequirePermission(permissionName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
			return
		}

		roleName, ok := roleVal.(string)
		if !ok || roleName == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Thông tin vai trò không hợp lệ"})
			return
		}

		// Admin bypasses individual permission checks
		if roleName == "admin" {
			c.Next()
			return
		}

		// Query database to check if role has the requested permission
		var count int64
		err := database.DB.Table("roles").
			Joins("JOIN role_permissions ON role_permissions.role_id = roles.id").
			Joins("JOIN permissions ON permissions.id = role_permissions.permission_id").
			Where("roles.name = ? AND permissions.name = ?", roleName, permissionName).
			Count(&count).Error

		if err != nil || count == 0 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Bạn không có quyền thực hiện thao tác này",
			})
			return
		}

		c.Next()
	}
}
