package models

import "time"

// User represents an account in the system
type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"type:varchar(100);not null;uniqueIndex" json:"username"`
	Email        string    `gorm:"type:varchar(255);not null;uniqueIndex" json:"email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	FullName     string    `gorm:"type:varchar(255);not null" json:"full_name"`
	RoleID       uint      `gorm:"not null" json:"role_id"`
	Role         Role      `gorm:"foreignKey:RoleID;constraint:OnDelete:RESTRICT;" json:"role"`
	IsActive     *bool     `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
