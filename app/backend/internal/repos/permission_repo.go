package repos

import (
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type PermissionRepository interface {
	FindAll() ([]models.Permission, error)
	FindByIDs(ids []uint) ([]models.Permission, error)
}

type permissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository() PermissionRepository {
	return &permissionRepository{db: database.DB}
}

func (r *permissionRepository) FindAll() ([]models.Permission, error) {
	var permissions []models.Permission
	err := r.db.Find(&permissions).Error
	return permissions, err
}

func (r *permissionRepository) FindByIDs(ids []uint) ([]models.Permission, error) {
	if len(ids) == 0 {
		return []models.Permission{}, nil
	}
	var permissions []models.Permission
	err := r.db.Where("id IN ?", ids).Find(&permissions).Error
	return permissions, err
}
