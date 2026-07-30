package utils

import (
	"testing"
)

func TestJWTGenerationAndValidation(t *testing.T) {
	userID := uint(42)
	username := "doctor_house"
	role := "doctor"

	tokenString, err := GenerateToken(userID, username, role)
	if err != nil {
		t.Fatalf("Expected token generation to succeed, got: %v", err)
	}

	if tokenString == "" {
		t.Fatalf("Expected non-empty token string")
	}

	token, err := ValidateToken(tokenString)
	if err != nil {
		t.Fatalf("Expected token validation to succeed, got: %v", err)
	}

	claims, err := ExtractClaims(token)
	if err != nil {
		t.Fatalf("Expected extracting claims to succeed, got: %v", err)
	}

	if uint(claims["user_id"].(float64)) != userID {
		t.Errorf("Expected user_id %d, got %v", userID, claims["user_id"])
	}

	if claims["username"] != username {
		t.Errorf("Expected username %s, got %v", username, claims["username"])
	}

	if claims["role_name"] != role {
		t.Errorf("Expected role_name %s, got %v", role, claims["role_name"])
	}
}

func TestInvalidJWTValidation(t *testing.T) {
	invalidToken := "invalid.jwt.token"

	_, err := ValidateToken(invalidToken)
	if err == nil {
		t.Errorf("Expected error validating invalid token string")
	}
}
