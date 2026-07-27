package models

import "time"

// RolePermission represents the many-to-many relationship between Role and Permission
type RolePermission struct {
	ID           uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID       uint       `gorm:"not null;uniqueIndex:idx_role_permission" json:"role_id"`
	Role         Role       `gorm:"foreignKey:RoleID;constraint:OnDelete:CASCADE;" json:"-"`
	PermissionID uint       `gorm:"not null;uniqueIndex:idx_role_permission" json:"permission_id"`
	Permission   Permission `gorm:"foreignKey:PermissionID;constraint:OnDelete:CASCADE;" json:"-"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}
