package services

import (
	"errors"
	"fmt"
	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
)

var (
	ErrRoleIDNotFound          = errors.New("Role ID không tồn tại")
	ErrSomePermissionsNotFound = errors.New("Một số permission_ids không hợp lệ hoặc không tồn tại")
)

type PermissionService interface {
	GetAllRoles() ([]dto.RoleWithPermissionsResponse, error)
	GetAllPermissions() ([]dto.PermissionResponse, error)
	UpdateRolePermissions(roleID uint, req dto.UpdateRolePermissionsRequest) error
}

type permissionService struct {
	roleRepo           repos.RoleRepository
	permissionRepo     repos.PermissionRepository
	rolePermissionRepo repos.RolePermissionRepository
}

func NewPermissionService(
	roleRepo repos.RoleRepository,
	permissionRepo repos.PermissionRepository,
	rolePermissionRepo repos.RolePermissionRepository,
) PermissionService {
	return &permissionService{
		roleRepo:           roleRepo,
		permissionRepo:     permissionRepo,
		rolePermissionRepo: rolePermissionRepo,
	}
}

func (s *permissionService) GetAllRoles() ([]dto.RoleWithPermissionsResponse, error) {
	roles, rolePermMap, err := s.roleRepo.FindAllWithPermissions()
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy danh sách role: %w", err)
	}

	var res []dto.RoleWithPermissionsResponse
	for _, r := range roles {
		desc := ""
		if r.Description != nil {
			desc = *r.Description
		}

		permList := []dto.PermissionResponse{}
		if perms, exists := rolePermMap[r.ID]; exists {
			for _, p := range perms {
				pDesc := ""
				if p.Description != nil {
					pDesc = *p.Description
				}
				permList = append(permList, dto.PermissionResponse{
					ID:          p.ID,
					Name:        p.Name,
					Description: pDesc,
				})
			}
		}

		res = append(res, dto.RoleWithPermissionsResponse{
			ID:          r.ID,
			Name:        r.Name,
			Description: desc,
			Permissions: permList,
		})
	}

	return res, nil
}

func (s *permissionService) GetAllPermissions() ([]dto.PermissionResponse, error) {
	perms, err := s.permissionRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy danh sách permission: %w", err)
	}

	var res []dto.PermissionResponse
	for _, p := range perms {
		pDesc := ""
		if p.Description != nil {
			pDesc = *p.Description
		}
		res = append(res, dto.PermissionResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: pDesc,
		})
	}

	return res, nil
}

func (s *permissionService) UpdateRolePermissions(roleID uint, req dto.UpdateRolePermissionsRequest) error {
	role, err := s.roleRepo.FindRoleByID(roleID)
	if err != nil {
		return fmt.Errorf("lỗi kiểm tra role: %w", err)
	}
	if role == nil {
		return ErrRoleIDNotFound
	}

	if len(req.PermissionIDs) > 0 {
		perms, err := s.permissionRepo.FindByIDs(req.PermissionIDs)
		if err != nil {
			return fmt.Errorf("lỗi kiểm tra permissions: %w", err)
		}
		if len(perms) != len(req.PermissionIDs) {
			return ErrSomePermissionsNotFound
		}
	}

	if err := s.rolePermissionRepo.DeleteByRoleID(roleID); err != nil {
		return fmt.Errorf("lỗi xóa permissions cũ: %w", err)
	}

	if len(req.PermissionIDs) > 0 {
		var rolePerms []models.RolePermission
		for _, permID := range req.PermissionIDs {
			rolePerms = append(rolePerms, models.RolePermission{
				RoleID:       roleID,
				PermissionID: permID,
			})
		}
		if err := s.rolePermissionRepo.BatchCreate(rolePerms); err != nil {
			return fmt.Errorf("lỗi thêm permissions mới: %w", err)
		}
	}

	return nil
}
