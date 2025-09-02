package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/yourname/sakifarm-ecommerce/models"
)

type AdminProductHandler struct {
	db *gorm.DB
}

func NewAdminProductHandler(db *gorm.DB) *AdminProductHandler {
	return &AdminProductHandler{db: db}
}

type ProductRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Price       float64  `json:"price" binding:"required,min=0"`
	Category    string   `json:"category" binding:"required"`
	Stock       int      `json:"stock" binding:"min=0"`
	Images      []string `json:"images"`
	Tags        []string `json:"tags"`
	SKU         string   `json:"sku" binding:"required"`
	Weight      float64  `json:"weight"`
	Dimensions  string   `json:"dimensions"`
	Brand       string   `json:"brand"`
	Status      string   `json:"status" binding:"required,oneof=active inactive draft"`
	IsImported  bool     `json:"is_imported"`
	ShippingFee float64  `json:"shipping_fee" binding:"min=0"`
}

// GetProducts retrieves all products for admin
func (h *AdminProductHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	
	// Get query parameters for filtering
	category := c.Query("category")
	status := c.Query("status")
	search := c.Query("search")
	
	query := h.db
	
	if category != "" {
		query = query.Where("category = ?", category)
	}
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Preload("Images").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	
	c.JSON(http.StatusOK, products)
}

// CreateProduct creates a new product
func (h *AdminProductHandler) CreateProduct(c *gin.Context) {
	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Check if SKU already exists
	var existingProduct models.Product
	if err := h.db.Where("sku = ?", req.SKU).First(&existingProduct).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Product with this SKU already exists"})
		return
	}
	
	// Convert string slice to comma-separated string for tags
	var tagsStr string
	if len(req.Tags) > 0 {
		tagsStr = strings.Join(req.Tags, ",")
	}
	
	product := models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Category:    req.Category,
		Stock:       req.Stock,
		Tags:        tagsStr,
		SKU:         req.SKU,
		Weight:      req.Weight,
		Dimensions:  req.Dimensions,
		Brand:       req.Brand,
		Status:      req.Status,
		IsImported:  req.IsImported,
		ShippingFee: req.ShippingFee,
	}
	
	if err := h.db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}
	
	// Create product images if provided
	for i, imageURL := range req.Images {
		if imageURL != "" {
			productImage := models.ProductImage{
				ProductID: product.ID,
				URL:       imageURL,
				AltText:   product.Name,
				IsPrimary: i == 0, // First image is primary
			}
			h.db.Create(&productImage)
		}
	}
	
	// Load images for response
	h.db.Preload("Images").First(&product, product.ID)
	
	c.JSON(http.StatusCreated, product)
}

// UpdateProduct updates an existing product
func (h *AdminProductHandler) UpdateProduct(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}
	
	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	var product models.Product
	if err := h.db.First(&product, productID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	
	// Check if SKU already exists for another product
	if req.SKU != product.SKU {
		var existingProduct models.Product
		if err := h.db.Where("sku = ? AND id != ?", req.SKU, productID).First(&existingProduct).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Product with this SKU already exists"})
			return
		}
	}
	
	// Convert string slice to comma-separated string for tags
	var tagsStr string
	if len(req.Tags) > 0 {
		tagsStr = strings.Join(req.Tags, ",")
	}
	
	// Update product fields
	product.Name = req.Name
	product.Description = req.Description
	product.Price = req.Price
	product.Category = req.Category
	product.Stock = req.Stock
	product.Tags = tagsStr
	product.SKU = req.SKU
	product.Weight = req.Weight
	product.Dimensions = req.Dimensions
	product.Brand = req.Brand
	product.Status = req.Status
	
	if err := h.db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}
	
	// Update product images if provided
	if len(req.Images) > 0 {
		// Delete existing images
		h.db.Where("product_id = ?", productID).Delete(&models.ProductImage{})
		
		// Create new images
		for i, imageURL := range req.Images {
			if imageURL != "" {
				productImage := models.ProductImage{
					ProductID: product.ID,
					URL:       imageURL,
					AltText:   product.Name,
					IsPrimary: i == 0, // First image is primary
				}
				h.db.Create(&productImage)
			}
		}
	}
	
	// Load images for response
	h.db.Preload("Images").First(&product, product.ID)
	
	c.JSON(http.StatusOK, product)
}

// DeleteProduct deletes a product
func (h *AdminProductHandler) DeleteProduct(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}
	
	var product models.Product
	if err := h.db.First(&product, productID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	
	// Check if product has any orders
	var orderCount int64
	h.db.Model(&models.OrderItem{}).Where("product_id = ?", productID).Count(&orderCount)
	
	if orderCount > 0 {
		// Don't delete, just mark as inactive
		product.Status = "inactive"
		if err := h.db.Save(&product).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deactivate product"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Product deactivated (has existing orders)"})
		return
	}
	
	if err := h.db.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// UploadProductImage handles product image upload
func (h *AdminProductHandler) UploadProductImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}
	
	// Validate file type
	contentType := file.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPEG, PNG, and WebP images are allowed"})
		return
	}
	
	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image size must be less than 5MB"})
		return
	}
	
	// Here you would typically upload to a cloud storage service like Cloudinary
	// For now, we'll return a placeholder URL
	imageURL := "https://via.placeholder.com/400x400?text=Product+Image"
	
	c.JSON(http.StatusOK, gin.H{
		"imageUrl": imageURL,
		"message":  "Image uploaded successfully",
	})
}

// GetProductStats returns product statistics for admin dashboard
func (h *AdminProductHandler) GetProductStats(c *gin.Context) {
	var stats struct {
		TotalProducts    int64 `json:"totalProducts"`
		ActiveProducts   int64 `json:"activeProducts"`
		LowStockProducts int64 `json:"lowStockProducts"`
		OutOfStock      int64 `json:"outOfStock"`
		Categories      []struct {
			Category string `json:"category"`
			Count    int64  `json:"count"`
		} `json:"categories"`
	}
	
	// Total products
	h.db.Model(&models.Product{}).Count(&stats.TotalProducts)
	
	// Active products
	h.db.Model(&models.Product{}).Where("status = ?", "active").Count(&stats.ActiveProducts)
	
	// Low stock products (less than 10)
	h.db.Model(&models.Product{}).Where("stock < ? AND stock > 0", 10).Count(&stats.LowStockProducts)
	
	// Out of stock
	h.db.Model(&models.Product{}).Where("stock = 0").Count(&stats.OutOfStock)
	
	// Categories
	h.db.Model(&models.Product{}).
		Select("category, COUNT(*) as count").
		Group("category").
		Scan(&stats.Categories)
	
	c.JSON(http.StatusOK, stats)
}

// ToggleFeatured toggles the featured status of a product
func (h *AdminProductHandler) ToggleFeatured(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}
	
	var req struct {
		Featured bool `json:"featured"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	var product models.Product
	if err := h.db.First(&product, productID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	
	product.Featured = req.Featured
	if err := h.db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update featured status"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Featured status updated successfully",
		"featured": product.Featured,
	})
}
