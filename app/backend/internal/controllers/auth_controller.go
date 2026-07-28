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

// Login handles POST /api/v1/auth/login
func (c *AuthController) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	res, err := c.authService.Login(req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) || errors.Is(err, services.ErrUserDisabled) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process login request"})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// Register handles POST /api/v1/auth/register
func (c *AuthController) Register(ctx *gin.Context) {
	var req dto.RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	res, err := c.authService.Register(req)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) || errors.Is(err, services.ErrEmailExists) {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrRoleNotFound) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	ctx.JSON(http.StatusCreated, res)
}
