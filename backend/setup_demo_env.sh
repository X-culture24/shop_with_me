#!/bin/bash

# Setup Daraja Sandbox Demo Environment
echo "Setting up Daraja Sandbox Demo Environment..."

# Create .env file with demo credentials
cat > .env << EOF
# Database Configuration
DATABASE_URL=host=localhost user=postgres password=postgres dbname=sakifarm port=5432 sslmode=disable

# JWT Secret (Change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=8080
ENVIRONMENT=development

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE=+1234567890

# Image Upload (Cloudinary)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# M-Pesa Configuration (Daraja Sandbox/Demo)
MPESA_CONSUMER_KEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CONSUMER_SECRET=b9fde43ace2b4f238e59e3b4c36a6525d890858f49b64e05ba6a9c6a4e5c4db1
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379

# Airtel Money Configuration
AIRTEL_CLIENT_ID=your-airtel-client-id
AIRTEL_CLIENT_SECRET=your-airtel-client-secret
EOF

echo "✅ Demo environment configured with Daraja sandbox credentials"
echo ""
echo "📱 Test Phone Numbers for Sandbox:"
echo "   - 254708374149 (Success scenario)"
echo "   - 254711XXXXXX (Use any valid Kenyan number for testing)"
echo ""
echo "💰 Test Amounts:"
echo "   - 1 KES (Success)"
echo "   - 2 KES (Insufficient funds)"
echo "   - 3 KES (Invalid account)"
echo "   - 4 KES (Invalid phone number)"
echo "   - 5 KES (Transaction timeout)"
echo ""
echo "🔗 Callback URL configured: http://localhost:8080/api/payments/mpesa/callback"
echo ""
echo "To start testing:"
echo "1. Run: docker-compose up -d (for database)"
echo "2. Run: go run main.go (start backend)"
echo "3. Use the frontend to make a test payment"
