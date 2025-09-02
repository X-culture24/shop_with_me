package main

import (
	"log"

	"github.com/yourname/sakifarm-ecommerce/config"
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

	// Auto-migrate if needed
	db.AutoMigrate(&models.User{})

	// Delete existing admin user if exists
	db.Unscoped().Where("email = ? OR username = ?", "admin@sakifarm.com", "admin").Delete(&models.User{})

	// Create auth service
	authService := services.NewAuthService(db, nil, nil)

	// Create admin user
	admin := &models.User{
		Username:   "sakifarm_admin",
		Email:      "admin@sakifarm.com",
		Password:   "admin123", // This will be hashed by the service
		Phone:      "+254700000001",
		FirstName:  "System",
		LastName:   "Administrator",
		Role:       "admin",
		IsVerified: true,
	}

	if err := authService.Register(admin); err != nil {
		log.Printf("Failed to create admin user: %v", err)
	} else {
		log.Println("✅ Admin user created successfully!")
		log.Println("Email: admin@sakifarm.com")
		log.Println("Password: admin123")
	}

	// Verify user was created
	var user models.User
	if err := db.Where("email = ?", "admin@sakifarm.com").First(&user).Error; err != nil {
		log.Printf("❌ Failed to verify admin user: %v", err)
	} else {
		log.Printf("✅ Admin user verified - ID: %d, Email: %s, Role: %s", user.ID, user.Email, user.Role)
	}
}
