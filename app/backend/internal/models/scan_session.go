package models

import "time"

// ScanSession represents a medical imaging session
type ScanSession struct {
	ID               uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PatientID        uint      `gorm:"not null;index" json:"patient_id"`
	Patient          Patient   `gorm:"foreignKey:PatientID;constraint:OnDelete:CASCADE;" json:"patient"`
	DoctorID         uint      `gorm:"not null;index" json:"doctor_id"`
	Doctor           User      `gorm:"foreignKey:DoctorID;constraint:OnDelete:RESTRICT;" json:"doctor"`
	ScanType         string    `gorm:"type:varchar(50);not null" json:"scan_type"`
	Status           string    `gorm:"type:varchar(30);not null;default:'pending'" json:"status"`
	Notes            *string   `gorm:"type:text" json:"notes"`
	DiagnosticResult *string   `gorm:"type:text" json:"diagnostic_result"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
