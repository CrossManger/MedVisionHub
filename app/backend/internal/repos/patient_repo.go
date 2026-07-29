package repos

import (
	"errors"
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type PatientRepository interface {
	FindAll(page, limit int, search string) ([]models.Patient, error)
	Count(search string) (int64, error)
	FindByID(id uint) (*models.Patient, error)
	Create(patient *models.Patient) error
	Update(patient *models.Patient) error
	Delete(id uint) error
}

type patientRepository struct {
	db *gorm.DB
}

func NewPatientRepository() PatientRepository {
	return &patientRepository{db: database.DB}
}

// FindAll retrieves a paginated list of patients with optional name search
func (r *patientRepository) FindAll(page, limit int, search string) ([]models.Patient, error) {
	var patients []models.Patient
	offset := (page - 1) * limit

	query := r.db.Model(&models.Patient{})
	if search != "" {
		query = query.Where("full_name ILIKE ?", "%"+search+"%")
	}

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&patients).Error

	return patients, err
}

// Count returns the total number of patients matching the optional search
func (r *patientRepository) Count(search string) (int64, error) {
	var count int64
	query := r.db.Model(&models.Patient{})
	if search != "" {
		query = query.Where("full_name ILIKE ?", "%"+search+"%")
	}
	err := query.Count(&count).Error
	return count, err
}

// FindByID retrieves a single patient with their scan sessions preloaded
func (r *patientRepository) FindByID(id uint) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.
		Preload("ScanSessions").
		First(&patient, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &patient, nil
}

// Create inserts a new patient record
func (r *patientRepository) Create(patient *models.Patient) error {
	return r.db.Create(patient).Error
}

// Update saves changes to an existing patient record
func (r *patientRepository) Update(patient *models.Patient) error {
	return r.db.Save(patient).Error
}

// Delete soft-deletes a patient by ID (hard delete since no DeletedAt field)
func (r *patientRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Patient{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
