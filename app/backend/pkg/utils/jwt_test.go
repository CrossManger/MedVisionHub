package utils

import (
	"testing"
)

func TestGenerateAndValidateToken(t *testing.T) {
	userID := uint(10)
	username := "doctor_test"
	role := "doctor"

	tokenStr, err := GenerateToken(userID, username, role)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	if tokenStr == "" {
		t.Fatalf("Token string should not be empty")
	}

	token, err := ValidateToken(tokenStr)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if !token.Valid {
		t.Errorf("Token should be valid")
	}

	claims, err := ExtractClaims(token)
	if err != nil {
		t.Fatalf("ExtractClaims failed: %v", err)
	}

	if claims["username"] != username {
		t.Errorf("Expected username %s, got %v", username, claims["username"])
	}

	if claims["role_name"] != role {
		t.Errorf("Expected role %s, got %v", role, claims["role_name"])
	}
}
