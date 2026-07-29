package services

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
	"medvision-hub/pkg/config"

	"github.com/google/uuid"
)

var (
	ErrImageNotFound     = errors.New("không tìm thấy hình ảnh")
	ErrInvalidFileType  = errors.New("định dạng file không hợp lệ (chấp nhận: jpg, jpeg, png, dicom, dcm)")
	ErrFileTooLarge      = errors.New("dung lượng file vượt quá giới hạn (tối đa 10MB)")
	MaxFileSize    int64 = 10 * 1024 * 1024 // 10 MB
)

type ImageService interface {
	UploadImage(scanID uint, file *multipart.FileHeader, uploadedBy uint) (*dto.ImageResponse, error)
	GetImagesByScan(scanID uint) (*dto.ImageListResponse, error)
	DeleteImage(id uint) error
}

type imageService struct {
	imageRepo repos.ImageRepository
}

func NewImageService(imageRepo repos.ImageRepository) ImageService {
	return &imageService{imageRepo: imageRepo}
}

func (s *imageService) UploadImage(scanID uint, fileHeader *multipart.FileHeader, uploadedBy uint) (*dto.ImageResponse, error) {
	// Validate file size
	if fileHeader.Size > MaxFileSize {
		return nil, ErrFileTooLarge
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

	// Ensure upload directory exists: uploads/images/
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
	// Extract relative file path from FileURL (e.g. /uploads/images/xyz.jpg -> images/xyz.jpg)
	relPath := strings.TrimPrefix(img.FileURL, "/uploads/")
	physicalPath := filepath.Join(baseUploadDir, relPath)

	if err := os.Remove(physicalPath); err != nil && !os.IsNotExist(err) {
		// Log warning but proceed with DB deletion if file is missing
		fmt.Printf("Cảnh báo: Không tìm thấy hoặc không xóa được file vật lý %s: %v\n", physicalPath, err)
	}

	// Delete DB record
	return s.imageRepo.Delete(id)
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
