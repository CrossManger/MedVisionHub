package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/models"
	"medvision-hub/internal/repos"
)

var (
	ErrPatientNotFound = errors.New("không tìm thấy hồ sơ bệnh nhân")
)

type PatientService interface {
	GetAllPatients(page, limit int, search string) (*dto.PatientListResponse, error)
	GetPatientByID(id uint) (*dto.PatientResponse, error)
	CreatePatient(req dto.CreatePatientRequest, createdByUserID uint) (*dto.PatientResponse, error)
	UpdatePatient(id uint, req dto.UpdatePatientRequest) (*dto.PatientResponse, error)
	DeletePatient(id uint) error
}

type patientService struct {
	patientRepo repos.PatientRepository
}

func NewPatientService(patientRepo repos.PatientRepository) PatientService {
	return &patientService{patientRepo: patientRepo}
}

func (s *patientService) GetAllPatients(page, limit int, search string) (*dto.PatientListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	patients, total, err := s.patientRepo.FindAll(page, limit, search)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy danh sách bệnh nhân: %w", err)
	}

	patientResponses := make([]dto.PatientResponse, 0, len(patients))
	for _, p := range patients {
		patientResponses = append(patientResponses, mapPatientToResponse(&p))
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &dto.PatientListResponse{
		Data: patientResponses,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *patientService) GetPatientByID(id uint) (*dto.PatientResponse, error) {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("lỗi lấy chi tiết bệnh nhân: %w", err)
	}
	if patient == nil {
		return nil, ErrPatientNotFound
	}

	res := mapPatientToResponse(patient)
	return &res, nil
}

func (s *patientService) CreatePatient(req dto.CreatePatientRequest, createdByUserID uint) (*dto.PatientResponse, error) {
	var dob *time.Time
	if req.DateOfBirth != nil && *req.DateOfBirth != "" {
		parsedDOB, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return nil, fmt.Errorf("định dạng ngày sinh không hợp lệ (YYYY-MM-DD): %w", err)
		}
		dob = &parsedDOB
	}

	patient := &models.Patient{
		UserID:         req.UserID,
		FullName:       req.FullName,
		DateOfBirth:    dob,
		Gender:         req.Gender,
		Phone:          req.Phone,
		Address:        req.Address,
		MedicalHistory: req.MedicalHistory,
		CreatedBy:      &createdByUserID,
	}

	if err := s.patientRepo.Create(patient); err != nil {
		return nil, fmt.Errorf("lỗi tạo hồ sơ bệnh nhân: %w", err)
	}

	res := mapPatientToResponse(patient)
	return &res, nil
}

func (s *patientService) UpdatePatient(id uint, req dto.UpdatePatientRequest) (*dto.PatientResponse, error) {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("lỗi kiểm tra bệnh nhân: %w", err)
	}
	if patient == nil {
		return nil, ErrPatientNotFound
	}

	if req.DateOfBirth != nil && *req.DateOfBirth != "" {
		parsedDOB, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return nil, fmt.Errorf("định dạng ngày sinh không hợp lệ (YYYY-MM-DD): %w", err)
		}
		patient.DateOfBirth = &parsedDOB
	} else if req.DateOfBirth != nil && *req.DateOfBirth == "" {
		patient.DateOfBirth = nil
	}

	patient.UserID = req.UserID
	patient.FullName = req.FullName
	patient.Gender = req.Gender
	patient.Phone = req.Phone
	patient.Address = req.Address
	patient.MedicalHistory = req.MedicalHistory

	if err := s.patientRepo.Update(patient); err != nil {
		return nil, fmt.Errorf("lỗi cập nhật bệnh nhân: %w", err)
	}

	res := mapPatientToResponse(patient)
	return &res, nil
}

func (s *patientService) DeletePatient(id uint) error {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return fmt.Errorf("lỗi kiểm tra bệnh nhân: %w", err)
	}
	if patient == nil {
		return ErrPatientNotFound
	}

	if err := s.patientRepo.Delete(id); err != nil {
		return fmt.Errorf("lỗi xóa bệnh nhân: %w", err)
	}
	return nil
}

func mapPatientToResponse(p *models.Patient) dto.PatientResponse {
	var dobStr *string
	if p.DateOfBirth != nil {
		s := p.DateOfBirth.Format("2006-01-02")
		dobStr = &s
	}

	return dto.PatientResponse{
		ID:             p.ID,
		UserID:         p.UserID,
		FullName:       p.FullName,
		DateOfBirth:    dobStr,
		Gender:         p.Gender,
		Phone:          p.Phone,
		Address:        p.Address,
		MedicalHistory: p.MedicalHistory,
		CreatedBy:      p.CreatedBy,
		CreatedAt:      p.CreatedAt,
		UpdatedAt:      p.UpdatedAt,
	}
}
