package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/yourname/sakifarm-ecommerce/models"
	"github.com/yourname/sakifarm-ecommerce/services"
	"gorm.io/gorm"
)

type OrderHandler struct {
	db             *gorm.DB
	paymentService *services.PaymentService
	emailService   *services.EmailService
	pdfService     *services.PDFService
	validator      *validator.Validate
}

func NewOrderHandler(db *gorm.DB, paymentService *services.PaymentService, emailService *services.EmailService, pdfService *services.PDFService) *OrderHandler {
	return &OrderHandler{
		db:             db,
		paymentService: paymentService,
		emailService:   emailService,
		pdfService:     pdfService,
		validator:      validator.New(),
	}
}

type CreateOrderRequest struct {
	Items           []OrderItemRequest `json:"items" validate:"required,dive"`
	ShippingAddress models.Address     `json:"shipping_address" validate:"required"`
	BillingAddress  models.Address     `json:"billing_address" validate:"required"`
	PaymentMethod   string            `json:"payment_method" validate:"required,oneof=mpesa airtel"`
	PhoneNumber     string            `json:"phone_number" validate:"required"`
	Notes           string            `json:"notes"`
}

type OrderItemRequest struct {
	ProductID uint `json:"product_id" validate:"required"`
	Quantity  int  `json:"quantity" validate:"required,min=1"`
}

type UpdateOrderStatusRequest struct {
	Status         string `json:"status" validate:"required,oneof=pending confirmed processing shipped delivered cancelled"`
	TrackingNumber string `json:"tracking_number,omitempty"`
	Notes          string `json:"notes,omitempty"`
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate order totals
	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range req.Items {
		var product models.Product
		if err := h.db.First(&product, item.ProductID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Product %d not found", item.ProductID)})
			return
		}

		if product.Stock < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Insufficient stock for product %s", product.Name)})
			return
		}

		itemTotal := product.Price * float64(item.Quantity)
		totalAmount += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
			Total:     itemTotal,
		})
	}

	// Add shipping and tax
	shippingAmount := 200.0 // Fixed shipping for now
	taxAmount := totalAmount * 0.16 // 16% VAT
	totalAmount += shippingAmount + taxAmount

	// Generate order number
	orderNumber := fmt.Sprintf("ORD-%s", uuid.New().String()[:8])

	// Create order
	order := &models.Order{
		UserID:          userID.(uint),
		OrderNumber:     orderNumber,
		Status:          "pending",
		PaymentStatus:   "pending",
		PaymentMethod:   req.PaymentMethod,
		TotalAmount:     totalAmount,
		ShippingAmount:  shippingAmount,
		TaxAmount:       taxAmount,
		Items:           orderItems,
		ShippingAddress: req.ShippingAddress,
		BillingAddress:  req.BillingAddress,
		Notes:           req.Notes,
	}

	if err := h.db.Create(order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Update product stock
	for _, item := range req.Items {
		h.db.Model(&models.Product{}).Where("id = ?", item.ProductID).
			Update("stock", gorm.Expr("stock - ?", item.Quantity))
	}

	// Initiate payment
	var payment *models.Payment
	var err error

	if req.PaymentMethod == "mpesa" {
		payment, err = h.paymentService.InitiateMPesaPayment(order.ID, req.PhoneNumber, totalAmount)
	} else if req.PaymentMethod == "airtel" {
		payment, err = h.paymentService.InitiateAirtelPayment(order.ID, req.PhoneNumber, totalAmount)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate payment"})
		return
	}

	// Load order with relationships
	h.db.Preload("Items.Product").Preload("User").First(order, order.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Order created successfully",
		"order":   order,
		"payment": payment,
	})
}

func (h *OrderHandler) GetOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole := c.GetString("user_role")

	var orders []models.Order
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")

	offset := (page - 1) * limit

	query := h.db.Model(&models.Order{}).
		Preload("Items.Product").
		Preload("User")

	// If not admin, only show user's orders
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	userID, _ := c.Get("user_id")
	userRole := c.GetString("user_role")

	var order models.Order
	query := h.db.Preload("Items.Product").Preload("User")

	// If not admin, only allow access to own orders
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": order})
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := h.db.Preload("User").First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}

	// Update order status
	order.Status = req.Status
	if req.TrackingNumber != "" {
		order.TrackingNumber = req.TrackingNumber
	}
	if req.Notes != "" {
		order.Notes = req.Notes
	}

	// Set delivery time if status is delivered
	if req.Status == "delivered" && order.DeliveredAt == nil {
		now := time.Now()
		order.DeliveredAt = &now

		// Send delivery notification email
		if h.emailService != nil {
			go h.emailService.SendDeliveryNotification(order.User.Email, order.OrderNumber, order.TrackingNumber)
		}
	}

	if err := h.db.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Order status updated successfully",
		"order":   order,
	})
}

func (h *OrderHandler) CancelOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	userID, _ := c.Get("user_id")
	userRole := c.GetString("user_role")

	var order models.Order
	query := h.db.Preload("Items")

	// If not admin, only allow cancellation of own orders
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}

	// Check if order can be cancelled
	if order.Status == "delivered" || order.Status == "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order cannot be cancelled"})
		return
	}

	// Update order status
	order.Status = "cancelled"
	if err := h.db.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel order"})
		return
	}

	// Restore product stock
	for _, item := range order.Items {
		h.db.Model(&models.Product{}).Where("id = ?", item.ProductID).
			Update("stock", gorm.Expr("stock + ?", item.Quantity))
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Order cancelled successfully",
		"order":   order,
	})
}

func (h *OrderHandler) GenerateReceipt(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	userID, _ := c.Get("user_id")
	userRole := c.GetString("user_role")

	var order models.Order
	query := h.db.Preload("Items.Product").Preload("User")

	// If not admin, only allow access to own orders
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}

	// Only generate receipt for delivered orders
	if order.Status != "delivered" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Receipt can only be generated for delivered orders"})
		return
	}

	// Generate PDF receipt
	pdfData, err := h.pdfService.GenerateReceipt(&order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate receipt"})
		return
	}

	// Set headers for PDF download
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=receipt-%s.pdf", order.OrderNumber))
	c.Header("Content-Length", strconv.Itoa(len(pdfData)))

	c.Data(http.StatusOK, "application/pdf", pdfData)
}

func (h *OrderHandler) TrackOrder(c *gin.Context) {
	trackingNumber := c.Param("trackingNumber")

	var order models.Order
	if err := h.db.Preload("Items.Product").Preload("User").
		Where("tracking_number = ?", trackingNumber).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}

	// Create tracking timeline
	timeline := []gin.H{
		{
			"status":      "pending",
			"title":       "Order Placed",
			"description": "Your order has been placed successfully",
			"timestamp":   order.CreatedAt,
			"completed":   true,
		},
		{
			"status":      "confirmed",
			"title":       "Order Confirmed",
			"description": "Your order has been confirmed and is being prepared",
			"completed":   order.Status != "pending",
		},
		{
			"status":      "processing",
			"title":       "Processing",
			"description": "Your order is being processed and packed",
			"completed":   order.Status == "processing" || order.Status == "shipped" || order.Status == "delivered",
		},
		{
			"status":      "shipped",
			"title":       "Shipped",
			"description": "Your order has been shipped and is on its way",
			"completed":   order.Status == "shipped" || order.Status == "delivered",
		},
		{
			"status":      "delivered",
			"title":       "Delivered",
			"description": "Your order has been delivered successfully",
			"timestamp":   order.DeliveredAt,
			"completed":   order.Status == "delivered",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"order":    order,
		"timeline": timeline,
	})
}
