package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"

	"gorm.io/gorm"
)

var (
	ErrPatientNotFound = errors.New("patient not found")
)

type PatientService interface {
	GetAllPatients(page, limit int, search string) (*dto.PatientListResponse, error)
	GetPatientByID(id uint) (*dto.PatientDetailResponse, error)
	CreatePatient(req dto.CreatePatientRequest, createdByUserID uint) (*dto.CreatePatientResponse, error)
	UpdatePatient(id uint, req dto.UpdatePatientRequest) error
	DeletePatient(id uint) error
}

type patientService struct {
	patientRepo repos.PatientRepository
}

func NewPatientService(patientRepo repos.PatientRepository) PatientService {
	return &patientService{patientRepo: patientRepo}
}

// GetAllPatients returns a paginated list of patients
func (s *patientService) GetAllPatients(page, limit int, search string) (*dto.PatientListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	patients, err := s.patientRepo.FindAll(page, limit, search)
	if err != nil {
		return nil, fmt.Errorf("error fetching patients: %w", err)
	}

	total, err := s.patientRepo.Count(search)
	if err != nil {
		return nil, fmt.Errorf("error counting patients: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	data := make([]dto.PatientResponse, 0, len(patients))
	for _, p := range patients {
		data = append(data, mapToPatientResponse(p))
	}

	return &dto.PatientListResponse{
		Data: data,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

// GetPatientByID returns full detail of a patient including scan sessions
func (s *patientService) GetPatientByID(id uint) (*dto.PatientDetailResponse, error) {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("error fetching patient: %w", err)
	}
	if patient == nil {
		return nil, ErrPatientNotFound
	}

	scanSessions := make([]dto.PatientDetailScanSession, 0, len(patient.ScanSessions))
	for _, ss := range patient.ScanSessions {
		scanSessions = append(scanSessions, dto.PatientDetailScanSession{
			ID:         ss.ID,
			ScanType:   ss.ScanType,
			Status:     ss.Status,
			CreatedAt:  ss.CreatedAt,
			ImageCount: 0, // Populated by Phase 4 image count logic
		})
	}

	return &dto.PatientDetailResponse{
		ID:             patient.ID,
		UserID:         patient.UserID,
		FullName:       patient.FullName,
		DateOfBirth:    formatDate(patient.DateOfBirth),
		Gender:         patient.Gender,
		Phone:          patient.Phone,
		Address:        patient.Address,
		MedicalHistory: patient.MedicalHistory,
		CreatedBy:      patient.CreatedBy,
		CreatedAt:      patient.CreatedAt,
		UpdatedAt:      patient.UpdatedAt,
		ScanSessions:   scanSessions,
	}, nil
}

// CreatePatient creates a new patient profile
func (s *patientService) CreatePatient(req dto.CreatePatientRequest, createdByUserID uint) (*dto.CreatePatientResponse, error) {
	patient := &models.Patient{
		FullName:       req.FullName,
		Gender:         req.Gender,
		Phone:          req.Phone,
		Address:        req.Address,
		MedicalHistory: req.MedicalHistory,
		CreatedBy:      &createdByUserID,
	}

	// Parse date_of_birth if provided
	if req.DateOfBirth != nil {
		parsed, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return nil, fmt.Errorf("invalid date_of_birth format, expected YYYY-MM-DD")
		}
		patient.DateOfBirth = &parsed
	}

	if err := s.patientRepo.Create(patient); err != nil {
		return nil, fmt.Errorf("error creating patient: %w", err)
	}

	return &dto.CreatePatientResponse{
		Message: "Patient profile created successfully",
		Patient: dto.PatientShortResponse{
			ID:       patient.ID,
			FullName: patient.FullName,
		},
	}, nil
}

// UpdatePatient modifies an existing patient's information
func (s *patientService) UpdatePatient(id uint, req dto.UpdatePatientRequest) error {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return fmt.Errorf("error fetching patient: %w", err)
	}
	if patient == nil {
		return ErrPatientNotFound
	}

	// Apply partial updates only for provided fields
	if req.FullName != nil {
		patient.FullName = *req.FullName
	}
	if req.DateOfBirth != nil {
		parsed, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return fmt.Errorf("invalid date_of_birth format, expected YYYY-MM-DD")
		}
		patient.DateOfBirth = &parsed
	}
	if req.Gender != nil {
		patient.Gender = req.Gender
	}
	if req.Phone != nil {
		patient.Phone = req.Phone
	}
	if req.Address != nil {
		patient.Address = req.Address
	}
	if req.MedicalHistory != nil {
		patient.MedicalHistory = req.MedicalHistory
	}

	if err := s.patientRepo.Update(patient); err != nil {
		return fmt.Errorf("error updating patient: %w", err)
	}
	return nil
}

// DeletePatient removes a patient record by ID
func (s *patientService) DeletePatient(id uint) error {
	err := s.patientRepo.Delete(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPatientNotFound
		}
		return fmt.Errorf("error deleting patient: %w", err)
	}
	return nil
}

// --- Helpers ---

func mapToPatientResponse(p models.Patient) dto.PatientResponse {
	return dto.PatientResponse{
		ID:          p.ID,
		FullName:    p.FullName,
		DateOfBirth: formatDate(p.DateOfBirth),
		Gender:      p.Gender,
		Phone:       p.Phone,
		CreatedAt:   p.CreatedAt,
	}
}

func formatDate(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.Format("2006-01-02")
	return &s
}
