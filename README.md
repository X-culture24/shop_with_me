# SakiFarm E-commerce Platform 🛒

A modern, full-stack e-commerce solution built with React/TypeScript frontend and Go backend, featuring M-Pesa/Airtel Money payments, admin dashboard, and comprehensive product management.

## ✨ Features

### 🛍️ Customer Features
- **Authentication**: Secure login/register with JWT + OTP verification
- **Product Catalog**: Browse products with advanced search, filtering, and pagination
- **Shopping Cart**: Add/remove items, quantity management, delivery fee calculation
- **Checkout**: Multiple payment options (M-Pesa, Airtel Money, Card, Cash)
- **Order Tracking**: Real-time order status updates and PDF receipts
- **User Profile**: Account management and order history

### 👨‍💼 Admin Features
- **Product Management**: CRUD operations with image uploads
- **Order Management**: Process orders, update status, generate reports
- **User Management**: View and manage customer accounts
- **Analytics Dashboard**: Sales statistics and performance metrics
- **Inventory Control**: Stock management with low-stock alerts
- **Payment Processing**: Handle M-Pesa/Airtel Money transactions

### 💰 Payment Integration
- **M-Pesa**: Safaricom Daraja API integration
- **Airtel Money**: Airtel payment gateway
- **Card Payments**: Secure card processing
- **Cash/Insurance**: Alternative payment methods

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ & npm
- **Go** 1.22+
- **PostgreSQL** 15+
- **Docker** (optional but recommended)

### 🐳 Docker Setup (Recommended)

1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd shop_with_me
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start with Docker**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/api
   - Admin: admin@sakifarm.com / admin123

### 🔧 Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   go mod download
   go run main.go
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL and create database
   createdb sakifarm_ecommerce
   ```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Framer Motion** for animations
- **React Toastify** for notifications

### Backend
- **Go 1.22** with Gin framework
- **GORM** for database ORM
- **JWT** for authentication
- **PostgreSQL** database
- **Cloudinary** for image storage
- **Twilio** for SMS/OTP

### Infrastructure
- **Docker & Docker Compose**
- **Nginx** for production serving
- **Digital Ocean** deployment ready
- **SSL/TLS** support

## 📁 Project Structure

```
shop_with_me/
├── backend/                    # Go backend
│   ├── config/                # Configuration
│   ├── handlers/              # HTTP handlers
│   ├── middleware/            # Middleware
│   ├── models/                # Database models
│   ├── services/              # Business logic
│   ├── uploads/               # File uploads
│   └── main.go               # Entry point
│
├── frontend/                  # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── types/            # TypeScript types
│   └── nginx.conf            # Production config
│
├── infrastructure/           # DevOps
│   ├── ansible/             # Configuration management
│   ├── terraform/           # Infrastructure as code
│   └── scripts/             # Deployment scripts
│
├── docker-compose.yml       # Development
├── docker-compose.prod.yml  # Production
├── deploy.sh               # Deployment script
└── DIGITAL_OCEAN_DEPLOYMENT.md
```

## 🌐 Deployment

### Digital Ocean Deployment

1. **Create Droplet** (Ubuntu 22.04, 2GB RAM minimum)
2. **Follow the guide**: [DIGITAL_OCEAN_DEPLOYMENT.md](DIGITAL_OCEAN_DEPLOYMENT.md)
3. **One-click deploy**:
   ```bash
   ./deploy.sh prod
   ```

### Environment Variables

Create `.env` file with:
```bash
# Required
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret

# Optional (for full functionality)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
TWILIO_ACCOUNT_SID=your_twilio_sid
MPESA_CONSUMER_KEY=your_mpesa_key
# ... see .env.example for all options
```

## 🧪 Testing

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd frontend
npm test
```

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Products
- `GET /api/products` - List products (with search/filter)
- `GET /api/products/:id` - Get product details
- `POST /api/admin/products` - Create product (admin)

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Payments
- `POST /api/payments/mpesa` - M-Pesa payment
- `POST /api/payments/airtel` - Airtel Money payment

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- SQL injection prevention
- XSS protection

## 🚀 Performance Features

- Database connection pooling
- Image optimization
- Lazy loading
- Pagination
- Caching strategies
- CDN ready

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/shop_with_me/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/shop_with_me/wiki)
- **Email**: support@sakifarm.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-vendor support
- [ ] Inventory forecasting
- [ ] Social media integration
- [ ] Advanced search with AI

---

**Built with ❤️ for modern e-commerce**
