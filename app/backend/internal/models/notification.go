package models

import "time"

// Notification represents a system notification for a user
type Notification struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint      `gorm:"not null;index:idx_user_read" json:"user_id"`
	User          User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"user"`
	Title         string    `gorm:"type:varchar(255);not null" json:"title"`
	Message       string    `gorm:"type:text;not null" json:"message"`
	Type          *string   `gorm:"type:varchar(50);default:'info'" json:"type"`
	IsRead        *bool     `gorm:"default:false;index:idx_user_read" json:"is_read"`
	RelatedEntity *string   `gorm:"type:varchar(50)" json:"related_entity"`
	RelatedID     *uint     `json:"related_id"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}
