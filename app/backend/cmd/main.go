package main

import (
	"log"
	"net/http"
	"os"

	"medvision-hub/internal/controllers"
	"medvision-hub/internal/repos"
	"medvision-hub/internal/services"
	"medvision-hub/pkg/config"
	"medvision-hub/pkg/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load environment config
	config.LoadConfig()

	// Connect to Database
	err := database.Connect()
	if err != nil {
		log.Printf("Failed to connect to database: %v\n", err)
		log.Println("Continuing without database connection...")
	} else {
		// Run AutoMigrate
		if err := database.AutoMigrate(); err != nil {
			log.Fatalf("AutoMigrate failed: %v", err)
		}
		// Seed default data
		if err := database.Seed(); err != nil {
			log.Fatalf("Database seeding failed: %v", err)
		}
	}

	// Create Gin router
	r := gin.Default()

	// CORS Middleware setup
	allowedOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{allowedOrigins},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Ensure uploads directory exists
	uploadDir := config.GetEnv("UPLOAD_DIR", "./uploads")
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		err := os.MkdirAll(uploadDir, os.ModePerm)
		if err != nil {
			log.Printf("Failed to create upload directory: %v", err)
		}
	}

	// Serve static files from uploads/ directory
	r.StaticFS("/uploads", http.Dir(uploadDir))

	// Initialize Repositories, Services, and Controllers
	userRepo := repos.NewUserRepository()
	authService := services.NewAuthService(userRepo)
	authController := controllers.NewAuthController(authService)

	// API v1 Group
	v1 := r.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authController.Register)
		}
	}

	// Base health check route
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "MedVision Hub API is running",
		})
	})

	// Start server
	port := config.GetEnv("APP_PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
