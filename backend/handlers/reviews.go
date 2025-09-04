package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/yourname/sakifarm-ecommerce/models"
	"gorm.io/gorm"
)

type ReviewHandler struct {
	db        *gorm.DB
	validator *validator.Validate
}

func NewReviewHandler(db *gorm.DB) *ReviewHandler {
	return &ReviewHandler{
		db:        db,
		validator: validator.New(),
	}
}

type CreateReviewRequest struct {
	Rating  int    `json:"rating" validate:"required,min=1,max=5"`
	Comment string `json:"comment" validate:"required,min=10"`
}

type CreateReplyRequest struct {
	Comment string `json:"comment" validate:"required,min=5"`
}

type ReviewResponse struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"`
	User       models.User `json:"user"`
	ProductID  uint   `json:"product_id"`
	Rating     int    `json:"rating"`
	Comment    string `json:"comment"`
	IsVerified bool   `json:"is_verified"`
	LikesCount int    `json:"likes_count"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

// GetProductReviews gets all reviews for a specific product
func (h *ReviewHandler) GetProductReviews(c *gin.Context) {
	productIDStr := c.Param("id")
	productID, err := strconv.ParseUint(productIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var reviews []models.Review
	if err := h.db.Preload("User").Preload("Replies.User").
		Where("product_id = ? AND parent_id IS NULL", productID).
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	// Convert to response format
	var reviewResponses []ReviewResponse
	for _, review := range reviews {
		reviewResponses = append(reviewResponses, ReviewResponse{
			ID:         review.ID,
			UserID:     review.UserID,
			User:       review.User,
			ProductID:  review.ProductID,
			Rating:     review.Rating,
			Comment:    review.Comment,
			IsVerified: review.IsVerified,
			LikesCount: review.LikesCount,
			CreatedAt:  review.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:  review.UpdatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	// Calculate average rating
	var avgRating float64
	if len(reviews) > 0 {
		var totalRating int
		for _, review := range reviews {
			totalRating += review.Rating
		}
		avgRating = float64(totalRating) / float64(len(reviews))
	}

	c.JSON(http.StatusOK, gin.H{
		"reviews":       reviewResponses,
		"total_reviews": len(reviews),
		"average_rating": avgRating,
	})
}

// CreateReview creates a new review for a product
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	productIDStr := c.Param("id")
	productID, err := strconv.ParseUint(productIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req CreateReviewRequest
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
	if err := h.db.First(&product, productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Check if user already reviewed this product
	var existingReview models.Review
	if err := h.db.Where("user_id = ? AND product_id = ?", userID, productID).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already reviewed this product"})
		return
	}

	// Create new review
	review := models.Review{
		UserID:    userID.(uint),
		ProductID: uint(productID),
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := h.db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	// Update product rating and review count
	h.updateProductRating(uint(productID))

	// Load user data for response
	h.db.Preload("User").First(&review, review.ID)

	c.JSON(http.StatusCreated, ReviewResponse{
		ID:         review.ID,
		UserID:     review.UserID,
		User:       review.User,
		ProductID:  review.ProductID,
		Rating:     review.Rating,
		Comment:    review.Comment,
		IsVerified: review.IsVerified,
		LikesCount: review.LikesCount,
		CreatedAt:  review.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:  review.UpdatedAt.Format("2006-01-02 15:04:05"),
	})
}

// LikeReview handles liking/unliking a review
func (h *ReviewHandler) LikeReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
		return
	}

	// Check if review exists
	var review models.Review
	if err := h.db.First(&review, reviewID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	// Check if user already liked this review
	var existingLike models.ReviewLike
	if err := h.db.Where("user_id = ? AND review_id = ?", userID, reviewID).First(&existingLike).Error; err == nil {
		// Unlike - remove the like
		h.db.Delete(&existingLike)
		h.db.Model(&review).Update("likes_count", gorm.Expr("likes_count - 1"))
		c.JSON(http.StatusOK, gin.H{"message": "Review unliked"})
		return
	}

	// Create new like
	like := models.ReviewLike{
		UserID:   userID.(uint),
		ReviewID: uint(reviewID),
		IsLike:   true,
	}

	if err := h.db.Create(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like review"})
		return
	}

	// Update review likes count
	h.db.Model(&review).Update("likes_count", gorm.Expr("likes_count + 1"))

	c.JSON(http.StatusOK, gin.H{"message": "Review liked"})
}

// ReplyToReview creates a reply to a review
func (h *ReviewHandler) ReplyToReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
		return
	}

	var req CreateReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if review exists
	var review models.Review
	if err := h.db.First(&review, reviewID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	// Create reply as a new review with parent_id
	reply := models.Review{
		UserID:     userID.(uint),
		ProductID:  review.ProductID,
		Rating:     0, // Replies don't have ratings
		Comment:    req.Comment,
		ParentID:   &review.ID, // Set parent review ID
		IsVerified: false,
	}

	if err := h.db.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
		return
	}

	// Load user data for response
	h.db.Preload("User").First(&reply, reply.ID)

	c.JSON(http.StatusCreated, ReviewResponse{
		ID:         reply.ID,
		UserID:     reply.UserID,
		User:       reply.User,
		ProductID:  reply.ProductID,
		Rating:     reply.Rating,
		Comment:    reply.Comment,
		IsVerified: reply.IsVerified,
		LikesCount: reply.LikesCount,
		CreatedAt:  reply.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:  reply.UpdatedAt.Format("2006-01-02 15:04:05"),
	})
}

// UpdateReview updates an existing review
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
		return
	}

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find review and check ownership
	var review models.Review
	if err := h.db.Where("id = ? AND user_id = ?", reviewID, userID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found or not owned by user"})
		return
	}

	// Update review
	review.Rating = req.Rating
	review.Comment = req.Comment

	if err := h.db.Save(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	// Update product rating
	h.updateProductRating(review.ProductID)

	c.JSON(http.StatusOK, gin.H{"message": "Review updated successfully"})
}

// DeleteReview deletes a review
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
		return
	}

	// Find review and check ownership
	var review models.Review
	if err := h.db.Where("id = ? AND user_id = ?", reviewID, userID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found or not owned by user"})
		return
	}

	productID := review.ProductID

	// Delete associated likes first
	h.db.Where("review_id = ?", reviewID).Delete(&models.ReviewLike{})

	// Delete review
	if err := h.db.Delete(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	// Update product rating
	h.updateProductRating(productID)

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}

// updateProductRating recalculates and updates product rating and review count
func (h *ReviewHandler) updateProductRating(productID uint) {
	var reviews []models.Review
	h.db.Where("product_id = ?", productID).Find(&reviews)

	var avgRating float64
	reviewCount := len(reviews)

	if reviewCount > 0 {
		var totalRating int
		for _, review := range reviews {
			totalRating += review.Rating
		}
		avgRating = float64(totalRating) / float64(reviewCount)
	}

	h.db.Model(&models.Product{}).Where("id = ?", productID).Updates(map[string]interface{}{
		"rating":       avgRating,
		"review_count": reviewCount,
	})
}
