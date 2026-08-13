package database

import (
	"fmt"
	"log"
	"time"

	"medvision-hub/internal/models"
	"medvision-hub/pkg/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect initializes a connection to the PostgreSQL database with retry mechanism
func Connect() error {
	host := config.GetEnv("DB_HOST", "localhost")
	user := config.GetEnv("DB_USER", "postgres")
	password := config.GetEnv("DB_PASSWORD", "postgres")
	dbname := config.GetEnv("DB_NAME", "medvision_hub")
	port := config.GetEnv("DB_PORT", "5432")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, dbname, port)

	maxRetries := 10
	retryInterval := 2 * time.Second

	var db *gorm.DB
	var err error

	for i := 1; i <= maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			DB = db
			log.Println("Connected to PostgreSQL successfully.")
			return nil
		}

		log.Printf("Failed to connect to database (attempt %d/%d): %v. Retrying in %v...\n",
			i, maxRetries, err, retryInterval)
		time.Sleep(retryInterval)
	}

	return fmt.Errorf("could not connect to database after %d attempts: %w", maxRetries, err)
}

// AutoMigrate migrates all database models
func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	log.Println("Running AutoMigrate...")
	err := DB.AutoMigrate(
		&models.Role{},
		&models.Permission{},
		&models.RolePermission{},
		&models.User{},
		&models.Patient{},
		&models.ScanSession{},
		&models.Image{},
		&models.Notification{},
	)
	if err != nil {
		return err
	}
	
	log.Println("AutoMigrate completed.")
	return nil
}
