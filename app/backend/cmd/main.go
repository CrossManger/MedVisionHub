package main

import (
	"log"
	"net/http"
	"os"

	"medvision-hub/internal/controllers"
	"medvision-hub/internal/middlewares"
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

	// Initialize repositories, services, controllers
	userRepo := repos.NewUserRepository()
	authService := services.NewAuthService(userRepo)
	authController := controllers.NewAuthController(authService)

	patientRepo := repos.NewPatientRepository()
	patientService := services.NewPatientService(patientRepo)
	patientController := controllers.NewPatientController(patientService)

	scanRepo := repos.NewScanSessionRepository()
	scanService := services.NewScanService(scanRepo, patientRepo)
	scanController := controllers.NewScanController(scanService)

	imageRepo := repos.NewImageRepository()
	imageService := services.NewImageService(imageRepo, scanRepo)
	imageController := controllers.NewImageController(imageService)

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

	// Base health check route
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "MedVision Hub API is running",
		})
	})

	// API v1 routes
	apiV1 := r.Group("/api/v1")
	{
		authRoutes := apiV1.Group("/auth")
		{
			authRoutes.POST("/login", authController.Login)
			authRoutes.POST("/register", authController.Register)
		}

		// Protected Patient Routes
		patientRoutes := apiV1.Group("/patients", middlewares.RequireAuth())
		{
			patientRoutes.GET("", patientController.GetAll)
			patientRoutes.POST("", patientController.Create)
			patientRoutes.GET("/:id", patientController.GetByID)
			patientRoutes.PUT("/:id", patientController.Update)
			patientRoutes.DELETE("/:id", patientController.Delete)

			// Patient Scan Routes
			patientRoutes.POST("/:id/scans", scanController.Create)
			patientRoutes.GET("/:id/scans", scanController.GetByPatientID)
		}

		// Protected Scan Routes
		scanRoutes := apiV1.Group("/scans", middlewares.RequireAuth())
		{
			scanRoutes.GET("/:id", scanController.GetByID)
			scanRoutes.POST("/:id/images", imageController.Upload)
			scanRoutes.GET("/:id/images", imageController.GetByScan)
		}

		// Protected Image Routes
		imageRoutes := apiV1.Group("/images", middlewares.RequireAuth())
		{
			imageRoutes.DELETE("/:id", imageController.Delete)
		}

		// Protected endpoint to test AuthMiddleware
		apiV1.GET("/me", middlewares.RequireAuth(), func(c *gin.Context) {
			userID, _ := c.Get("user_id")
			username, _ := c.Get("username")
			role, _ := c.Get("role")

			c.JSON(http.StatusOK, gin.H{
				"message":  "You are authenticated",
				"user_id":  userID,
				"username": username,
				"role":     role,
			})
		})
	}

	// Start server
	port := config.GetEnv("APP_PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
