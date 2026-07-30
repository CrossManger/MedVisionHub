package dto

import "time"

// NotificationResponse defines a single notification item returned to the client.
type NotificationResponse struct {
	ID            uint      `json:"id"`
	Title         string    `json:"title"`
	Message       string    `json:"message"`
	Type          string    `json:"type"`
	IsRead        bool      `json:"is_read"`
	RelatedEntity *string   `json:"related_entity"`
	RelatedID     *uint     `json:"related_id"`
	CreatedAt     time.Time `json:"created_at"`
}

// NotificationListResponse defines the response for GET /notifications.
type NotificationListResponse struct {
	Data        []NotificationResponse `json:"data"`
	UnreadCount int64                  `json:"unread_count"`
}

// CompleteScanRequest defines the request body for PUT /scans/:id/complete.
type CompleteScanRequest struct {
	DiagnosticResult *string `json:"diagnostic_result"`
}
