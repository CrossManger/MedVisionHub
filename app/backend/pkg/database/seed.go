package database

import (
	"log"
	"medvision-hub/internal/models"
)

func strPtr(s string) *string {
	return &s
}

// Seed populates the database with default roles and permissions
func Seed() error {
	if DB == nil {
		return nil
	}
	log.Println("Seeding database...")

	// 1. Roles
	roles := []models.Role{
		{ID: 1, Name: "admin", Description: strPtr("Quản trị viên hệ thống")},
		{ID: 2, Name: "doctor", Description: strPtr("Bác sĩ")},
		{ID: 3, Name: "patient", Description: strPtr("Bệnh nhân")},
	}

	for _, role := range roles {
		if err := DB.FirstOrCreate(&role, models.Role{ID: role.ID}).Error; err != nil {
			return err
		}
		// update details just in case
		DB.Model(&role).Updates(models.Role{Name: role.Name, Description: role.Description})
	}

	// 2. Permissions
	permissions := []models.Permission{
		{ID: 1, Name: "can_view_patient", Description: strPtr("Xem danh sách bệnh nhân")},
		{ID: 2, Name: "can_create_patient", Description: strPtr("Tạo hồ sơ bệnh nhân mới")},
		{ID: 3, Name: "can_edit_patient", Description: strPtr("Chỉnh sửa hồ sơ bệnh nhân")},
		{ID: 4, Name: "can_delete_patient", Description: strPtr("Xóa hồ sơ bệnh nhân")},
		{ID: 5, Name: "can_upload_image", Description: strPtr("Upload hình ảnh y tế")},
		{ID: 6, Name: "can_view_image", Description: strPtr("Xem hình ảnh y tế")},
		{ID: 7, Name: "can_create_scan", Description: strPtr("Tạo ca chụp mới")},
		{ID: 8, Name: "can_manage_users", Description: strPtr("Quản lý tài khoản người dùng")},
		{ID: 9, Name: "can_manage_permissions", Description: strPtr("Quản lý phân quyền hệ thống")},
	}

	for _, p := range permissions {
		if err := DB.FirstOrCreate(&p, models.Permission{ID: p.ID}).Error; err != nil {
			return err
		}
		DB.Model(&p).Updates(models.Permission{Name: p.Name, Description: p.Description})
	}

	// 3. Role Permissions
	rolePermsMap := map[uint][]uint{
		1: {1, 2, 3, 4, 5, 6, 7, 8, 9}, // admin
		2: {1, 2, 3, 5, 6, 7},          // doctor
		3: {6},                         // patient
	}

	for roleID, permIDs := range rolePermsMap {
		for _, permID := range permIDs {
			rp := models.RolePermission{RoleID: roleID, PermissionID: permID}
			if err := DB.FirstOrCreate(&rp, models.RolePermission{RoleID: roleID, PermissionID: permID}).Error; err != nil {
				return err
			}
		}
	}

	log.Println("Seeding completed.")
	return nil
}
