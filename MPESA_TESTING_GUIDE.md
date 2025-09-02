# M-Pesa Daraja Sandbox Testing Guide

## Overview
This guide explains how to test M-Pesa payments using the Safaricom Daraja API sandbox environment with free demo credentials.

## Demo Credentials Configured
- **Consumer Key**: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- **Consumer Secret**: `b9fde43ace2b4f238e59e3b4c36a6525d890858f49b64e05ba6a9c6a4e5c4db1`
- **Passkey**: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- **Shortcode**: `174379`
- **Environment**: Sandbox

## Test Phone Numbers
Use these phone numbers for different test scenarios:

### Success Scenarios
- `254708374149` - Always succeeds
- `254711XXXXXX` - Any valid Kenyan number format

### Test Amounts & Expected Results
- **1 KES** - Payment success
- **2 KES** - Insufficient funds error
- **3 KES** - Invalid account error
- **4 KES** - Invalid phone number error
- **5 KES** - Transaction timeout error

## How to Test

### 1. Start the Application
```bash
# Backend
cd backend
./setup_demo_env.sh
go run main.go

# Frontend
cd frontend
npm start
```

### 2. Test Payment Flow
1. **Register/Login** to the application
2. **Add products** to cart
3. **Proceed to checkout**
4. **Select M-Pesa** as payment method
5. **Enter test phone number**: `254708374149`
6. **Enter test amount**: `1` (for success)
7. **Submit payment**

### 3. Expected Behavior
1. STK Push request sent to Daraja sandbox
2. Simulated M-Pesa prompt (no actual phone prompt in sandbox)
3. Payment status updated based on test amount
4. Order status updated to "paid" on success

## API Endpoints

### Initiate M-Pesa Payment
```http
POST /api/payments/mobile
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "provider": "mpesa",
  "phone_number": "254708374149",
  "amount": 1,
  "order_id": 123
}
```

### Check Payment Status
```http
GET /api/payments/status/{transaction_id}
Authorization: Bearer <jwt_token>
```

### M-Pesa Callback (Internal)
```http
POST /api/payments/mpesa/callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "CheckoutRequestID": "ws_CO_123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully."
    }
  }
}
```

## Order & Delivery Workflow

### Order Statuses
1. **pending** - Order created, payment pending
2. **paid** - Payment successful
3. **processing** - Order being prepared
4. **shipped** - Order dispatched
5. **delivered** - Order delivered (PDF receipt generated)
6. **cancelled** - Order cancelled

### Testing Complete Workflow
1. **Create Order** - Add items to cart and checkout
2. **Process Payment** - Use M-Pesa sandbox
3. **Update Order Status** - Admin can update to "processing" → "shipped" → "delivered"
4. **Generate Receipt** - PDF receipt created on delivery

## Troubleshooting

### Common Issues
- **Connection Error**: Ensure backend is running on port 8080
- **Database Error**: Check PostgreSQL is running
- **Invalid Phone**: Use Kenyan format (254XXXXXXXXX)
- **Callback Issues**: Callback URL set to `http://localhost:8080/api/payments/mpesa/callback`

### Debug Tips
- Check backend logs for API responses
- Verify environment variables are loaded
- Test with amount `1` for guaranteed success
- Use browser dev tools to monitor network requests

## Production Migration
When ready for production:
1. Get real Daraja API credentials from Safaricom
2. Update environment variables
3. Change `ENVIRONMENT=production` in `.env`
4. Update callback URL to your domain
5. Test with real phone numbers and amounts

## Security Notes
- Demo credentials are public and for testing only
- Never use sandbox credentials in production
- Implement proper error handling and logging
- Validate all inputs on both client and server side
