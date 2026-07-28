package services

import (
	"errors"
	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
	"medvision-hub/pkg/utils"

	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("Invalid username or password")
	ErrUserDisabled       = errors.New("Account is deactivated")
	ErrUserExists         = errors.New("Username already exists")
	ErrEmailExists        = errors.New("Email already exists")
	ErrRoleNotFound       = errors.New("Specified role does not exist")
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

func (s *authService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if user.IsActive != nil && !*user.IsActive {
		return nil, ErrUserDisabled
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	permissions, err := s.userRepo.GetPermissionsByRoleID(user.RoleID)
	if err != nil {
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

func (s *authService) Register(req dto.RegisterRequest) (*dto.RegisterResponse, error) {
	// Check existing username
	if existingUser, err := s.userRepo.FindByUsername(req.Username); err == nil && existingUser != nil {
		return nil, ErrUserExists
	}

	// Check existing email
	if existingUser, err := s.userRepo.FindByEmail(req.Email); err == nil && existingUser != nil {
		return nil, ErrEmailExists
	}

	roleName := req.Role
	if roleName == "" {
		roleName = "patient"
	}

	role, err := s.userRepo.GetRoleByName(roleName)
	if err != nil {
		return nil, ErrRoleNotFound
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

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
		return nil, err
	}

	permissions, _ := s.userRepo.GetPermissionsByRoleID(role.ID)

	return &dto.RegisterResponse{
		Message: "Registration successful",
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
