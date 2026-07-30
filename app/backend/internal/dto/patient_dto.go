package dto

import "time"

// Pagination defines the pagination metadata structure
type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// CreatePatientRequest defines the payload for POST /patients
type CreatePatientRequest struct {
	UserID         *uint   `json:"user_id"`
	FullName       string  `json:"full_name" binding:"required"`
	DateOfBirth    *string `json:"date_of_birth" binding:"omitempty"` // YYYY-MM-DD format
	Gender         *string `json:"gender" binding:"omitempty,oneof=male female other"`
	Phone          *string `json:"phone" binding:"omitempty"`
	Address        *string `json:"address" binding:"omitempty"`
	MedicalHistory *string `json:"medical_history" binding:"omitempty"`
}

// UpdatePatientRequest defines the payload for PUT /patients/:id
type UpdatePatientRequest struct {
	UserID         *uint   `json:"user_id"`
	FullName       string  `json:"full_name" binding:"required"`
	DateOfBirth    *string `json:"date_of_birth" binding:"omitempty"` // YYYY-MM-DD format
	Gender         *string `json:"gender" binding:"omitempty,oneof=male female other"`
	Phone          *string `json:"phone" binding:"omitempty"`
	Address        *string `json:"address" binding:"omitempty"`
	MedicalHistory *string `json:"medical_history" binding:"omitempty"`
}

// UpdateMyPatientRequest defines the payload for PUT /my-patient (Patient self-update)
type UpdateMyPatientRequest struct {
	FullName    *string `json:"full_name" binding:"omitempty"`
	DateOfBirth *string `json:"date_of_birth" binding:"omitempty"`
	Gender      *string `json:"gender" binding:"omitempty"`
	Phone       *string `json:"phone" binding:"omitempty"`
	Address     *string `json:"address" binding:"omitempty"`
}

// PatientResponse defines the response structure for a single patient
type PatientResponse struct {
	ID             uint       `json:"id"`
	UserID         *uint      `json:"user_id"`
	FullName       string     `json:"full_name"`
	DateOfBirth    *string    `json:"date_of_birth"`
	Gender         *string    `json:"gender"`
	Phone          *string    `json:"phone"`
	Address        *string    `json:"address"`
	MedicalHistory *string    `json:"medical_history"`
	CreatedBy      *uint      `json:"created_by"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// PatientListResponse defines the response structure for GET /patients
type PatientListResponse struct {
	Data       []PatientResponse `json:"data"`
	Pagination Pagination        `json:"pagination"`
}
