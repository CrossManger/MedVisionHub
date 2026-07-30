package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/services"

	"github.com/gin-gonic/gin"
)

type PermissionController struct {
	permissionService services.PermissionService
}

func NewPermissionController(permissionService services.PermissionService) *PermissionController {
	return &PermissionController{permissionService: permissionService}
}

// GetRoles handles GET /api/v1/admin/roles
func (c *PermissionController) GetRoles(ctx *gin.Context) {
	roles, err := c.permissionService.GetAllRoles()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": roles})
}

// GetPermissions handles GET /api/v1/admin/permissions
func (c *PermissionController) GetPermissions(ctx *gin.Context) {
	permissions, err := c.permissionService.GetAllPermissions()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": permissions})
}

// UpdateRolePermissions handles PUT /api/v1/admin/roles/:role_id/permissions
func (c *PermissionController) UpdateRolePermissions(ctx *gin.Context) {
	roleIDStr := ctx.Param("role_id")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID role không hợp lệ"})
		return
	}

	var req dto.UpdateRolePermissionsRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	if err := c.permissionService.UpdateRolePermissions(uint(roleID), req); err != nil {
		if errors.Is(err, services.ErrRoleIDNotFound) || errors.Is(err, services.ErrSomePermissionsNotFound) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống khi cập nhật phân quyền"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Cập nhật quyền hạn cho role thành công"})
}
