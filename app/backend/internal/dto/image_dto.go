package dto

import "time"

// ImageResponse defines the structure for single image response
type ImageResponse struct {
	ID               uint      `json:"id"`
	SessionID        uint      `json:"session_id"`
	FileName         string    `json:"file_name"`
	FileURL          string    `json:"file_url"`
	FileSize         *int64    `json:"file_size"`
	MimeType         *string   `json:"mime_type"`
	DiagnosticResult *string   `json:"diagnostic_result"`
	UploadedBy       *uint     `json:"uploaded_by"`
	UploaderName     *string   `json:"uploader_name,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// ImageListResponse defines the structure for listing images of a scan session
type ImageListResponse struct {
	Data []ImageResponse `json:"data"`
}
