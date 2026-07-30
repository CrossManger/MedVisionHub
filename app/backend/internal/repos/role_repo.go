package repos

import (
	"errors"
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type RoleRepository interface {
	FindAllWithPermissions() ([]models.Role, map[uint][]models.Permission, error)
	FindRoleByID(id uint) (*models.Role, error)
}

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository() RoleRepository {
	return &roleRepository{db: database.DB}
}

func (r *roleRepository) FindAllWithPermissions() ([]models.Role, map[uint][]models.Permission, error) {
	var roles []models.Role
	if err := r.db.Find(&roles).Error; err != nil {
		return nil, nil, err
	}

	rolePermMap := make(map[uint][]models.Permission)

	type RolePermResult struct {
		RoleID      uint
		ID          uint
		Name        string
		Description *string
	}

	var results []RolePermResult
	err := r.db.Table("role_permissions").
		Select("role_permissions.role_id, permissions.id, permissions.name, permissions.description").
		Joins("JOIN permissions ON permissions.id = role_permissions.permission_id").
		Scan(&results).Error

	if err != nil {
		return nil, nil, err
	}

	for _, res := range results {
		desc := ""
		if res.Description != nil {
			desc = *res.Description
		}
		rolePermMap[res.RoleID] = append(rolePermMap[res.RoleID], models.Permission{
			ID:          res.ID,
			Name:        res.Name,
			Description: &desc,
		})
	}

	return roles, rolePermMap, nil
}

func (r *roleRepository) FindRoleByID(id uint) (*models.Role, error) {
	var role models.Role
	err := r.db.Where("id = ?", id).First(&role).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}
