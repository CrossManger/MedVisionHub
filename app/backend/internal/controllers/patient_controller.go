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

func (c *PatientController) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")

	res, err := c.patientService.GetAllPatients(page, limit, search)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

func (c *PatientController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	res, err := c.patientService.GetPatientByID(uint(id))
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

func (c *PatientController) Create(ctx *gin.Context) {
	var req dto.CreatePatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

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

func (c *PatientController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	var req dto.UpdatePatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	res, err := c.patientService.UpdatePatient(uint(id), req)
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

func (c *PatientController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID bệnh nhân không hợp lệ"})
		return
	}

	err = c.patientService.DeletePatient(uint(id))
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
