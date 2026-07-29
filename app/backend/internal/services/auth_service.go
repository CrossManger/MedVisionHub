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
	ErrInvalidCredentials = errors.New("Tên đăng nhập hoặc mật khẩu không hợp lệ")
	ErrUserDisabled       = errors.New("Tài khoản đã bị vô hiệu hóa")
	ErrUsernameExists     = errors.New("Tên đăng nhập đã tồn tại")
	ErrEmailExists        = errors.New("Email đã tồn tại")
	ErrRoleNotFound       = errors.New("Role không tồn tại")
	ErrAdminSelfRegister  = errors.New("Không thể tự đăng ký tài khoản Quản trị viên (Admin)")
)

type AuthService interface {
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
	Register(req dto.RegisterRequest) (*dto.RegisterResponse, error)
}

type authService struct {
	userRepo repos.UserRepository
}

func NewAuthService(userRepo repos.UserRepository) AuthService {
	return &authService{userRepo: userRepo}
}

// Login handles user authentication and JWT token generation
func (s *authService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if user.IsActive != nil && !*user.IsActive {
		return nil, ErrUserDisabled
	}

	// Note: CheckPassword accepts (hashedPassword, plainPassword)
	if !utils.CheckPassword(user.PasswordHash, req.Password) {
		return nil, ErrInvalidCredentials
	}

	permissions, err := s.userRepo.GetPermissionsByRoleID(user.RoleID)
	if err != nil || permissions == nil {
		permissions = []string{}
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role.Name)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			FullName:    user.FullName,
			Role:        user.Role.Name,
			Permissions: permissions,
		},
	}, nil
}

// Register handles new account registration
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

	// 3. Determine role (Public registration prohibits creating 'admin' role)
	roleName := req.Role
	if roleName == "admin" {
		return nil, ErrAdminSelfRegister
	}
	if roleName == "" {
		roleName = "patient"
	}

	role, err := s.userRepo.FindRoleByName(roleName)
	if err != nil || role == nil {
		role, err = s.userRepo.GetRoleByName(roleName)
		if err != nil || role == nil {
			return nil, ErrRoleNotFound
		}
	}

	// 4. Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("lỗi băm mật khẩu: %w", err)
	}

	// 5. Create user model
	isActive := true
	newUser := &models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		RoleID:       role.ID,
		IsActive:     &isActive,
	}

	if err := s.userRepo.Create(newUser); err != nil {
		return nil, fmt.Errorf("lỗi tạo tài khoản: %w", err)
	}

	permissions, _ := s.userRepo.GetPermissionsByRoleID(role.ID)
	if permissions == nil {
		permissions = []string{}
	}

	return &dto.RegisterResponse{
		Message: "Đăng ký tài khoản thành công",
		User: dto.UserResponse{
			ID:          newUser.ID,
			Username:    newUser.Username,
			Email:       newUser.Email,
			FullName:    newUser.FullName,
			Role:        role.Name,
			Permissions: permissions,
		},
	}, nil
}
