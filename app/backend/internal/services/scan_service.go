package services

import (
	"errors"
	"fmt"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
)

var (
	ErrScanNotFound              = errors.New("không tìm thấy ca chụp y tế")
	ErrUnauthorizedPatientAccess = errors.New("bạn chỉ có thể xem thông tin ca chụp thuộc hồ sơ cá nhân của mình")
	ErrScanAlreadyCompleted      = errors.New("ca chụp này đã được hoàn tất")
)

// NotificationBroadcaster is a minimal interface that scan_service depends on
// to trigger realtime notifications. Person A (WebSocket module) will implement this.
type NotificationBroadcaster interface {
	CreateAndBroadcast(userID uint, title, message, notifType, relatedEntity string, relatedID uint) error
}

type ScanService interface {
	CreateScan(patientID uint, req dto.CreateScanRequest, doctorID uint) (*dto.ScanResponse, error)
	GetScansByPatientID(patientID uint) (*dto.ScanListResponse, error)
	GetMyScans(userID uint) (*dto.ScanListResponse, error)
	GetScanByID(id uint, requestingUserID uint, requestingRole string) (*dto.ScanResponse, error)
	CompleteScan(scanID uint, req dto.CompleteScanRequest, requestingUserID uint, requestingRole string) error
}

type scanService struct {
	scanRepo    repos.ScanSessionRepository
	patientRepo repos.PatientRepository
	notifier    NotificationBroadcaster // may be nil if A has not wired it yet
}

func NewScanService(scanRepo repos.ScanSessionRepository, patientRepo repos.PatientRepository) ScanService {
	return &scanService{
		scanRepo:    scanRepo,
		patientRepo: patientRepo,
		notifier:    nil,
	}
}

// NewScanServiceWithNotifier creates the service with an active notification broadcaster.
// Called by main.go once A's hub is ready.
func NewScanServiceWithNotifier(
	scanRepo repos.ScanSessionRepository,
	patientRepo repos.PatientRepository,
	notifier NotificationBroadcaster,
) ScanService {
	return &scanService{
		scanRepo:    scanRepo,
		patientRepo: patientRepo,
		notifier:    notifier,
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

func (s *scanService) GetMyScans(userID uint) (*dto.ScanListResponse, error) {
	patient, err := s.patientRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("lỗi kiểm tra bệnh nhân: %w", err)
	}
	if patient == nil {
		return &dto.ScanListResponse{Data: []dto.ScanResponse{}}, nil
	}
	return s.GetScansByPatientID(patient.ID)
}

func (s *scanService) GetScanByID(id uint, requestingUserID uint, requestingRole string) (*dto.ScanResponse, error) {
	scan, err := s.scanRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy thông tin ca chụp: %w", err)
	}
	if scan == nil {
		return nil, ErrScanNotFound
	}

	// Data Ownership check: If caller is a patient, verify they own this scan
	if requestingRole == "patient" {
		patient, err := s.patientRepo.FindByUserID(requestingUserID)
		if err != nil || patient == nil || scan.PatientID != patient.ID {
			return nil, ErrUnauthorizedPatientAccess
		}
	}

	imageCount, _ := s.scanRepo.CountImagesBySessionID(scan.ID)
	res := mapScanToResponse(scan, imageCount)
	return &res, nil
}

// CompleteScan marks a scan session as "completed", persists the diagnostic result,
// and broadcasts a realtime notification to the patient (if linked to a user account).
func (s *scanService) CompleteScan(scanID uint, req dto.CompleteScanRequest, requestingUserID uint, requestingRole string) error {
	scan, err := s.scanRepo.FindByID(scanID)
	if err != nil {
		return fmt.Errorf("lỗi lấy thông tin ca chụp: %w", err)
	}
	if scan == nil {
		return ErrScanNotFound
	}
	if scan.Status == "completed" {
		return ErrScanAlreadyCompleted
	}

	// Only doctors/admins can complete a scan
	if requestingRole == "patient" {
		return ErrUnauthorizedPatientAccess
	}

	if err := s.scanRepo.UpdateStatusAndResult(scanID, "completed", req.DiagnosticResult); err != nil {
		return fmt.Errorf("lỗi cập nhật trạng thái ca chụp: %w", err)
	}

	// Broadcast realtime notification to the patient (best-effort, non-blocking)
	if s.notifier != nil {
		patient, err := s.patientRepo.FindByID(scan.PatientID)
		if err == nil && patient != nil && patient.UserID != nil {
			title := "Chẩn đoán hoàn tất"
			message := fmt.Sprintf("Ca chụp #%d của bạn đã được bác sĩ hoàn tất chẩn đoán.", scanID)
			relatedEntity := "scan_session"
			_ = s.notifier.CreateAndBroadcast(*patient.UserID, title, message, "success", relatedEntity, scanID)
		}
	}

	return nil
}

func mapScanToResponse(s *models.ScanSession, imageCount int64) dto.ScanResponse {
	return dto.ScanResponse{
		ID:               s.ID,
		PatientID:        s.PatientID,
		DoctorID:         s.DoctorID,
		ScanType:         s.ScanType,
		Status:           s.Status,
		Notes:            s.Notes,
		DiagnosticResult: s.DiagnosticResult,
		ImageCount:       imageCount,
		CreatedAt:        s.CreatedAt,
		UpdatedAt:        s.UpdatedAt,
	}
}

