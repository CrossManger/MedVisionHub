package utils

import (
	"errors"
	"time"

	"medvision-hub/pkg/config"

	"github.com/golang-jwt/jwt/v5"
)

// Claims represents the JWT custom claims
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	RoleName string `json:"role_name"`
	jwt.RegisteredClaims
}

// getSecretKey retrieves secret key from environment configuration
func getSecretKey() []byte {
	secret := config.GetEnv("JWT_SECRET", "medvision_secret_key_change_in_production")
	return []byte(secret)
}

// GenerateToken creates a signed JWT token for a given user expiring in 24 hours
func GenerateToken(userID uint, username, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RoleName: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecretKey())
}

// ValidateToken parses and validates the given JWT token string
func ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getSecretKey(), nil
	})
}

// ExtractClaims extracts claims map from a valid JWT token
func ExtractClaims(token *jwt.Token) (jwt.MapClaims, error) {
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token claims")
}
