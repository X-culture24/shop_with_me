package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/yourname/sakifarm-ecommerce/models"
	"gorm.io/gorm"
)

type ProductHandler struct {
	db        *gorm.DB
	validator *validator.Validate
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{
		db:        db,
		validator: validator.New(),
	}
}

type CreateProductRequest struct {
	Name        string  `json:"name" validate:"required,min=2"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"required,min=0"`
	Category    string  `json:"category" validate:"required"`
	Brand       string  `json:"brand"`
	SKU         string  `json:"sku"`
	Stock       int     `json:"stock" validate:"min=0"`
	Weight      float64 `json:"weight"`
	Dimensions  string  `json:"dimensions"`
	Tags        string  `json:"tags"`
	Images      []ProductImageRequest `json:"images"`
}

type ProductImageRequest struct {
	URL       string `json:"url" validate:"required"`
	AltText   string `json:"alt_text"`
	IsPrimary bool   `json:"is_primary"`
}

type UpdateProductRequest struct {
	Name        *string  `json:"name,omitempty"`
	Description *string  `json:"description,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	Category    *string  `json:"category,omitempty"`
	Brand       *string  `json:"brand,omitempty"`
	SKU         *string  `json:"sku,omitempty"`
	Stock       *int     `json:"stock,omitempty"`
	Weight      *float64 `json:"weight,omitempty"`
	Dimensions  *string  `json:"dimensions,omitempty"`
	Tags        *string  `json:"tags,omitempty"`
	Status      *string  `json:"status,omitempty"`
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := &models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Category:    req.Category,
		Brand:       req.Brand,
		SKU:         req.SKU,
		Stock:       req.Stock,
		Weight:      req.Weight,
		Dimensions:  req.Dimensions,
		Tags:        req.Tags,
		Status:      "active",
	}

	if err := h.db.Create(product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	// Add images
	for _, imgReq := range req.Images {
		image := models.ProductImage{
			ProductID: product.ID,
			URL:       imgReq.URL,
			AltText:   imgReq.AltText,
			IsPrimary: imgReq.IsPrimary,
		}
		h.db.Create(&image)
	}

	// Load images for response
	h.db.Preload("Images").First(product, product.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Product created successfully",
		"product": product,
	})
}

// GetProduct gets a single product by ID
func (h *ProductHandler) GetProduct(c *gin.Context) {
	productIDStr := c.Param("id")
	productID, err := strconv.ParseUint(productIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := h.db.Preload("Images").First(&product, productID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	category := c.Query("category")
	search := c.Query("search")
	status := c.DefaultQuery("status", "active")

	offset := (page - 1) * limit

	query := h.db.Model(&models.Product{}).Preload("Images")

	if category != "" {
		query = query.Where("category = ?", category)
	}

	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ? OR brand ILIKE ? OR tags ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products":    products,
		"totalPages":  (total + int64(limit) - 1) / int64(limit),
		"currentPage": page,
		"total":       total,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}


func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := h.db.First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.Category != nil {
		product.Category = *req.Category
	}
	if req.Brand != nil {
		product.Brand = *req.Brand
	}
	if req.SKU != nil {
		product.SKU = *req.SKU
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.Weight != nil {
		product.Weight = *req.Weight
	}
	if req.Dimensions != nil {
		product.Dimensions = *req.Dimensions
	}
	if req.Tags != nil {
		product.Tags = *req.Tags
	}
	if req.Status != nil {
		product.Status = *req.Status
	}

	if err := h.db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	// Load images for response
	h.db.Preload("Images").First(&product, product.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Product updated successfully",
		"product": product,
	})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	if err := h.db.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

func (h *ProductHandler) AddProductImage(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req ProductImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if product exists
	var product models.Product
	if err := h.db.First(&product, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	image := &models.ProductImage{
		ProductID: uint(id),
		URL:       req.URL,
		AltText:   req.AltText,
		IsPrimary: req.IsPrimary,
	}

	if err := h.db.Create(image).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add image"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Image added successfully",
		"image":   image,
	})
}

func (h *ProductHandler) DeleteProductImage(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	imageID, err := strconv.ParseUint(c.Param("imageId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	if err := h.db.Where("id = ? AND product_id = ?", imageID, productID).Delete(&models.ProductImage{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}

func (h *ProductHandler) GetCategories(c *gin.Context) {
	var categories []models.Category
	
	if err := h.db.Where("is_active = ?", true).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}
