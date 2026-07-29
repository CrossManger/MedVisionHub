package services

import (
	"errors"
	"fmt"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
)

var (
	ErrScanNotFound = errors.New("không tìm thấy ca chụp y tế")
)

type ScanService interface {
	CreateScan(patientID uint, req dto.CreateScanRequest, doctorID uint) (*dto.ScanResponse, error)
	GetScansByPatientID(patientID uint) (*dto.ScanListResponse, error)
	GetScanByID(id uint) (*dto.ScanResponse, error)
}

type scanService struct {
	scanRepo    repos.ScanSessionRepository
	patientRepo repos.PatientRepository
}

func NewScanService(scanRepo repos.ScanSessionRepository, patientRepo repos.PatientRepository) ScanService {
	return &scanService{
		scanRepo:    scanRepo,
		patientRepo: patientRepo,
	}
}

func (s *scanService) CreateScan(patientID uint, req dto.CreateScanRequest, doctorID uint) (*dto.ScanResponse, error) {
	// Verify patient exists
	patient, err := s.patientRepo.FindByID(patientID)
	if err != nil {
		return nil, fmt.Errorf("lỗi kiểm tra bệnh nhân: %w", err)
	}
	if patient == nil {
		return nil, ErrPatientNotFound
	}

	scan := &models.ScanSession{
		PatientID: patientID,
		DoctorID:  doctorID,
		ScanType:  req.ScanType,
		Status:    "pending",
		Notes:     req.Notes,
	}

	if err := s.scanRepo.Create(scan); err != nil {
		return nil, fmt.Errorf("lỗi tạo ca chụp: %w", err)
	}

	res := mapScanToResponse(scan, 0)
	return &res, nil
}

func (s *scanService) GetScansByPatientID(patientID uint) (*dto.ScanListResponse, error) {
	patient, err := s.patientRepo.FindByID(patientID)
	if err != nil {
		return nil, fmt.Errorf("lỗi kiểm tra bệnh nhân: %w", err)
	}
	if patient == nil {
		return nil, ErrPatientNotFound
	}

	scans, err := s.scanRepo.FindAllByPatientID(patientID)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy danh sách ca chụp: %w", err)
	}

	scanResponses := make([]dto.ScanResponse, 0, len(scans))
	for _, sc := range scans {
		imageCount, _ := s.scanRepo.CountImagesBySessionID(sc.ID)
		scanResponses = append(scanResponses, mapScanToResponse(&sc, imageCount))
	}

	return &dto.ScanListResponse{
		Data: scanResponses,
	}, nil
}

func (s *scanService) GetScanByID(id uint) (*dto.ScanResponse, error) {
	scan, err := s.scanRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy thông tin ca chụp: %w", err)
	}
	if scan == nil {
		return nil, ErrScanNotFound
	}

	imageCount, _ := s.scanRepo.CountImagesBySessionID(scan.ID)
	res := mapScanToResponse(scan, imageCount)
	return &res, nil
}

func mapScanToResponse(s *models.ScanSession, imageCount int64) dto.ScanResponse {
	return dto.ScanResponse{
		ID:         s.ID,
		PatientID:  s.PatientID,
		DoctorID:   s.DoctorID,
		ScanType:   s.ScanType,
		Status:     s.Status,
		Notes:      s.Notes,
		ImageCount: imageCount,
		CreatedAt:  s.CreatedAt,
		UpdatedAt:  s.UpdatedAt,
	}
}
