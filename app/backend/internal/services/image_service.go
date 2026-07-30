package services

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
	"medvision-hub/pkg/config"

	"github.com/google/uuid"
)

var (
	ErrImageNotFound    = errors.New("không tìm thấy hình ảnh")
	ErrInvalidFileType = errors.New("định dạng file không hợp lệ (chấp nhận: jpg, jpeg, png, dicom, dcm)")
	ErrFileTooLarge     = errors.New("dung lượng file vượt quá giới hạn")
)

type ImageService interface {
	UploadImage(scanID uint, file *multipart.FileHeader, uploadedBy uint) (*dto.ImageResponse, error)
	GetImagesByScan(scanID uint) (*dto.ImageListResponse, error)
	DeleteImage(id uint) error
}

type imageService struct {
	imageRepo repos.ImageRepository
	scanRepo  repos.ScanSessionRepository
}

func NewImageService(imageRepo repos.ImageRepository, scanRepo repos.ScanSessionRepository) ImageService {
	return &imageService{
		imageRepo: imageRepo,
		scanRepo:  scanRepo,
	}
}

// getMaxFileSizeBytes retrieves maximum allowed file size from .env MAX_FILE_SIZE_MB (default: 10MB)
func getMaxFileSizeBytes() int64 {
	sizeMBStr := config.GetEnv("MAX_FILE_SIZE_MB", "10")
	sizeMB, err := strconv.ParseInt(sizeMBStr, 10, 64)
	if err != nil || sizeMB <= 0 {
		sizeMB = 10
	}
	return sizeMB * 1024 * 1024
}

func (s *imageService) UploadImage(scanID uint, fileHeader *multipart.FileHeader, uploadedBy uint) (*dto.ImageResponse, error) {
	// Validate file size dynamically based on .env config
	maxSizeBytes := getMaxFileSizeBytes()
	if fileHeader.Size > maxSizeBytes {
		maxMB := maxSizeBytes / (1024 * 1024)
		return nil, fmt.Errorf("%w (tối đa %dMB)", ErrFileTooLarge, maxMB)
	}

	// Validate file extension / mime type
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	allowedExts := map[string]bool{
		".jpg":   true,
		".jpeg":  true,
		".png":   true,
		".dcm":   true,
		".dicom": true,
	}
	if !allowedExts[ext] {
		return nil, ErrInvalidFileType
	}

	// Open uploaded file
	src, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("không thể mở file upload: %w", err)
	}
	defer src.Close()

	// Ensure upload directory exists
	baseUploadDir := config.GetEnv("UPLOAD_DIR", "./uploads")
	imagesDir := filepath.Join(baseUploadDir, "images")
	if err := os.MkdirAll(imagesDir, os.ModePerm); err != nil {
		return nil, fmt.Errorf("không thể tạo thư mục lưu ảnh: %w", err)
	}

	// Unique file name generation using UUID
	uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	targetFilePath := filepath.Join(imagesDir, uniqueFileName)

	// Create destination file
	dst, err := os.Create(targetFilePath)
	if err != nil {
		return nil, fmt.Errorf("không thể tạo file lưu trữ: %w", err)
	}
	defer dst.Close()

	// Save file contents
	if _, err = io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("lỗi khi ghi file: %w", err)
	}

	// Prepare database record
	fileURL := fmt.Sprintf("/uploads/images/%s", uniqueFileName)
	fileSize := fileHeader.Size
	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	imgModel := &models.Image{
		SessionID:  scanID,
		FileName:   fileHeader.Filename,
		FileURL:    fileURL,
		FileSize:   &fileSize,
		MimeType:   &mimeType,
		UploadedBy: &uploadedBy,
	}

	if err := s.imageRepo.Create(imgModel); err != nil {
		// Clean up physical file on DB failure
		_ = os.Remove(targetFilePath)
		return nil, fmt.Errorf("không thể lưu metadata vào database: %w", err)
	}

	// Automatically transition scan session status from 'pending' -> 'in_progress'
	if s.scanRepo != nil {
		_ = s.scanRepo.UpdateStatus(scanID, "in_progress")
	}

	resp := mapImageToDTO(imgModel)
	return &resp, nil
}

func (s *imageService) GetImagesByScan(scanID uint) (*dto.ImageListResponse, error) {
	images, err := s.imageRepo.FindAllByScanID(scanID)
	if err != nil {
		return nil, err
	}

	list := make([]dto.ImageResponse, 0, len(images))
	for _, img := range images {
		list = append(list, mapImageToDTO(&img))
	}

	return &dto.ImageListResponse{Data: list}, nil
}

func (s *imageService) DeleteImage(id uint) error {
	img, err := s.imageRepo.FindByID(id)
	if err != nil {
		return err
	}
	if img == nil {
		return ErrImageNotFound
	}

	// Delete physical file
	baseUploadDir := config.GetEnv("UPLOAD_DIR", "./uploads")
	relPath := strings.TrimPrefix(img.FileURL, "/uploads/")
	physicalPath := filepath.Join(baseUploadDir, relPath)

	if err := os.Remove(physicalPath); err != nil && !os.IsNotExist(err) {
		fmt.Printf("Cảnh báo: Không tìm thấy hoặc không xóa được file vật lý %s: %v\n", physicalPath, err)
	}

	// Delete DB record
	if err := s.imageRepo.Delete(id); err != nil {
		return err
	}

	// If all images in this scan session have been deleted, revert status back to 'pending'
	if s.scanRepo != nil {
		remainingCount, _ := s.scanRepo.CountImagesBySessionID(img.SessionID)
		if remainingCount == 0 {
			_ = s.scanRepo.UpdateStatus(img.SessionID, "pending")
		}
	}

	return nil
}

func mapImageToDTO(img *models.Image) dto.ImageResponse {
	var uploaderName *string
	if img.Uploader != nil {
		uploaderName = &img.Uploader.FullName
	}

	return dto.ImageResponse{
		ID:               img.ID,
		SessionID:        img.SessionID,
		FileName:         img.FileName,
		FileURL:          img.FileURL,
		FileSize:         img.FileSize,
		MimeType:         img.MimeType,
		DiagnosticResult: img.DiagnosticResult,
		UploadedBy:       img.UploadedBy,
		UploaderName:     uploaderName,
		CreatedAt:        img.CreatedAt,
		UpdatedAt:        img.UpdatedAt,
	}
}
