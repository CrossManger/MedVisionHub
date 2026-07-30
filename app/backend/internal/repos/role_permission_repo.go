package repos

import (
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type RolePermissionRepository interface {
	DeleteByRoleID(roleID uint) error
	BatchCreate(rolePermissions []models.RolePermission) error
}

type rolePermissionRepository struct {
	db *gorm.DB
}

func NewRolePermissionRepository() RolePermissionRepository {
	return &rolePermissionRepository{db: database.DB}
}

func (r *rolePermissionRepository) DeleteByRoleID(roleID uint) error {
	return r.db.Where("role_id = ?", roleID).Delete(&models.RolePermission{}).Error
}

func (r *rolePermissionRepository) BatchCreate(rolePermissions []models.RolePermission) error {
	if len(rolePermissions) == 0 {
		return nil
	}
	return r.db.Create(&rolePermissions).Error
}
