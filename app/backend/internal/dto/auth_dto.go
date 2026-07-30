package dto

// LoginRequest represents the request payload for user login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UserResponse represents the safe user details returned in authentication responses
type UserResponse struct {
	ID          uint     `json:"id"`
	Username    string   `json:"username"`
	Email       string   `json:"email"`
	FullName    string   `json:"full_name"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions,omitempty"`
}

// LoginResponse represents the response payload upon successful login
type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

// RegisterRequest represents the request payload for user registration
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone" binding:"omitempty"`
	Role     string `json:"role" binding:"omitempty,oneof=doctor patient"`
}

// RegisterResponse represents the response payload upon successful registration
type RegisterResponse struct {
	Message string       `json:"message"`
	User    UserResponse `json:"user"`
}
