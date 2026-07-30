package controllers

import (
	"errors"
	"net/http"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

// Login handles POST /api/v1/auth/login (Feature Person B)
func (c *AuthController) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	res, err := c.authService.Login(req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) || errors.Is(err, services.ErrUserDisabled) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống khi đăng nhập"})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// Register handles POST /api/v1/auth/register (Feature Person A)
func (c *AuthController) Register(ctx *gin.Context) {
	var req dto.RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	res, err := c.authService.Register(req)
	if err != nil {
		if errors.Is(err, services.ErrUsernameExists) || errors.Is(err, services.ErrEmailExists) || errors.Is(err, services.ErrPhoneExists) {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrRoleNotFound) || errors.Is(err, services.ErrAdminSelfRegister) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, res)
}

// ForgotPassword handles POST /api/v1/auth/forgot-password
func (c *AuthController) ForgotPassword(ctx *gin.Context) {
	var req dto.ForgotPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	if err := c.authService.ForgotPassword(req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống khi yêu cầu đặt lại mật khẩu"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi"})
}

// ResetPassword handles POST /api/v1/auth/reset-password
func (c *AuthController) ResetPassword(ctx *gin.Context) {
	var req dto.ResetPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	if err := c.authService.ResetPassword(req); err != nil {
		if errors.Is(err, services.ErrInvalidResetToken) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống khi đặt lại mật khẩu"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Đặt lại mật khẩu thành công"})
}
