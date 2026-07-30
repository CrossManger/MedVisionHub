package dto

import "time"

// CreateScanRequest defines the payload for POST /patients/:patient_id/scans
type CreateScanRequest struct {
	ScanType string  `json:"scan_type" binding:"required,oneof=xray mri ct_scan ultrasound"`
	Notes    *string `json:"notes"`
}

// ScanResponse defines the response payload for a single scan session
type ScanResponse struct {
	ID               uint      `json:"id"`
	PatientID        uint      `json:"patient_id"`
	DoctorID         uint      `json:"doctor_id"`
	ScanType         string    `json:"scan_type"`
	Status           string    `json:"status"`
	Notes            *string   `json:"notes"`
	DiagnosticResult *string   `json:"diagnostic_result"`
	ImageCount       int64     `json:"image_count"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// ScanListResponse defines the list response payload for GET /patients/:patient_id/scans
type ScanListResponse struct {
	Data []ScanResponse `json:"data"`
}
