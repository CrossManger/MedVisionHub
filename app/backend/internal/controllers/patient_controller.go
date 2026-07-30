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
func (c *PatientController) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")

	res, err := c.patientService.GetAllPatients(page, limit, search)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách bệnh nhân: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// GetByID handles GET /api/v1/patients/:id
func (c *PatientController) GetByID(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	res, err := c.patientService.GetPatientByID(id)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": res})
}

// GetMyPatient handles GET /api/v1/my-patient
func (c *PatientController) GetMyPatient(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	res, err := c.patientService.GetMyPatient(userID)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hồ sơ cá nhân của bạn"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": res})
}

// UpdateMyPatient handles PUT /api/v1/my-patient
func (c *PatientController) UpdateMyPatient(ctx *gin.Context) {
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var req dto.UpdateMyPatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	res, err := c.patientService.UpdateMyPatient(userID, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Cập nhật thông tin cá nhân thành công",
		"data":    res,
	})
}

// Create handles POST /api/v1/patients
func (c *PatientController) Create(ctx *gin.Context) {
	var req dto.CreatePatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	// Extract authenticated user ID from JWT claims (set by RequireAuth middleware)
	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var createdBy uint
	switch v := userIDVal.(type) {
	case uint:
		createdBy = v
	case float64:
		createdBy = uint(v)
	default:
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Thông tin tài khoản không hợp lệ"})
		return
	}

	res, err := c.patientService.CreatePatient(req, createdBy)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Tạo hồ sơ bệnh nhân thành công",
		"data":    res,
	})
}

// Update handles PUT /api/v1/patients/:id
func (c *PatientController) Update(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	var req dto.UpdatePatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	res, err := c.patientService.UpdatePatient(id, req)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Cập nhật hồ sơ bệnh nhân thành công",
		"data":    res,
	})
}

// Delete handles DELETE /api/v1/patients/:id
func (c *PatientController) Delete(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	err = c.patientService.DeletePatient(id)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Xóa hồ sơ bệnh nhân thành công"})
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
