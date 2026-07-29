package repos

import (
	"errors"
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type PatientRepository interface {
	FindAll(page, limit int, search string) ([]models.Patient, int64, error)
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

func (r *patientRepository) FindAll(page, limit int, search string) ([]models.Patient, int64, error) {
	var patients []models.Patient
	var total int64

	query := r.db.Model(&models.Patient{})

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("full_name ILIKE ? OR phone ILIKE ?", searchPattern, searchPattern)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&patients).Error
	if err != nil {
		return nil, 0, err
	}

	return patients, total, nil
}

func (r *patientRepository) FindByID(id uint) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.Preload("User").Preload("Creator").First(&patient, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &patient, nil
}

func (r *patientRepository) Create(patient *models.Patient) error {
	return r.db.Create(patient).Error
}

func (r *patientRepository) Update(patient *models.Patient) error {
	return r.db.Save(patient).Error
}

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
