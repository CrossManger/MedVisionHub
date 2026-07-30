package services

import (
	"fmt"
	"time"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
	ws "medvision-hub/internal/websocket"
)

type NotificationService interface {
	GetNotifications(userID uint, unreadOnly bool) (*dto.NotificationListResponse, error)
	MarkAsRead(id uint, userID uint) error
	CreateAndBroadcast(userID uint, title, message, notifType, relatedEntity string, relatedID uint) error
}

type notificationService struct {
	notifRepo repos.NotificationRepository
	hub       *ws.Hub
}

func NewNotificationService(notifRepo repos.NotificationRepository, hub *ws.Hub) NotificationService {
	return &notificationService{
		notifRepo: notifRepo,
		hub:       hub,
	}
}

func (s *notificationService) GetNotifications(userID uint, unreadOnly bool) (*dto.NotificationListResponse, error) {
	list, unreadCount, err := s.notifRepo.FindByUserID(userID, unreadOnly)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy danh sách thông báo: %w", err)
	}

	responses := make([]dto.NotificationResponse, 0, len(list))
	for _, n := range list {
		notifType := "info"
		if n.Type != nil {
			notifType = *n.Type
		}
		isRead := false
		if n.IsRead != nil {
			isRead = *n.IsRead
		}

		responses = append(responses, dto.NotificationResponse{
			ID:            n.ID,
			Title:         n.Title,
			Message:       n.Message,
			Type:          notifType,
			IsRead:        isRead,
			RelatedEntity: n.RelatedEntity,
			RelatedID:     n.RelatedID,
			CreatedAt:     n.CreatedAt,
		})
	}

	return &dto.NotificationListResponse{
		Data:        responses,
		UnreadCount: unreadCount,
	}, nil
}

func (s *notificationService) MarkAsRead(id uint, userID uint) error {
	return s.notifRepo.MarkAsRead(id, userID)
}

func (s *notificationService) CreateAndBroadcast(userID uint, title, message, notifType, relatedEntity string, relatedID uint) error {
	isRead := false
	notif := &models.Notification{
		UserID:        userID,
		Title:         title,
		Message:       message,
		Type:          &notifType,
		IsRead:        &isRead,
		RelatedEntity: &relatedEntity,
		RelatedID:     &relatedID,
	}

	if err := s.notifRepo.Create(notif); err != nil {
		return fmt.Errorf("lỗi lưu thông báo vào database: %w", err)
	}

	// Broadcast via WebSocket Hub if connected
	if s.hub != nil {
		event := &ws.NotificationEvent{
			ID:            notif.ID,
			UserID:        userID,
			Title:         title,
			Message:       message,
			Type:          notifType,
			IsRead:        false,
			RelatedEntity: relatedEntity,
			RelatedID:     relatedID,
			CreatedAt:     time.Now().Format(time.RFC3339),
		}
		s.hub.SendToUser(event)
	}

	return nil
}
