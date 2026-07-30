package services

import (
	"errors"
	"fmt"
	"log"

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
	ErrPhoneExists        = errors.New("Số điện thoại này đã được sử dụng trong hệ thống")
	ErrRoleNotFound       = errors.New("Role không tồn tại")
	ErrAdminSelfRegister  = errors.New("Không thể tự đăng ký tài khoản Quản trị viên (Admin)")
	ErrInvalidResetToken  = errors.New("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn")
	ErrUserEmailNotFound  = errors.New("Email không tồn tại trong hệ thống")
)

type AuthService interface {
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
	Register(req dto.RegisterRequest) (*dto.RegisterResponse, error)
	ForgotPassword(req dto.ForgotPasswordRequest) error
	ResetPassword(req dto.ResetPasswordRequest) error
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

	// 3. Check if phone already exists in patients records
	if req.Phone != "" {
		patientRepo := repos.NewPatientRepository()
		existingPhone, err := patientRepo.FindByPhone(req.Phone)
		if err != nil {
			return nil, fmt.Errorf("lỗi kiểm tra số điện thoại: %w", err)
		}
		if existingPhone != nil {
			return nil, ErrPhoneExists
		}
	}

	// 4. Determine role (Public registration prohibits creating 'admin' role)
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

	// 5. Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("lỗi băm mật khẩu: %w", err)
	}

	// 6. Create user model
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

	// Auto-create and link patient record when a new patient account registers
	if role.Name == "patient" {
		patientRepo := repos.NewPatientRepository()
		var phonePtr *string
		if req.Phone != "" {
			phonePtr = &req.Phone
		}
		patientRecord := &models.Patient{
			UserID:   &newUser.ID,
			FullName: newUser.FullName,
			Phone:    phonePtr,
		}
		if err := patientRepo.Create(patientRecord); err != nil {
			fmt.Printf("Lỗi tự tạo hồ sơ bệnh nhân: %v\n", err)
		} else {
			fmt.Printf("Đã tự động tạo hồ sơ bệnh nhân thành công cho user_id=%d, Họ tên=%s\n", newUser.ID, newUser.FullName)
		}
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

// ForgotPassword handles sending reset password request / token generation
func (s *authService) ForgotPassword(req dto.ForgotPasswordRequest) error {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return fmt.Errorf("lỗi tìm kiếm email: %w", err)
	}
	if user == nil {
		return nil
	}

	// Generate reset token (JWT)
	resetToken, err := utils.GenerateToken(user.ID, user.Username, user.Role.Name)
	if err != nil {
		return fmt.Errorf("lỗi tạo token đặt lại mật khẩu: %w", err)
	}

	log.Printf("\n======================================================\n[RESET PASSWORD TOKEN DEMO]\nEmail: %s\nUser: %s (ID: %d)\nReset Token:\n%s\n======================================================\n", user.Email, user.Username, user.ID, resetToken)

	return nil
}

// ResetPassword handles resetting password using a reset token
func (s *authService) ResetPassword(req dto.ResetPasswordRequest) error {
	token, err := utils.ValidateToken(req.Token)
	if err != nil || !token.Valid {
		return ErrInvalidResetToken
	}

	claimsMap, err := utils.ExtractClaims(token)
	if err != nil {
		return ErrInvalidResetToken
	}

	userIDFloat, ok := claimsMap["user_id"].(float64)
	if !ok {
		return ErrInvalidResetToken
	}
	userID := uint(userIDFloat)

	user, err := s.userRepo.FindByID(userID)
	if err != nil || user == nil {
		return ErrInvalidResetToken
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("lỗi băm mật khẩu mới: %w", err)
	}

	if err := s.userRepo.UpdatePassword(user.ID, hashedPassword); err != nil {
		return fmt.Errorf("lỗi cập nhật mật khẩu: %w", err)
	}

	return nil
}
