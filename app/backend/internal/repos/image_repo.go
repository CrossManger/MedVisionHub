package repos

import (
	"errors"
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type ImageRepository interface {
	Create(image *models.Image) error
	FindAllByScanID(scanID uint) ([]models.Image, error)
	FindByID(id uint) (*models.Image, error)
	Delete(id uint) error
}

type imageRepository struct {
	db *gorm.DB
}

func NewImageRepository() ImageRepository {
	return &imageRepository{db: database.DB}
}

func (r *imageRepository) Create(image *models.Image) error {
	return r.db.Create(image).Error
}

func (r *imageRepository) FindAllByScanID(scanID uint) ([]models.Image, error) {
	var images []models.Image
	err := r.db.Preload("Uploader").Where("session_id = ?", scanID).Order("created_at DESC").Find(&images).Error
	if err != nil {
		return nil, err
	}
	return images, nil
}

func (r *imageRepository) FindByID(id uint) (*models.Image, error) {
	var image models.Image
	err := r.db.Preload("Uploader").First(&image, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &image, nil
}

func (r *imageRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Image{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
