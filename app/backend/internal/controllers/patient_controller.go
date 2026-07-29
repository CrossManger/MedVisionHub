package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/services"

	"github.com/gin-gonic/gin"
)

type PatientController struct {
	patientService services.PatientService
}

func NewPatientController(patientService services.PatientService) *PatientController {
	return &PatientController{patientService: patientService}
}

// GetAll handles GET /api/v1/patients
// Query params: page (default 1), limit (default 10), search (optional)
func (pc *PatientController) GetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	result, err := pc.patientService.GetAllPatients(page, limit, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve patients"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetByID handles GET /api/v1/patients/:id
func (pc *PatientController) GetByID(c *gin.Context) {
	id, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	result, err := pc.patientService.GetPatientByID(id)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve patient"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Create handles POST /api/v1/patients
func (pc *PatientController) Create(c *gin.Context) {
	var req dto.CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Extract authenticated user ID from JWT claims (set by RequireAuth middleware)
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// JWT stores numbers as float64 when decoded from JSON
	userIDFloat, ok := userIDRaw.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user context"})
		return
	}
	createdByUserID := uint(userIDFloat)

	result, err := pc.patientService.CreatePatient(req, createdByUserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// Update handles PUT /api/v1/patients/:id
func (pc *PatientController) Update(c *gin.Context) {
	id, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	var req dto.UpdatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := pc.patientService.UpdatePatient(id, req); err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Patient updated successfully"})
}

// Delete handles DELETE /api/v1/patients/:id
func (pc *PatientController) Delete(c *gin.Context) {
	id, err := parseUintParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	if err := pc.patientService.DeletePatient(id); err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Patient deleted successfully"})
}

// parseUintParam extracts and validates a uint URL path parameter
func parseUintParam(c *gin.Context, param string) (uint, error) {
	raw := c.Param(param)
	val, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(val), nil
}
