package dto

import "time"

type CreatePatientRequest struct {
	FullName       string  `json:"full_name" binding:"required"`
	DateOfBirth    *string `json:"date_of_birth" binding:"omitempty"` // YYYY-MM-DD format
	Gender         *string `json:"gender" binding:"omitempty,oneof=male female other"`
	Phone          *string `json:"phone" binding:"omitempty"`
	Address        *string `json:"address" binding:"omitempty"`
	MedicalHistory *string `json:"medical_history" binding:"omitempty"`
}

type UpdatePatientRequest struct {
	FullName       *string `json:"full_name" binding:"omitempty"`
	DateOfBirth    *string `json:"date_of_birth" binding:"omitempty"` // YYYY-MM-DD format
	Gender         *string `json:"gender" binding:"omitempty,oneof=male female other"`
	Phone          *string `json:"phone" binding:"omitempty"`
	Address        *string `json:"address" binding:"omitempty"`
	MedicalHistory *string `json:"medical_history" binding:"omitempty"`
}

type PatientResponse struct {
	ID          uint      `json:"id"`
	FullName    string    `json:"full_name"`
	DateOfBirth *string   `json:"date_of_birth"` // YYYY-MM-DD format
	Gender      *string   `json:"gender"`
	Phone       *string   `json:"phone"`
	CreatedAt   time.Time `json:"created_at"`
}

type PatientDetailScanSession struct {
	ID         uint      `json:"id"`
	ScanType   string    `json:"scan_type"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	ImageCount int       `json:"image_count"`
}

type PatientDetailResponse struct {
	ID             uint                       `json:"id"`
	UserID         *uint                      `json:"user_id"`
	FullName       string                     `json:"full_name"`
	DateOfBirth    *string                    `json:"date_of_birth"`
	Gender         *string                    `json:"gender"`
	Phone          *string                    `json:"phone"`
	Address        *string                    `json:"address"`
	MedicalHistory *string                    `json:"medical_history"`
	CreatedBy      *uint                      `json:"created_by"`
	CreatedAt      time.Time                  `json:"created_at"`
	UpdatedAt      time.Time                  `json:"updated_at"`
	ScanSessions   []PatientDetailScanSession `json:"scan_sessions"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type PatientListResponse struct {
	Data       []PatientResponse `json:"data"`
	Pagination Pagination        `json:"pagination"`
}

type CreatePatientResponse struct {
	Message string               `json:"message"`
	Patient PatientShortResponse `json:"patient"`
}

type PatientShortResponse struct {
	ID       uint   `json:"id"`
	FullName string `json:"full_name"`
}
