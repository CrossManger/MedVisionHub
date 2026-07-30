package database

import (
	"log"
	"time"

	"medvision-hub/internal/models"
	"medvision-hub/pkg/utils"
)

func strPtr(s string) *string {
	return &s
}

func boolPtr(b bool) *bool {
	return &b
}

// Seed populates the database with default roles, permissions, and sample users/patients
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

	// 4. Sample Demo Users
	hashedPassword, err := utils.HashPassword("123456")
	if err != nil {
		log.Printf("Failed to hash default password: %v", err)
	} else {
		sampleUsers := []models.User{
			{Username: "admin", Email: "admin@medvision.com", PasswordHash: hashedPassword, FullName: "Quản Trị Viên Hệ Thống", RoleID: 1, IsActive: boolPtr(true)},
			{Username: "doctor", Email: "doctor@medvision.com", PasswordHash: hashedPassword, FullName: "BS. Nguyễn Văn Khám", RoleID: 2, IsActive: boolPtr(true)},
			{Username: "patient", Email: "patient@medvision.com", PasswordHash: hashedPassword, FullName: "Trần Văn Bệnh Nhân", RoleID: 3, IsActive: boolPtr(true)},
		}

		for _, u := range sampleUsers {
			var existing models.User
			if err := DB.Where("username = ?", u.Username).First(&existing).Error; err != nil {
				if err := DB.Create(&u).Error; err != nil {
					log.Printf("Failed to create sample user %s: %v", u.Username, err)
				} else {
					log.Printf("Seeded sample user: %s", u.Username)
				}
			}
		}
	}

	// 5. Sample Patient Record linked to sample User "patient" (userID of patient)
	var patientUser models.User
	if err := DB.Where("username = ?", "patient").First(&patientUser).Error; err == nil {
		var existingPatient models.Patient
		if err := DB.Where("user_id = ?", patientUser.ID).First(&existingPatient).Error; err != nil {
			dob := time.Date(1995, 5, 15, 0, 0, 0, 0, time.UTC)
			creatorID := uint(2) // Doctor ID
			p := models.Patient{
				UserID:         &patientUser.ID,
				FullName:       "Trần Văn Bệnh Nhân",
				DateOfBirth:    &dob,
				Gender:         strPtr("male"),
				Phone:          strPtr("0901234567"),
				Address:        strPtr("123 Nguyễn Trãi, Q.5, TP.HCM"),
				MedicalHistory: strPtr("Tiền sử dị ứng Penicillin"),
				CreatedBy:      &creatorID,
			}
			if err := DB.Create(&p).Error; err == nil {
				log.Printf("Seeded sample patient record linked to user_id: %d", patientUser.ID)
			}
		}
	}

	log.Println("Seeding completed.")
	return nil
}
