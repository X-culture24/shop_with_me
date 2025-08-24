package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/yourname/sakifarm-ecommerce/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db          *gorm.DB
	smsService  *SMSService
	emailService *EmailService
}

func NewAuthService(db *gorm.DB, smsService *SMSService, emailService *EmailService) *AuthService {
	return &AuthService{
		db:          db,
		smsService:  smsService,
		emailService: emailService,
	}
}

func (s *AuthService) Register(user *models.User) error {
	// Check if user already exists
	var existingUser models.User
	if err := s.db.Where("email = ? OR username = ? OR phone = ?", user.Email, user.Username, user.Phone).First(&existingUser).Error; err == nil {
		return errors.New("user already exists with this email, username, or phone")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	// Create user
	if err := s.db.Create(user).Error; err != nil {
		return err
	}

	// Send verification email
	if s.emailService != nil {
		go s.emailService.SendWelcomeEmail(user.Email, user.FirstName)
	}

	return nil
}

func (s *AuthService) Login(identifier, password string) (*models.User, error) {
	var user models.User
	
	// Find user by email, username, or phone
	if err := s.db.Where("email = ? OR username = ? OR phone = ?", identifier, identifier, identifier).First(&user).Error; err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return &user, nil
}

func (s *AuthService) SendOTP(phone, purpose string) error {
	// Generate 6-digit OTP
	otp, err := s.generateOTP()
	if err != nil {
		return err
	}

	// Delete existing OTPs for this phone and purpose
	s.db.Where("phone = ? AND purpose = ?", phone, purpose).Delete(&models.OTP{})

	// Save OTP to database
	otpRecord := &models.OTP{
		Phone:     phone,
		Code:      otp,
		Purpose:   purpose,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}

	if err := s.db.Create(otpRecord).Error; err != nil {
		return err
	}

	// Send SMS
	message := fmt.Sprintf("Your verification code is: %s. Valid for 10 minutes.", otp)
	return s.smsService.SendSMS(phone, message)
}

func (s *AuthService) VerifyOTP(phone, code, purpose string) error {
	var otp models.OTP
	
	if err := s.db.Where("phone = ? AND code = ? AND purpose = ? AND used = false AND expires_at > ?", 
		phone, code, purpose, time.Now()).First(&otp).Error; err != nil {
		return errors.New("invalid or expired OTP")
	}

	// Mark OTP as used
	otp.Used = true
	s.db.Save(&otp)

	return nil
}

func (s *AuthService) LoginWithOTP(phone string) (*models.User, error) {
	var user models.User
	
	if err := s.db.Where("phone = ?", phone).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}

	return &user, nil
}

func (s *AuthService) ResetPassword(phone, newPassword string) error {
	var user models.User
	
	if err := s.db.Where("phone = ?", phone).First(&user).Error; err != nil {
		return errors.New("user not found")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return s.db.Save(&user).Error
}

func (s *AuthService) generateOTP() (string, error) {
	max := big.NewInt(999999)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func (s *AuthService) VerifyUser(userID uint) error {
	return s.db.Model(&models.User{}).Where("id = ?", userID).Update("is_verified", true).Error
}
