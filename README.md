Here's the complete, cleaned-up README content for you to copy and use on GitHub:

```markdown
# SakiFarm E-commerce Platform

A modern, full-stack e-commerce solution with React/TypeScript frontend and Go backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm 9+
- Go 1.19+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shop
   ```

2. **Set up backend**
   ```bash
   cd shop_with_me/backend
   cp .env.example .env
   # Edit .env with your configuration
   go mod download
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

4. **Start the application**
   ```bash
   # In backend directory
   go run main.go
   
   # In frontend directory (new terminal)
   npm run dev
   ```

## 🌟 Key Features

### User Features
- Secure authentication (Email/Password + OTP)
- Product browsing with search & filters
- Shopping cart & wishlist
- Secure checkout with M-Pesa/Airtel Money
- Order tracking & PDF receipts

### Admin Features
- Product management (CRUD)
- Order processing
- User management
- Sales analytics

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Material-UI (MUI) v5
- React Router v6
- Vite
- Axios

### Backend
- Go 1.19+
- Gin Web Framework
- GORM
- JWT Authentication
- PostgreSQL

## 🏗️ Infrastructure

- **Docker** for containerization
- **Terraform** for infrastructure as code
- **Ansible** for configuration management
- **Jenkins** for CI/CD pipeline
- **Vagrant** for development environment

## 📁 Project Structure

```
shop/
├── shop_with_me/                 # Main application
│   ├── frontend/                 # React TypeScript application
│   │   ├── public/              # Static assets
│   │   ├── src/                 # Source code
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── pages/           # Page components
│   │   │   ├── services/        # API services
│   │   │   └── utils/           # Utility functions
│   │   └── package.json
│   │
│   └── backend/                 # Go backend
│       ├── cmd/                # Application entry points
│       ├── internal/           # Private application code
│       │   ├── config/        # Configuration
│       │   ├── handlers/      # HTTP handlers
│       │   ├── middleware/    # HTTP middleware
│       │   ├── models/        # Database models
│       │   └── services/      # Business logic
│       └── go.mod
│
├── infrastructure/             # Infrastructure as Code
│   ├── ansible/               # Ansible playbooks
│   ├── terraform/             # Terraform configurations
│   └── scripts/               # Deployment scripts
│
└── docs/                      # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── DEVELOPMENT.md
```

## 🚀 Deployment

### Docker (Recommended)
```bash
docker-compose up --build
```

### Manual Deployment
1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Run backend:
   ```bash
   cd ../backend
   go build
   ./backend
   ```

## 📚 Documentation

- [API Documentation](/docs/API.md)
- [Deployment Guide](/docs/DEPLOYMENT.md)
- [Development Setup](/docs/DEVELOPMENT.md)

## 📝 License

MIT
```

You can now copy this content and use it in your GitHub repository. The README is well-structured, includes all necessary information, and follows best practices for open-source project documentation.
