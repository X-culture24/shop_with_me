package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL      string
	JWTSecret        string
	Port             string
	SMTPHost         string
	SMTPPort         int
	SMTPUser         string
	SMTPPassword     string
	TwilioAccountSID string
	TwilioAuthToken  string
	TwilioPhone      string
	CloudinaryURL    string
	MPesaConsumerKey string
	MPesaConsumerSecret string
	MPesaPasskey     string
	MPesaShortcode   string
	AirtelClientID   string
	AirtelClientSecret string
	Environment      string
}

func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))

	return &Config{
		DatabaseURL:         getEnv("DATABASE_URL", "host=postgres user=postgres password=postgres dbname=sakifarm port=5432 sslmode=disable"),
		JWTSecret:          getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
		Port:               getEnv("PORT", "8080"),
		SMTPHost:           getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:           smtpPort,
		SMTPUser:           getEnv("SMTP_USER", ""),
		SMTPPassword:       getEnv("SMTP_PASSWORD", ""),
		TwilioAccountSID:   getEnv("TWILIO_ACCOUNT_SID", ""),
		TwilioAuthToken:    getEnv("TWILIO_AUTH_TOKEN", ""),
		TwilioPhone:        getEnv("TWILIO_PHONE", ""),
		CloudinaryURL:      getEnv("CLOUDINARY_URL", ""),
		MPesaConsumerKey:   getEnv("MPESA_CONSUMER_KEY", ""),
		MPesaConsumerSecret: getEnv("MPESA_CONSUMER_SECRET", ""),
		MPesaPasskey:       getEnv("MPESA_PASSKEY", ""),
		MPesaShortcode:     getEnv("MPESA_SHORTCODE", ""),
		AirtelClientID:     getEnv("AIRTEL_CLIENT_ID", ""),
		AirtelClientSecret: getEnv("AIRTEL_CLIENT_SECRET", ""),
		Environment:        getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
