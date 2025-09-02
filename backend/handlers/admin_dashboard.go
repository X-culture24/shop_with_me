package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/sakifarm-ecommerce/models"
	"gorm.io/gorm"
)

type AdminDashboardHandler struct {
	db *gorm.DB
}

type DashboardStats struct {
	TotalOrders      int64   `json:"totalOrders"`
	TotalRevenue     float64 `json:"totalRevenue"`
	TotalProducts    int64   `json:"totalProducts"`
	TotalUsers       int64   `json:"totalUsers"`
	PendingOrders    int64   `json:"pendingOrders"`
	LowStockProducts int64   `json:"lowStockProducts"`
}

type OrderSummary struct {
	ID            uint      `json:"id"`
	CustomerName  string    `json:"customerName"`
	CustomerEmail string    `json:"customerEmail"`
	Total         float64   `json:"total"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"createdAt"`
	Items         []OrderItemSummary `json:"items,omitempty"`
}

type OrderItemSummary struct {
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
	Image    string  `json:"image"`
}

type UserSummary struct {
	ID          uint      `json:"id"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	Email       string    `json:"email"`
	CreatedAt   time.Time `json:"createdAt"`
	TotalOrders int64     `json:"totalOrders"`
	TotalSpent  float64   `json:"totalSpent"`
}

func NewAdminDashboardHandler(db *gorm.DB) *AdminDashboardHandler {
	return &AdminDashboardHandler{db: db}
}

func (h *AdminDashboardHandler) GetStats(c *gin.Context) {
	var stats DashboardStats

	// Count total orders
	h.db.Model(&models.Order{}).Count(&stats.TotalOrders)

	// Calculate total revenue
	h.db.Model(&models.Order{}).
		Where("status = ?", "delivered").
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&stats.TotalRevenue)

	// Count total products
	h.db.Model(&models.Product{}).Count(&stats.TotalProducts)

	// Count total users (excluding admins)
	h.db.Model(&models.User{}).
		Where("role != ?", "admin").
		Count(&stats.TotalUsers)

	// Count pending orders
	h.db.Model(&models.Order{}).
		Where("status IN ?", []string{"pending", "processing"}).
		Count(&stats.PendingOrders)

	// Count low stock products (less than 10)
	h.db.Model(&models.Product{}).
		Where("stock < ?", 10).
		Count(&stats.LowStockProducts)

	c.JSON(http.StatusOK, stats)
}

func (h *AdminDashboardHandler) GetOrders(c *gin.Context) {
	var orders []models.Order
	var orderSummaries []OrderSummary

	// Fetch orders with user information
	if err := h.db.Preload("User").Preload("Items.Product").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Convert to summary format
	for _, order := range orders {
		customerName := "Unknown"
		customerEmail := "unknown@example.com"
		
		if order.User.ID != 0 {
			customerName = order.User.FirstName + " " + order.User.LastName
			customerEmail = order.User.Email
		}

		orderSummary := OrderSummary{
			ID:            order.ID,
			CustomerName:  customerName,
			CustomerEmail: customerEmail,
			Total:         order.TotalAmount,
			Status:        order.Status,
			CreatedAt:     order.CreatedAt,
		}

		// Add items if requested
		for _, item := range order.Items {
			itemSummary := OrderItemSummary{
				Name:     item.Product.Name,
				Price:    item.Price,
				Quantity: item.Quantity,
				Image:    "", // Add image if available
			}
			if len(item.Product.Images) > 0 {
				itemSummary.Image = item.Product.Images[0].URL
			}
			orderSummary.Items = append(orderSummary.Items, itemSummary)
		}

		orderSummaries = append(orderSummaries, orderSummary)
	}

	c.JSON(http.StatusOK, orderSummaries)
}

func (h *AdminDashboardHandler) GetUsers(c *gin.Context) {
	var users []models.User
	var userSummaries []UserSummary

	// Fetch users (excluding admins)
	if err := h.db.Where("role != ?", "admin").
		Order("created_at DESC").
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Convert to summary format with order statistics
	for _, user := range users {
		var totalOrders int64
		var totalSpent float64

		// Count user's orders
		h.db.Model(&models.Order{}).
			Where("user_id = ?", user.ID).
			Count(&totalOrders)

		// Calculate total spent
		h.db.Model(&models.Order{}).
			Where("user_id = ? AND status = ?", user.ID, "delivered").
			Select("COALESCE(SUM(total_amount), 0)").
			Scan(&totalSpent)

		userSummary := UserSummary{
			ID:          user.ID,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Email:       user.Email,
			CreatedAt:   user.CreatedAt,
			TotalOrders: totalOrders,
			TotalSpent:  totalSpent,
		}

		userSummaries = append(userSummaries, userSummary)
	}

	c.JSON(http.StatusOK, userSummaries)
}

func (h *AdminDashboardHandler) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	
	var request struct {
		Status string `json:"status" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate status
	validStatuses := []string{"pending", "processing", "shipped", "delivered", "cancelled"}
	isValid := false
	for _, status := range validStatuses {
		if request.Status == status {
			isValid = true
			break
		}
	}
	
	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// Update order status
	if err := h.db.Model(&models.Order{}).
		Where("id = ?", orderID).
		Update("status", request.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully"})
}
