package services

import (
	"fmt"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	host     string
	port     int
	username string
	password string
}

func NewEmailService(host string, port int, username, password string) *EmailService {
	return &EmailService{
		host:     host,
		port:     port,
		username: username,
		password: password,
	}
}

func (s *EmailService) SendEmail(to, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(s.host, s.port, s.username, s.password)
	return d.DialAndSend(m)
}

func (s *EmailService) SendWelcomeEmail(to, firstName string) error {
	subject := "Welcome to SakiFarm Ecommerce!"
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Welcome %s!</h2>
			<p>Thank you for joining SakiFarm Ecommerce. We're excited to have you on board!</p>
			<p>Start exploring our amazing products and enjoy shopping with us.</p>
			<br>
			<p>Best regards,<br>SakiFarm Team</p>
		</body>
		</html>
	`, firstName)

	return s.SendEmail(to, subject, body)
}

func (s *EmailService) SendOrderConfirmation(to, orderNumber string, total float64) error {
	subject := "Order Confirmation - " + orderNumber
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Order Confirmed!</h2>
			<p>Your order <strong>%s</strong> has been confirmed.</p>
			<p>Total Amount: KES %.2f</p>
			<p>We'll send you tracking information once your order ships.</p>
			<br>
			<p>Thank you for shopping with us!<br>SakiFarm Team</p>
		</body>
		</html>
	`, orderNumber, total)

	return s.SendEmail(to, subject, body)
}

func (s *EmailService) SendDeliveryNotification(to, orderNumber, trackingNumber string) error {
	subject := "Your Order Has Been Delivered - " + orderNumber
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Order Delivered!</h2>
			<p>Your order <strong>%s</strong> has been successfully delivered.</p>
			<p>Tracking Number: %s</p>
			<p>We hope you enjoy your purchase! Please consider leaving a review.</p>
			<br>
			<p>Thank you for choosing us!<br>SakiFarm Team</p>
		</body>
		</html>
	`, orderNumber, trackingNumber)

	return s.SendEmail(to, subject, body)
}
