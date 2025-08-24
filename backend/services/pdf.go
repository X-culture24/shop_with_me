package services

import (
	"bytes"
	"fmt"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/yourname/sakifarm-ecommerce/models"
)

type PDFService struct{}

func NewPDFService() *PDFService {
	return &PDFService{}
}

func (s *PDFService) GenerateReceipt(order *models.Order) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Set colors for branding
	pdf.SetFillColor(255, 20, 147) // Hot pink
	pdf.SetTextColor(0, 0, 139)   // Navy blue

	// Header with company name
	pdf.SetFont("Arial", "B", 20)
	pdf.CellFormat(0, 15, "SakiFarm Ecommerce", "0", 1, "C", true, 0, "")
	pdf.Ln(5)

	// Receipt title
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "DELIVERY RECEIPT")
	pdf.Ln(15)

	// Order information
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Order Number:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.OrderNumber)
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Order Date:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.CreatedAt.Format("January 2, 2006"))
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Delivery Date:")
	pdf.SetFont("Arial", "B", 12)
	if order.DeliveredAt != nil {
		pdf.Cell(0, 8, order.DeliveredAt.Format("January 2, 2006"))
	} else {
		pdf.Cell(0, 8, "Not delivered yet")
	}
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Tracking Number:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.TrackingNumber)
	pdf.Ln(15)

	// Customer information
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 0, 139) // Navy blue
	pdf.Cell(0, 10, "Customer Information")
	pdf.Ln(10)

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Name:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, fmt.Sprintf("%s %s", order.User.FirstName, order.User.LastName))
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Email:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.User.Email)
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Phone:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.User.Phone)
	pdf.Ln(15)

	// Shipping address
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 0, 139) // Navy blue
	pdf.Cell(0, 10, "Shipping Address")
	pdf.Ln(10)

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "", 12)
	address := fmt.Sprintf("%s %s\n%s\n%s, %s %s\n%s",
		order.ShippingAddress.FirstName, order.ShippingAddress.LastName,
		order.ShippingAddress.Address1,
		order.ShippingAddress.City, order.ShippingAddress.State, order.ShippingAddress.PostalCode,
		order.ShippingAddress.Country)
	
	pdf.MultiCell(0, 6, address, "0", "L", false)
	pdf.Ln(10)

	// Order items table
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 0, 139) // Navy blue
	pdf.Cell(0, 10, "Order Items")
	pdf.Ln(10)

	// Table header
	pdf.SetFillColor(240, 240, 240)
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(80, 8, "Product", "1", 0, "L", true, 0, "")
	pdf.CellFormat(20, 8, "Qty", "1", 0, "C", true, 0, "")
	pdf.CellFormat(30, 8, "Price", "1", 0, "R", true, 0, "")
	pdf.CellFormat(30, 8, "Total", "1", 1, "R", true, 0, "")

	// Table rows
	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(0, 0, 0)
	for _, item := range order.Items {
		pdf.CellFormat(80, 8, item.Product.Name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(20, 8, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(30, 8, fmt.Sprintf("KES %.2f", item.Price), "1", 0, "R", false, 0, "")
		pdf.CellFormat(30, 8, fmt.Sprintf("KES %.2f", item.Total), "1", 1, "R", false, 0, "")
	}

	// Order summary
	pdf.Ln(5)
	pdf.SetFont("Arial", "B", 12)
	
	pdf.Cell(130, 8, "")
	pdf.Cell(30, 8, "Subtotal:")
	pdf.Cell(30, 8, fmt.Sprintf("KES %.2f", order.TotalAmount-order.ShippingAmount-order.TaxAmount))
	pdf.Ln(6)

	if order.ShippingAmount > 0 {
		pdf.Cell(130, 8, "")
		pdf.Cell(30, 8, "Shipping:")
		pdf.Cell(30, 8, fmt.Sprintf("KES %.2f", order.ShippingAmount))
		pdf.Ln(6)
	}

	if order.TaxAmount > 0 {
		pdf.Cell(130, 8, "")
		pdf.Cell(30, 8, "Tax:")
		pdf.Cell(30, 8, fmt.Sprintf("KES %.2f", order.TaxAmount))
		pdf.Ln(6)
	}

	if order.DiscountAmount > 0 {
		pdf.Cell(130, 8, "")
		pdf.Cell(30, 8, "Discount:")
		pdf.Cell(30, 8, fmt.Sprintf("-KES %.2f", order.DiscountAmount))
		pdf.Ln(6)
	}

	// Total with background
	pdf.SetFillColor(255, 20, 147) // Hot pink
	pdf.SetTextColor(255, 255, 255) // White text
	pdf.Cell(130, 10, "")
	pdf.CellFormat(30, 10, "TOTAL:", "1", 0, "L", true, 0, "")
	pdf.CellFormat(30, 10, fmt.Sprintf("KES %.2f", order.TotalAmount), "1", 1, "R", true, 0, "")

	// Payment information
	pdf.Ln(10)
	pdf.SetTextColor(0, 0, 139) // Navy blue
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(0, 10, "Payment Information")
	pdf.Ln(10)

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Payment Method:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.PaymentMethod)
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Payment Status:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, order.PaymentStatus)
	pdf.Ln(8)

	if order.PaymentRef != "" {
		pdf.SetFont("Arial", "", 12)
		pdf.Cell(50, 8, "Payment Reference:")
		pdf.SetFont("Arial", "B", 12)
		pdf.Cell(0, 8, order.PaymentRef)
		pdf.Ln(8)
	}

	// Footer
	pdf.Ln(20)
	pdf.SetFont("Arial", "I", 10)
	pdf.SetTextColor(128, 128, 128)
	pdf.Cell(0, 8, "Thank you for shopping with SakiFarm Ecommerce!")
	pdf.Ln(5)
	pdf.Cell(0, 8, fmt.Sprintf("Generated on %s", time.Now().Format("January 2, 2006 at 3:04 PM")))

	// Output PDF as bytes
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	
	return buf.Bytes(), nil
}

func (s *PDFService) GenerateInvoice(order *models.Order) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Similar structure to receipt but formatted as invoice
	// Set colors for branding
	pdf.SetFillColor(255, 20, 147) // Hot pink
	pdf.SetTextColor(0, 0, 139)   // Navy blue

	// Header
	pdf.SetFont("Arial", "B", 20)
	pdf.CellFormat(0, 15, "SakiFarm Ecommerce", "0", 1, "C", true, 0, "")
	pdf.Ln(5)

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "INVOICE")
	pdf.Ln(15)

	// Invoice details
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Invoice Number:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, fmt.Sprintf("INV-%s", order.OrderNumber))
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Invoice Date:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, time.Now().Format("January 2, 2006"))
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(50, 8, "Due Date:")
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(0, 8, time.Now().AddDate(0, 0, 30).Format("January 2, 2006"))
	pdf.Ln(15)

	// Rest similar to receipt...
	// (Implementation would continue similar to receipt)

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	
	return buf.Bytes(), nil
}
