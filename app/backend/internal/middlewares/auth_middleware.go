package middlewares

import (
	"net/http"
	"strings"

	"medvision-hub/pkg/utils"

	"github.com/gin-gonic/gin"
)

// RequireAuth middleware verifies the JWT token in the Authorization header
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer <token>"})
			return
		}

		tokenString := parts[1]
		token, err := utils.ValidateToken(tokenString)
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		claims, err := utils.ExtractClaims(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		if userID, ok := claims["user_id"]; ok {
			c.Set("user_id", userID)
		}
		if username, ok := claims["username"]; ok {
			c.Set("username", username)
		}
		if role, ok := claims["role_name"]; ok {
			c.Set("role", role)
		}

		c.Next()
	}
}
