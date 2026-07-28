package dto

// RegisterRequest defines the payload for POST /auth/register
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role" binding:"omitempty,oneof=doctor patient"`
}

// UserResponse defines the user data structure in auth responses
type UserResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

// RegisterResponse defines the response structure for 201 Created
type RegisterResponse struct {
	Message string       `json:"message"`
	User    UserResponse `json:"user"`
}
