package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentHandler struct {
	db     *gorm.DB
	config *Config
}

type Config struct {
	MPesaConsumerKey    string
	MPesaConsumerSecret string
	MPesaPasskey        string
	MPesaShortcode      string
	AirtelClientID      string
	AirtelClientSecret  string
	Environment         string
}

type Payment struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id"`
	OrderID       uint      `json:"order_id"`
	TransactionID string    `json:"transaction_id" gorm:"uniqueIndex"`
	Provider      string    `json:"provider"` // mpesa, airtel, card, bank
	PhoneNumber   string    `json:"phone_number"`
	Amount        float64   `json:"amount"`
	Status        string    `json:"status"` // pending, completed, failed, cancelled
	Reference     string    `json:"reference"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type MobilePaymentRequest struct {
	Provider    string  `json:"provider" binding:"required"`
	PhoneNumber string  `json:"phone_number" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	OrderID     uint    `json:"order_id"`
}

type MPesaTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   string `json:"expires_in"`
}

type MPesaSTKPushRequest struct {
	BusinessShortCode string `json:"BusinessShortCode"`
	Password          string `json:"Password"`
	Timestamp         string `json:"Timestamp"`
	TransactionType   string `json:"TransactionType"`
	Amount            string `json:"Amount"`
	PartyA            string `json:"PartyA"`
	PartyB            string `json:"PartyB"`
	PhoneNumber       string `json:"PhoneNumber"`
	CallBackURL       string `json:"CallBackURL"`
	AccountReference  string `json:"AccountReference"`
	TransactionDesc   string `json:"TransactionDesc"`
}

type MPesaSTKPushResponse struct {
	MerchantRequestID   string `json:"MerchantRequestID"`
	CheckoutRequestID   string `json:"CheckoutRequestID"`
	ResponseCode        string `json:"ResponseCode"`
	ResponseDescription string `json:"ResponseDescription"`
	CustomerMessage     string `json:"CustomerMessage"`
}

func NewPaymentHandler(db *gorm.DB, config *Config) *PaymentHandler {
	return &PaymentHandler{
		db:     db,
		config: config,
	}
}

func (h *PaymentHandler) InitiateMobilePayment(c *gin.Context) {
	var req MobilePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Generate unique transaction ID
	transactionID := generateTransactionID()

	// Create payment record
	payment := Payment{
		UserID:        userID.(uint),
		OrderID:       req.OrderID,
		TransactionID: transactionID,
		Provider:      req.Provider,
		PhoneNumber:   req.PhoneNumber,
		Amount:        req.Amount,
		Status:        "pending",
		Reference:     fmt.Sprintf("SAKI-%s", transactionID),
	}

	if err := h.db.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment record"})
		return
	}

	switch req.Provider {
	case "mpesa":
		err := h.initiateMPesaPayment(&payment)
		if err != nil {
			payment.Status = "failed"
			h.db.Save(&payment)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "airtel":
		err := h.initiateAirtelPayment(&payment)
		if err != nil {
			payment.Status = "failed"
			h.db.Save(&payment)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported payment provider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"transaction_id": transactionID,
		"status":         "initiated",
		"message":        "Payment request sent. Please check your phone.",
	})
}

func (h *PaymentHandler) GetPaymentStatus(c *gin.Context) {
	transactionID := c.Param("transaction_id")

	var payment Payment
	if err := h.db.Where("transaction_id = ?", transactionID).First(&payment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"transaction_id": payment.TransactionID,
		"status":         payment.Status,
		"amount":         payment.Amount,
		"provider":       payment.Provider,
		"reference":      payment.Reference,
		"created_at":     payment.CreatedAt,
		"updated_at":     payment.UpdatedAt,
	})
}

func (h *PaymentHandler) MPesaCallback(c *gin.Context) {
	var callbackData map[string]interface{}
	if err := c.ShouldBindJSON(&callbackData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid callback data"})
		return
	}

	// Process M-Pesa callback
	// This is a simplified version - in production, you'd need to handle the full callback structure
	if body, exists := callbackData["Body"]; exists {
		if stkCallback, ok := body.(map[string]interface{})["stkCallback"]; ok {
			callback := stkCallback.(map[string]interface{})
			
			checkoutRequestID := callback["CheckoutRequestID"].(string)
			resultCode := callback["ResultCode"].(float64)
			
			var payment Payment
			if err := h.db.Where("reference LIKE ?", "%"+checkoutRequestID+"%").First(&payment).Error; err == nil {
				if resultCode == 0 {
					payment.Status = "completed"
				} else {
					payment.Status = "failed"
				}
				h.db.Save(&payment)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func (h *PaymentHandler) AirtelCallback(c *gin.Context) {
	var callbackData map[string]interface{}
	if err := c.ShouldBindJSON(&callbackData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid callback data"})
		return
	}

	// Process Airtel callback
	// Implementation depends on Airtel's callback structure
	
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func (h *PaymentHandler) initiateMPesaPayment(payment *Payment) error {
	// Get M-Pesa access token
	token, err := h.getMPesaAccessToken()
	if err != nil {
		return fmt.Errorf("failed to get M-Pesa access token: %v", err)
	}

	// Generate timestamp and password
	timestamp := time.Now().Format("20060102150405")
	password := base64.StdEncoding.EncodeToString([]byte(h.config.MPesaShortcode + h.config.MPesaPasskey + timestamp))

	// Prepare STK Push request
	stkRequest := MPesaSTKPushRequest{
		BusinessShortCode: h.config.MPesaShortcode,
		Password:          password,
		Timestamp:         timestamp,
		TransactionType:   "CustomerPayBillOnline",
		Amount:            strconv.FormatFloat(payment.Amount, 'f', 0, 64),
		PartyA:            payment.PhoneNumber,
		PartyB:            h.config.MPesaShortcode,
		PhoneNumber:       payment.PhoneNumber,
		CallBackURL:       "https://your-domain.com/api/payments/mpesa/callback",
		AccountReference:  payment.Reference,
		TransactionDesc:   "SakiFarm Payment",
	}

	// Send STK Push request
	jsonData, _ := json.Marshal(stkRequest)
	
	var baseURL string
	if h.config.Environment == "production" {
		baseURL = "https://api.safaricom.co.ke"
	} else {
		baseURL = "https://sandbox.safaricom.co.ke"
	}

	req, err := http.NewRequest("POST", baseURL+"/mpesa/stkpush/v1/processrequest", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var stkResponse MPesaSTKPushResponse
	if err := json.Unmarshal(body, &stkResponse); err != nil {
		return err
	}

	if stkResponse.ResponseCode != "0" {
		return fmt.Errorf("M-Pesa STK Push failed: %s", stkResponse.ResponseDescription)
	}

	// Update payment with checkout request ID
	payment.Reference = stkResponse.CheckoutRequestID
	h.db.Save(payment)

	return nil
}

func (h *PaymentHandler) initiateAirtelPayment(payment *Payment) error {
	// Implement Airtel Money payment initiation
	// This is a placeholder - actual implementation depends on Airtel's API
	
	// For now, simulate successful initiation
	payment.Status = "pending"
	h.db.Save(payment)
	
	return nil
}

func (h *PaymentHandler) getMPesaAccessToken() (string, error) {
	credentials := base64.StdEncoding.EncodeToString([]byte(h.config.MPesaConsumerKey + ":" + h.config.MPesaConsumerSecret))
	
	var baseURL string
	if h.config.Environment == "production" {
		baseURL = "https://api.safaricom.co.ke"
	} else {
		baseURL = "https://sandbox.safaricom.co.ke"
	}

	req, err := http.NewRequest("GET", baseURL+"/oauth/v1/generate?grant_type=client_credentials", nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Basic "+credentials)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var tokenResponse MPesaTokenResponse
	if err := json.Unmarshal(body, &tokenResponse); err != nil {
		return "", err
	}

	return tokenResponse.AccessToken, nil
}

func generateTransactionID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return fmt.Sprintf("%x", bytes)[:16]
}
