package models

import "time"

// Patient represents a patient profile
type Patient struct {
	ID             uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         *uint      `json:"user_id"`
	User           *User      `gorm:"foreignKey:UserID;constraint:OnDelete:SET NULL;" json:"user"`
	FullName       string     `gorm:"type:varchar(255);not null" json:"full_name"`
	DateOfBirth    *time.Time `gorm:"type:date" json:"date_of_birth"`
	Gender         *string    `gorm:"type:varchar(10)" json:"gender"`
	Phone          *string    `gorm:"type:varchar(20)" json:"phone"`
	Address        *string    `gorm:"type:text" json:"address"`
	MedicalHistory *string    `gorm:"type:text" json:"medical_history"`
	CreatedBy      *uint      `json:"created_by"`
	Creator        *User      `gorm:"foreignKey:CreatedBy;constraint:OnDelete:SET NULL;" json:"creator"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}
