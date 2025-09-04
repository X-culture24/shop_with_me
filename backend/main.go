package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/sakifarm-ecommerce/config"
	"github.com/yourname/sakifarm-ecommerce/handlers"
	"github.com/yourname/sakifarm-ecommerce/middleware"
	"github.com/yourname/sakifarm-ecommerce/models"
	"github.com/yourname/sakifarm-ecommerce/services"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate database schema
	if err := db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.ProductImage{},
		&models.Order{},
		&models.OrderItem{},
		&models.Cart{},
		&models.CartItem{},
		&models.Wishlist{},
		&models.Review{},
		&models.ReviewLike{},
		&models.OTP{},
		&models.Payment{},
		&models.Notification{},
		&models.Category{},
		&models.Coupon{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize services
	smsService := services.NewSMSService(cfg.TwilioAccountSID, cfg.TwilioAuthToken, cfg.TwilioPhone)
	emailService := services.NewEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword)
	authService := services.NewAuthService(db, smsService, emailService)
	paymentService := services.NewPaymentService(db, cfg.MPesaConsumerKey, cfg.MPesaConsumerSecret, cfg.MPesaPasskey, cfg.MPesaShortcode, cfg.AirtelClientID, cfg.AirtelClientSecret, cfg.Environment)
	pdfService := services.NewPDFService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, cfg.JWTSecret)
	productHandler := handlers.NewProductHandler(db)
	orderHandler := handlers.NewOrderHandler(db, paymentService, emailService, pdfService)
	adminProductHandler := handlers.NewAdminProductHandler(db)
	adminDashboardHandler := handlers.NewAdminDashboardHandler(db)
	reviewHandler := handlers.NewReviewHandler(db)
	cartHandler := handlers.NewCartHandler(db)
	
	// Create payment handler config
	paymentConfig := &handlers.Config{
		MPesaConsumerKey:    cfg.MPesaConsumerKey,
		MPesaConsumerSecret: cfg.MPesaConsumerSecret,
		MPesaPasskey:        cfg.MPesaPasskey,
		MPesaShortcode:      cfg.MPesaShortcode,
		AirtelClientID:      cfg.AirtelClientID,
		AirtelClientSecret:  cfg.AirtelClientSecret,
		Environment:         cfg.Environment,
	}
	paymentHandler := handlers.NewPaymentHandler(db, paymentConfig)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Apply middleware
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.SecurityMiddleware())

	// Serve static files (uploaded images)
	r.Static("/uploads", "./uploads")

	// Health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"environment": cfg.Environment,
			"version":     "1.0.0",
		})
	})

	// Public routes
	api := r.Group("/api")
	{
		// Authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/send-otp", authHandler.SendOTP)
			auth.POST("/verify-otp", authHandler.VerifyOTP)
			auth.POST("/login-otp", authHandler.LoginWithOTP)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		// Products
		api.GET("/products", productHandler.GetProducts)
		api.GET("/products/:id", productHandler.GetProduct)
		api.GET("/products/:id/reviews", reviewHandler.GetProductReviews)
		api.GET("/categories", productHandler.GetCategories)

		// Payment callbacks (public for webhook access)
		payments := api.Group("/payments")
		{
			payments.POST("/mpesa/callback", paymentHandler.MPesaCallback)
			payments.POST("/airtel/callback", paymentHandler.AirtelCallback)
		}

		// Order tracking (public)
		api.GET("/track/:trackingNumber", orderHandler.TrackOrder)
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// User profile
		protected.GET("/profile", authHandler.GetProfile)

		// User orders
		orders := protected.Group("/orders")
		{
			orders.POST("", orderHandler.CreateOrder)
			orders.GET("", orderHandler.GetOrders)
			orders.GET("/:id", orderHandler.GetOrder)
			orders.PUT("/:id/cancel", orderHandler.CancelOrder)
			orders.GET("/:id/receipt", orderHandler.GenerateReceipt)
		}

		// Payment routes
		payments := protected.Group("/payments")
		{
			payments.POST("/mobile", paymentHandler.InitiateMobilePayment)
			payments.GET("/status/:transaction_id", paymentHandler.GetPaymentStatus)
		}

		// Review routes
		reviews := protected.Group("/products")
		{
			reviews.POST("/:id/reviews", reviewHandler.CreateReview)
			reviews.PUT("/reviews/:id", reviewHandler.UpdateReview)
			reviews.DELETE("/reviews/:id", reviewHandler.DeleteReview)
		}

		// Review interaction routes
		reviewActions := protected.Group("/reviews")
		{
			reviewActions.POST("/:id/like", reviewHandler.LikeReview)
			reviewActions.POST("/:id/reply", reviewHandler.ReplyToReview)
		}

		// Cart routes
		cart := protected.Group("/cart")
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("/add", cartHandler.AddToCart)
			cart.PUT("/items/:id", cartHandler.UpdateCartItem)
			cart.DELETE("/items/:id", cartHandler.RemoveFromCart)
			cart.DELETE("/clear", cartHandler.ClearCart)
		}
	}

	// Admin routes
	adminGroup := protected.Group("/admin")
	adminGroup.Use(middleware.AdminMiddleware())
	{
		// Dashboard routes
		adminGroup.GET("/stats", adminDashboardHandler.GetStats)
		adminGroup.GET("/orders", adminDashboardHandler.GetOrders)
		adminGroup.GET("/users", adminDashboardHandler.GetUsers)
		adminGroup.PUT("/orders/:id/status", adminDashboardHandler.UpdateOrderStatus)
		
		// Product management routes
		adminGroup.GET("/products", adminProductHandler.GetProducts)
		adminGroup.POST("/products", adminProductHandler.CreateProduct)
		adminGroup.PUT("/products/:id", adminProductHandler.UpdateProduct)
		adminGroup.DELETE("/products/:id", adminProductHandler.DeleteProduct)
		adminGroup.POST("/products/upload-image", adminProductHandler.UploadProductImage)
		adminGroup.GET("/products/stats", adminProductHandler.GetProductStats)
		adminGroup.PUT("/products/:id/featured", adminProductHandler.ToggleFeatured)
	}

	// Create default admin user if not exists
	createDefaultAdmin(db)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func createDefaultAdmin(db *gorm.DB) {
	var adminUser models.User
	if err := db.Where("role = ? AND email = ?", "admin", "admin@sakifarm.com").First(&adminUser).Error; err == gorm.ErrRecordNotFound {
		// Create default admin user
		authService := services.NewAuthService(db, nil, nil)
		admin := &models.User{
			Username:   "admin",
			Email:      "admin@sakifarm.com",
			Password:   "admin123", // This will be hashed by the service
			Phone:      "+254700000000",
			FirstName:  "System",
			LastName:   "Administrator",
			Role:       "admin",
			IsVerified: true,
		}

		if err := authService.Register(admin); err != nil {
			log.Printf("Warning: Failed to create default admin user: %v", err)
		} else {
			log.Println("Default admin user created: admin@sakifarm.com / admin123")
		}
	}
}
