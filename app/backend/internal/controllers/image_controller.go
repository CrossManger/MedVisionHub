package controllers

import (
	"errors"
	"net/http"

	"medvision-hub/internal/services"

	"github.com/gin-gonic/gin"
)

type ImageController struct {
	imageService services.ImageService
}

func NewImageController(imageService services.ImageService) *ImageController {
	return &ImageController{imageService: imageService}
}

// Upload handles POST /api/v1/scans/:scan_id/images
func (c *ImageController) Upload(ctx *gin.Context) {
	scanID, err := parseUintParam(ctx, "scan_id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ca chụp không hợp lệ"})
		return
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng chọn file hình ảnh hợp lệ (field name: 'file')"})
		return
	}

	userIDVal, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa xác thực tài khoản"})
		return
	}

	var uploadedBy uint
	switch v := userIDVal.(type) {
	case uint:
		uploadedBy = v
	case float64:
		uploadedBy = uint(v)
	default:
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Thông tin tài khoản không hợp lệ"})
		return
	}

	res, err := c.imageService.UploadImage(scanID, file, uploadedBy)
	if err != nil {
		if errors.Is(err, services.ErrInvalidFileType) || errors.Is(err, services.ErrFileTooLarge) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Upload hình ảnh thành công",
		"image":   res,
	})
}

// GetByScan handles GET /api/v1/scans/:scan_id/images
func (c *ImageController) GetByScan(ctx *gin.Context) {
	scanID, err := parseUintParam(ctx, "scan_id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ca chụp không hợp lệ"})
		return
	}

	res, err := c.imageService.GetImagesByScan(scanID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách hình ảnh: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, res)
}

// Delete handles DELETE /api/v1/images/:id
func (c *ImageController) Delete(ctx *gin.Context) {
	id, err := parseUintParam(ctx, "id")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID hình ảnh không hợp lệ"})
		return
	}

	err = c.imageService.DeleteImage(id)
	if err != nil {
		if errors.Is(err, services.ErrImageNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Xóa hình ảnh thành công"})
}
