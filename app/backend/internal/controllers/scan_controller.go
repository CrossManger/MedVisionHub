package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"medvision-hub/internal/dto"
	"medvision-hub/internal/services"

	"github.com/gin-gonic/gin"
)

type ScanController struct {
	scanService services.ScanService
}

func NewScanController(scanService services.ScanService) *ScanController {
	return &ScanController{scanService: scanService}
}

// getPatientIDParam extracts patient ID from route params (:id or :patient_id)
func getPatientIDParam(ctx *gin.Context) (uint, error) {
	raw := ctx.Param("id")
	if raw == "" {
		raw = ctx.Param("patient_id")
	}
	val, err := strconv.ParseUint(raw, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(val), nil
}

// Create handles POST /api/v1/patients/:id/scans
func (c *ScanController) Create(ctx *gin.Context) {
	patientID, err := getPatientIDParam(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	var req dto.CreateScanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var doctorID uint
	switch v := userIDVal.(type) {
	case uint:
		doctorID = v
	case float64:
		doctorID = uint(v)
	}

	res, err := c.scanService.CreateScan(patientID, req, doctorID)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Tạo ca chụp thành công",
		"data":    res,
	})
}

// GetByPatientID handles GET /api/v1/patients/:id/scans
func (c *ScanController) GetByPatientID(ctx *gin.Context) {
	patientID, err := getPatientIDParam(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	res, err := c.scanService.GetScansByPatientID(patientID)
	if err != nil {
		if errors.Is(err, services.ErrPatientNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// GetMyScans handles GET /api/v1/my-scans
func (c *ScanController) GetMyScans(ctx *gin.Context) {
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

	res, err := c.scanService.GetMyScans(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// GetByID handles GET /api/v1/scans/:id
func (c *ScanController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ca chụp không hợp lệ"})
		return
	}

	userIDVal, _ := ctx.Get("user_id")
	roleVal, _ := ctx.Get("role")

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	roleName, _ := roleVal.(string)

	res, err := c.scanService.GetScanByID(uint(id), userID, roleName)
	if err != nil {
		if errors.Is(err, services.ErrScanNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrUnauthorizedPatientAccess) {
			ctx.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": res})
}
