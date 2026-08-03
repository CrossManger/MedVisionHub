package main

import (
	"log"
	"net/http"
	"os"

	"medvision-hub/internal/controllers"
	"medvision-hub/internal/middlewares"
	"medvision-hub/internal/repos"
	"medvision-hub/internal/services"
	"medvision-hub/internal/websocket"
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

	// Initialize WebSocket Hub
	wsHub := websocket.NewHub()
	go wsHub.Run()

	// Initialize repositories, services, controllers
	userRepo := repos.NewUserRepository()
	authService := services.NewAuthService(userRepo)
	authController := controllers.NewAuthController(authService)

	patientRepo := repos.NewPatientRepository()
	patientService := services.NewPatientService(patientRepo)
	patientController := controllers.NewPatientController(patientService)

	notifRepo := repos.NewNotificationRepository()
	notifService := services.NewNotificationService(notifRepo, wsHub)
	notificationController := controllers.NewNotificationController(notifService)

	scanRepo := repos.NewScanSessionRepository()
	scanService := services.NewScanServiceWithNotifier(scanRepo, patientRepo, notifService)
	scanController := controllers.NewScanController(scanService)

	imageRepo := repos.NewImageRepository()
	imageService := services.NewImageService(imageRepo, scanRepo)
	imageController := controllers.NewImageController(imageService)

	roleRepo := repos.NewRoleRepository()
	permRepo := repos.NewPermissionRepository()
	rolePermRepo := repos.NewRolePermissionRepository()
	permService := services.NewPermissionService(roleRepo, permRepo, rolePermRepo)
	permissionController := controllers.NewPermissionController(permService)

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

	// WebSocket route for Real-time Notifications
	r.GET("/ws/notifications", func(c *gin.Context) {
		websocket.ServeWS(wsHub, c)
	})

	// API v1 routes
	apiV1 := r.Group("/api/v1")
	{
		authRoutes := apiV1.Group("/auth")
		{
			authRoutes.POST("/login", authController.Login)
			authRoutes.POST("/register", authController.Register)
			authRoutes.POST("/forgot-password", authController.ForgotPassword)
			authRoutes.POST("/reset-password", authController.ResetPassword)
		}

		// Dashboard stats route
		apiV1.GET("/dashboard/stats", middlewares.RequireAuth(), patientController.GetDashboardStats)

		// Patient Portal Routes (Patient gets their own scans & profile)
		apiV1.GET("/my-scans", middlewares.RequireAuth(), middlewares.RequirePermission("can_view_image"), scanController.GetMyScans)
		apiV1.GET("/my-patient", middlewares.RequireAuth(), middlewares.RequirePermission("can_view_image"), patientController.GetMyPatient)
		apiV1.PUT("/my-patient", middlewares.RequireAuth(), middlewares.RequirePermission("can_view_image"), patientController.UpdateMyPatient)

		// Notifications REST routes
		notificationRoutes := apiV1.Group("/notifications", middlewares.RequireAuth())
		{
			notificationRoutes.GET("", notificationController.GetNotifications)
			notificationRoutes.PUT("/:id/read", notificationController.MarkAsRead)
		}

		// Protected Patient Routes with RBAC Middleware
		patientRoutes := apiV1.Group("/patients", middlewares.RequireAuth())
		{
			patientRoutes.GET("", middlewares.RequirePermission("can_view_patient"), patientController.GetAll)
			patientRoutes.POST("", middlewares.RequirePermission("can_create_patient"), patientController.Create)
			patientRoutes.GET("/:id", middlewares.RequirePermission("can_view_patient"), patientController.GetByID)
			patientRoutes.PUT("/:id", middlewares.RequirePermission("can_edit_patient"), patientController.Update)
			patientRoutes.DELETE("/:id", middlewares.RequirePermission("can_delete_patient"), patientController.Delete)

			// Patient Scan Routes
			patientRoutes.POST("/:id/scans", middlewares.RequirePermission("can_create_scan"), scanController.Create)
			patientRoutes.GET("/:id/scans", middlewares.RequirePermission("can_view_patient"), scanController.GetByPatientID)
		}

		// Protected Scan Routes with RBAC Middleware
		scanRoutes := apiV1.Group("/scans", middlewares.RequireAuth())
		{
			scanRoutes.GET("/:id", middlewares.RequirePermission("can_view_image"), scanController.GetByID)
			scanRoutes.PUT("/:id/complete", middlewares.RequirePermission("can_create_scan"), scanController.CompleteScan)
			scanRoutes.POST("/:id/images", middlewares.RequirePermission("can_upload_image"), imageController.Upload)
			scanRoutes.GET("/:id/images", middlewares.RequirePermission("can_view_image"), imageController.GetByScan)
		}

		// Protected Image Routes with RBAC Middleware
		imageRoutes := apiV1.Group("/images", middlewares.RequireAuth())
		{
			imageRoutes.DELETE("/:id", middlewares.RequirePermission("can_upload_image"), imageController.Delete)
		}

		// Protected Admin Routes with RBAC Middleware
		adminRoutes := apiV1.Group("/admin", middlewares.RequireAuth(), middlewares.RequirePermission("can_manage_permissions"))
		{
			adminRoutes.GET("/roles", permissionController.GetRoles)
			adminRoutes.GET("/permissions", permissionController.GetPermissions)
			adminRoutes.PUT("/roles/:role_id/permissions", permissionController.UpdateRolePermissions)
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
