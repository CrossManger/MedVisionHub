package models

import "time"

// Image represents uploaded medical image metadata
type Image struct {
	ID               uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	SessionID        uint        `gorm:"not null;index" json:"session_id"`
	Session          ScanSession `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE;" json:"session"`
	FileName         string      `gorm:"type:varchar(255);not null" json:"file_name"`
	FileURL          string      `gorm:"type:varchar(500);not null" json:"file_url"`
	FileSize         *int64      `json:"file_size"`
	MimeType         *string     `gorm:"type:varchar(100)" json:"mime_type"`
	DiagnosticResult *string     `gorm:"type:text" json:"diagnostic_result"`
	UploadedBy       *uint       `json:"uploaded_by"`
	Uploader         *User       `gorm:"foreignKey:UploadedBy;constraint:OnDelete:SET NULL;" json:"uploader"`
	CreatedAt        time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
}
