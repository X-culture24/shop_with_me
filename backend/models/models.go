package models

import (
	"time"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Username    string    `gorm:"unique;not null" json:"username" validate:"required,min=3,max=50"`
	Email       string    `gorm:"unique;not null" json:"email" validate:"required,email"`
	Password    string    `gorm:"not null" json:"-"`
	Phone       string    `gorm:"unique" json:"phone" validate:"required,min=10"`
	FirstName   string    `json:"first_name" validate:"required"`
	LastName    string    `json:"last_name" validate:"required"`
	Role        string    `gorm:"default:customer" json:"role"` // admin, customer
	IsVerified  bool      `gorm:"default:false" json:"is_verified"`
	Avatar      string    `json:"avatar"`
	Address     string    `json:"address"`
	City        string    `json:"city"`
	Country     string    `json:"country"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Product represents a product in the system
type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name" validate:"required,min=2"`
	Description string    `json:"description"`
	Price       float64   `gorm:"not null" json:"price" validate:"required,min=0"`
	Category    string    `json:"category" validate:"required"`
	Brand       string    `json:"brand"`
	SKU         string    `gorm:"unique" json:"sku"`
	Stock       int       `gorm:"default:0" json:"stock" validate:"min=0"`
	Images      []ProductImage `gorm:"foreignKey:ProductID" json:"images"`
	Status      string    `gorm:"default:active" json:"status"` // active, inactive, out_of_stock
	Weight      float64   `json:"weight"`
	Dimensions  string    `json:"dimensions"`
	Tags        string    `json:"tags"`
	Rating      float64   `gorm:"default:0" json:"rating"`
	ReviewCount int       `gorm:"default:0" json:"review_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ProductImage represents product images
type ProductImage struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProductID uint   `json:"product_id"`
	URL       string `json:"url"`
	AltText   string `json:"alt_text"`
	IsPrimary bool   `gorm:"default:false" json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}

// Order represents an order in the system
type Order struct {
	ID              uint        `gorm:"primaryKey" json:"id"`
	UserID          uint        `json:"user_id"`
	User            User        `gorm:"foreignKey:UserID" json:"user"`
	OrderNumber     string      `gorm:"unique;not null" json:"order_number"`
	Status          string      `gorm:"default:pending" json:"status"` // pending, confirmed, processing, shipped, delivered, cancelled
	PaymentStatus   string      `gorm:"default:pending" json:"payment_status"` // pending, paid, failed, refunded
	PaymentMethod   string      `json:"payment_method"` // mpesa, airtel, card
	PaymentRef      string      `json:"payment_ref"`
	TotalAmount     float64     `json:"total_amount"`
	ShippingAmount  float64     `json:"shipping_amount"`
	TaxAmount       float64     `json:"tax_amount"`
	DiscountAmount  float64     `json:"discount_amount"`
	Items           []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	ShippingAddress Address     `gorm:"embedded;embeddedPrefix:shipping_" json:"shipping_address"`
	BillingAddress  Address     `gorm:"embedded;embeddedPrefix:billing_" json:"billing_address"`
	TrackingNumber  string      `json:"tracking_number"`
	DeliveredAt     *time.Time  `json:"delivered_at"`
	Notes           string      `json:"notes"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// OrderItem represents items in an order
type OrderItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int     `json:"quantity" validate:"required,min=1"`
	Price     float64 `json:"price"`
	Total     float64 `json:"total"`
}

// Address represents shipping/billing addresses
type Address struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Company   string `json:"company"`
	Address1  string `json:"address1" validate:"required"`
	Address2  string `json:"address2"`
	City      string `json:"city" validate:"required"`
	State     string `json:"state"`
	Country   string `json:"country" validate:"required"`
	PostalCode string `json:"postal_code"`
	Phone     string `json:"phone" validate:"required"`
}

// Cart represents shopping cart
type Cart struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	UserID    uint       `json:"user_id"`
	Items     []CartItem `gorm:"foreignKey:CartID" json:"items"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// CartItem represents items in cart
type CartItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	CartID    uint    `json:"cart_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int     `json:"quantity" validate:"required,min=1"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Wishlist represents user wishlist
type Wishlist struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	UserID    uint    `json:"user_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`
	CreatedAt time.Time `json:"created_at"`
}

// Review represents product reviews
type Review struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	UserID    uint    `json:"user_id"`
	User      User    `gorm:"foreignKey:UserID" json:"user"`
	ProductID uint    `json:"product_id"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`
	Rating    int     `json:"rating" validate:"required,min=1,max=5"`
	Comment   string  `json:"comment"`
	IsVerified bool   `gorm:"default:false" json:"is_verified"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// OTP represents one-time passwords for authentication
type OTP struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Phone     string    `json:"phone"`
	Code      string    `json:"code"`
	Purpose   string    `json:"purpose"` // login, registration, password_reset
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

// Payment represents payment transactions
type Payment struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	OrderID         uint      `json:"order_id"`
	PaymentMethod   string    `json:"payment_method"` // mpesa, airtel
	Amount          float64   `json:"amount"`
	Currency        string    `gorm:"default:KES" json:"currency"`
	Status          string    `json:"status"` // pending, success, failed
	TransactionID   string    `json:"transaction_id"`
	ExternalRef     string    `json:"external_ref"`
	PhoneNumber     string    `json:"phone_number"`
	ProviderResponse string   `json:"provider_response"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Notification represents system notifications
type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"` // order, payment, delivery, promotion
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	Data      string    `json:"data"` // JSON data for additional info
	CreatedAt time.Time `json:"created_at"`
}

// Category represents product categories
type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"unique;not null" json:"name"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	ParentID    *uint     `json:"parent_id"`
	Parent      *Category `gorm:"foreignKey:ParentID" json:"parent"`
	Children    []Category `gorm:"foreignKey:ParentID" json:"children"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Coupon represents discount coupons
type Coupon struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Code        string    `gorm:"unique;not null" json:"code"`
	Type        string    `json:"type"` // percentage, fixed
	Value       float64   `json:"value"`
	MinAmount   float64   `json:"min_amount"`
	MaxDiscount float64   `json:"max_discount"`
	UsageLimit  int       `json:"usage_limit"`
	UsedCount   int       `gorm:"default:0" json:"used_count"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	ExpiresAt   time.Time `json:"expires_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
