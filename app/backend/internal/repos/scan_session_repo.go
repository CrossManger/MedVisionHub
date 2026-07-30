package repos

import (
	"errors"
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type ScanSessionRepository interface {
	Create(scan *models.ScanSession) error
	FindAllByPatientID(patientID uint) ([]models.ScanSession, error)
	FindByID(id uint) (*models.ScanSession, error)
	UpdateStatus(id uint, status string) error
	UpdateStatusAndResult(id uint, status string, diagnosticResult *string) error
	CountImagesBySessionID(sessionID uint) (int64, error)
	GetDashboardStats() (totalScans, completedScans, pendingScans, inProgressScans int64, scansByType map[string]int64, err error)
}

type scanSessionRepository struct {
	db *gorm.DB
}

func NewScanSessionRepository() ScanSessionRepository {
	return &scanSessionRepository{db: database.DB}
}

func (r *scanSessionRepository) Create(scan *models.ScanSession) error {
	return r.db.Create(scan).Error
}

func (r *scanSessionRepository) FindAllByPatientID(patientID uint) ([]models.ScanSession, error) {
	var scans []models.ScanSession
	err := r.db.Preload("Patient").Preload("Doctor").Where("patient_id = ?", patientID).Order("created_at DESC").Find(&scans).Error
	return scans, err
}

func (r *scanSessionRepository) FindByID(id uint) (*models.ScanSession, error) {
	var scan models.ScanSession
	err := r.db.Preload("Patient").Preload("Doctor").First(&scan, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &scan, nil
}

func (r *scanSessionRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.ScanSession{}).Where("id = ?", id).Update("status", status).Error
}

func (r *scanSessionRepository) UpdateStatusAndResult(id uint, status string, diagnosticResult *string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if diagnosticResult != nil {
		updates["diagnostic_result"] = *diagnosticResult
	}
	return r.db.Model(&models.ScanSession{}).Where("id = ?", id).Updates(updates).Error
}

func (r *scanSessionRepository) CountImagesBySessionID(sessionID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Image{}).Where("session_id = ?", sessionID).Count(&count).Error
	return count, err
}

func (r *scanSessionRepository) GetDashboardStats() (totalScans, completedScans, pendingScans, inProgressScans int64, scansByType map[string]int64, err error) {
	err = r.db.Model(&models.ScanSession{}).Count(&totalScans).Error
	if err != nil {
		return
	}

	r.db.Model(&models.ScanSession{}).Where("status = ?", "completed").Count(&completedScans)
	r.db.Model(&models.ScanSession{}).Where("status = ?", "pending").Count(&pendingScans)
	r.db.Model(&models.ScanSession{}).Where("status = ?", "in_progress").Count(&inProgressScans)

	scansByType = make(map[string]int64)
	var typeCounts []struct {
		ScanType string
		Count    int64
	}
	r.db.Model(&models.ScanSession{}).Select("scan_type, count(*) as count").Group("scan_type").Scan(&typeCounts)
	for _, tc := range typeCounts {
		scansByType[tc.ScanType] = tc.Count
	}

	return
}
