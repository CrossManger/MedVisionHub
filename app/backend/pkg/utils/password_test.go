package utils

import (
	"testing"
)

func TestPasswordHashing(t *testing.T) {
	password := "Secret123!"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Expected no error hashing password, got: %v", err)
	}

	if hash == password {
		t.Errorf("Expected hashed password to differ from original password")
	}

	if !CheckPassword(password, hash) {
		t.Errorf("Expected password check to succeed for valid password")
	}

	if CheckPassword("WrongPassword", hash) {
		t.Errorf("Expected password check to fail for incorrect password")
	}
}
