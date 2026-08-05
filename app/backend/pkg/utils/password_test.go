package utils

import (
	"testing"
)

func TestHashPasswordAndCheckPassword(t *testing.T) {
	password := "SecretPassword123"

	hashed, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hashed == password {
		t.Errorf("Hashed password should not equal plain password")
	}

	if !CheckPassword(hashed, password) {
		t.Errorf("CheckPassword failed for correct password")
	}

	if CheckPassword(hashed, "WrongPassword") {
		t.Errorf("CheckPassword returned true for wrong password")
	}
}
