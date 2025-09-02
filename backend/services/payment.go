package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/yourname/sakifarm-ecommerce/models"
	"gorm.io/gorm"
)

type PaymentService struct {
	db                  *gorm.DB
	mpesaConsumerKey    string
	mpesaConsumerSecret string
	mpesaPasskey        string
	mpesaShortcode      string
	airtelClientID      string
	airtelClientSecret  string
	environment         string
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

type AirtelPaymentRequest struct {
	Reference   string  `json:"reference"`
	Subscriber  Subscriber `json:"subscriber"`
	Transaction Transaction `json:"transaction"`
}

type Subscriber struct {
	Country string `json:"country"`
	Currency string `json:"currency"`
	MSISDN   string `json:"msisdn"`
}

type Transaction struct {
	Amount string `json:"amount"`
	Country string `json:"country"`
	Currency string `json:"currency"`
	ID      string `json:"id"`
}

func NewPaymentService(db *gorm.DB, mpesaKey, mpesaSecret, mpesaPasskey, mpesaShortcode, airtelID, airtelSecret, env string) *PaymentService {
	return &PaymentService{
		db:                  db,
		mpesaConsumerKey:    mpesaKey,
		mpesaConsumerSecret: mpesaSecret,
		mpesaPasskey:        mpesaPasskey,
		mpesaShortcode:      mpesaShortcode,
		airtelClientID:      airtelID,
		airtelClientSecret:  airtelSecret,
		environment:         env,
	}
}

func (s *PaymentService) InitiateMPesaPayment(orderID uint, phoneNumber string, amount float64) (*models.Payment, error) {
	// Create payment record
	payment := &models.Payment{
		OrderID:       orderID,
		PaymentMethod: "mpesa",
		Amount:        amount,
		Currency:      "KES",
		Status:        "pending",
		PhoneNumber:   phoneNumber,
	}

	if err := s.db.Create(payment).Error; err != nil {
		return nil, err
	}

	// Get M-Pesa access token
	token, err := s.getMPesaAccessToken()
	if err != nil {
		payment.Status = "failed"
		s.db.Save(payment)
		return nil, err
	}

	// Initiate STK Push
	stkResponse, err := s.initiateSTKPush(token, phoneNumber, amount, fmt.Sprintf("ORDER-%d", orderID))
	if err != nil {
		payment.Status = "failed"
		s.db.Save(payment)
		return nil, err
	}

	// Update payment with transaction details
	payment.TransactionID = stkResponse.CheckoutRequestID
	payment.ExternalRef = stkResponse.MerchantRequestID
	responseJSON, _ := json.Marshal(stkResponse)
	payment.ProviderResponse = string(responseJSON)

	s.db.Save(payment)
	return payment, nil
}

func (s *PaymentService) InitiateAirtelPayment(orderID uint, phoneNumber string, amount float64) (*models.Payment, error) {
	// Create payment record
	payment := &models.Payment{
		OrderID:       orderID,
		PaymentMethod: "airtel",
		Amount:        amount,
		Currency:      "KES",
		Status:        "pending",
		PhoneNumber:   phoneNumber,
	}

	if err := s.db.Create(payment).Error; err != nil {
		return nil, err
	}

	// Initiate Airtel Money payment
	transactionID := fmt.Sprintf("TXN-%d-%d", orderID, time.Now().Unix())
	
	_ = transactionID // Mark as used
	_ = AirtelPaymentRequest{ // Placeholder for future implementation
		Reference: fmt.Sprintf("ORDER-%d", orderID),
		Subscriber: Subscriber{
			Country:  "KE",
			Currency: "KES",
			MSISDN:   phoneNumber,
		},
		Transaction: Transaction{
			Amount:   fmt.Sprintf("%.2f", amount),
			Country:  "KE",
			Currency: "KES",
			ID:       transactionID,
		},
	}

	// Make API call to Airtel (simplified - actual implementation would need proper Airtel API integration)
	payment.TransactionID = transactionID
	payment.Status = "pending"
	s.db.Save(payment)

	return payment, nil
}

func (s *PaymentService) ProcessPaymentCallback(paymentMethod, transactionID string, success bool, externalRef string) error {
	var payment models.Payment
	
	if err := s.db.Where("transaction_id = ? AND payment_method = ?", transactionID, paymentMethod).First(&payment).Error; err != nil {
		return err
	}

	if success {
		payment.Status = "success"
		payment.ExternalRef = externalRef
		
		// Update order payment status
		s.db.Model(&models.Order{}).Where("id = ?", payment.OrderID).Update("payment_status", "paid")
	} else {
		payment.Status = "failed"
		
		// Restore inventory if payment failed
		var order models.Order
		if err := s.db.Preload("Items").First(&order, payment.OrderID).Error; err == nil {
			for _, item := range order.Items {
				s.db.Model(&models.Product{}).Where("id = ?", item.ProductID).
					Update("stock", gorm.Expr("stock + ?", item.Quantity))
			}
		}
	}

	return s.db.Save(&payment).Error
}

func (s *PaymentService) getMPesaAccessToken() (string, error) {
	url := "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
	if s.environment == "production" {
		url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.SetBasicAuth(s.mpesaConsumerKey, s.mpesaConsumerSecret)
	req.Header.Set("Content-Type", "application/json")

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

	var tokenResp MPesaTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", err
	}

	if tokenResp.AccessToken == "" {
		return "", errors.New("failed to get access token")
	}

	return tokenResp.AccessToken, nil
}

func (s *PaymentService) initiateSTKPush(token, phoneNumber string, amount float64, reference string) (*MPesaSTKPushResponse, error) {
	url := "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
	if s.environment == "production" {
		url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
	}

	timestamp := time.Now().Format("20060102150405")
	// For sandbox, use base64 encoding of shortcode + passkey + timestamp
	passwordStr := fmt.Sprintf("%s%s%s", s.mpesaShortcode, s.mpesaPasskey, timestamp)
	password := base64.StdEncoding.EncodeToString([]byte(passwordStr))

	request := MPesaSTKPushRequest{
		BusinessShortCode: s.mpesaShortcode,
		Password:          password,
		Timestamp:         timestamp,
		TransactionType:   "CustomerPayBillOnline",
		Amount:            fmt.Sprintf("%.0f", amount),
		PartyA:            phoneNumber,
		PartyB:            s.mpesaShortcode,
		PhoneNumber:       phoneNumber,
		CallBackURL:       "http://localhost:8080/api/payments/mpesa/callback",
		AccountReference:  reference,
		TransactionDesc:   "SakiFarm Order Payment",
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Log the response for debugging
	fmt.Printf("M-Pesa STK Push Response: %s\n", string(body))

	// Check if response is HTML (error page)
	if resp.Header.Get("Content-Type") == "text/html" || resp.StatusCode != 200 {
		return nil, fmt.Errorf("M-Pesa API error (status %d): %s", resp.StatusCode, string(body))
	}

	var stkResp MPesaSTKPushResponse
	if err := json.Unmarshal(body, &stkResp); err != nil {
		return nil, fmt.Errorf("failed to parse M-Pesa response: %v, body: %s", err, string(body))
	}

	return &stkResp, nil
}

func (s *PaymentService) GetPaymentStatus(paymentID uint) (*models.Payment, error) {
	var payment models.Payment
	if err := s.db.First(&payment, paymentID).Error; err != nil {
		return nil, err
	}
	return &payment, nil
}
