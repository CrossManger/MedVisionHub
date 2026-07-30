package repos

import (
	"medvision-hub/internal/models"
	"medvision-hub/pkg/database"

	"gorm.io/gorm"
)

type NotificationRepository interface {
	Create(notif *models.Notification) error
	FindByUserID(userID uint, unreadOnly bool) ([]models.Notification, int64, error)
	MarkAsRead(id uint, userID uint) error
	CountUnread(userID uint) (int64, error)
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository() NotificationRepository {
	return &notificationRepository{db: database.DB}
}

func (r *notificationRepository) Create(notif *models.Notification) error {
	return r.db.Create(notif).Error
}

func (r *notificationRepository) FindByUserID(userID uint, unreadOnly bool) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var unreadCount int64

	query := r.db.Model(&models.Notification{}).Where("user_id = ?", userID)

	// Count unread notifications
	if err := r.db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount).Error; err != nil {
		return nil, 0, err
	}

	if unreadOnly {
		query = query.Where("is_read = ?", false)
	}

	err := query.Order("created_at DESC").Limit(50).Find(&notifications).Error
	if err != nil {
		return nil, 0, err
	}

	return notifications, unreadCount, nil
}

func (r *notificationRepository) MarkAsRead(id uint, userID uint) error {
	return r.db.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_read", true).Error
}

func (r *notificationRepository) CountUnread(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count).Error
	return count, err
}
