package services

import (
	"errors"
	"fmt"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
	"medvision-hub/pkg/utils"
)

var (
	ErrUsernameExists = errors.New("username đã tồn tại")
	ErrEmailExists    = errors.New("email đã tồn tại")
	ErrInvalidRole    = errors.New("vai trò (role) không hợp lệ")
)

type AuthService interface {
	Register(req dto.RegisterRequest) (*dto.RegisterResponse, error)
}

type authService struct {
	userRepo repos.UserRepository
}

func NewAuthService(userRepo repos.UserRepository) AuthService {
	return &authService{userRepo: userRepo}
}

func (s *authService) Register(req dto.RegisterRequest) (*dto.RegisterResponse, error) {
	// 1. Check if username already exists
	existingUser, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, fmt.Errorf("lỗi kiểm tra username: %w", err)
	}
	if existingUser != nil {
		return nil, ErrUsernameExists
	}

	// 2. Check if email already exists
	existingEmail, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("lỗi kiểm tra email: %w", err)
	}
	if existingEmail != nil {
		return nil, ErrEmailExists
	}

	// 3. Determine role (default: patient)
	roleName := req.Role
	if roleName == "" {
		roleName = "patient"
	}

	role, err := s.userRepo.FindRoleByName(roleName)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy thông tin vai trò: %w", err)
	}
	if role == nil {
		return nil, ErrInvalidRole
	}

	// 4. Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("lỗi băm mật khẩu: %w", err)
	}

	// 5. Create user model
	user := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		RoleID:       role.ID,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("lỗi tạo tài khoản: %w", err)
	}

	// Return response matching api_contracts.json
	res := &dto.RegisterResponse{
		Message: "Đăng ký tài khoản thành công",
		User: dto.UserResponse{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			FullName: user.FullName,
			Role:     role.Name,
		},
	}

	return res, nil
}
