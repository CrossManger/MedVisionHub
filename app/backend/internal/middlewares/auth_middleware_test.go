package middlewares

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"medvision-hub/pkg/utils"

	"github.com/gin-gonic/gin"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/protected", RequireAuth(), func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		c.JSON(http.StatusOK, gin.H{
			"message": "Authorized",
			"user_id": userID,
		})
	})
	return r
}

func TestRequireAuth_MissingHeader(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized, got %d", w.Code)
	}
}

func TestRequireAuth_InvalidHeaderFormat(t *testing.T) {
	r := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "InvalidHeaderFormat")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized, got %d", w.Code)
	}
}

func TestRequireAuth_ValidToken(t *testing.T) {
	r := setupTestRouter()

	token, err := utils.GenerateToken(10, "testdoctor", "doctor")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200 OK, got %d", w.Code)
	}
}
