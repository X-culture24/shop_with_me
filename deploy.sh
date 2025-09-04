#!/bin/bash

# SakiFarm Ecommerce Deployment Script
# This script helps deploy the application to Digital Ocean

set -e

echo "🚀 SakiFarm Ecommerce Deployment Script"
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your production values before continuing."
    echo "   Required: DB_PASSWORD, JWT_SECRET"
    echo "   Optional: CLOUDINARY_*, TWILIO_*, SMTP_*, MPESA_*, AIRTEL_*"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
if [ "$1" = "prod" ]; then
    echo "📦 Using production configuration..."
    docker-compose -f docker-compose.prod.yml up -d --build
else
    echo "🔧 Using development configuration..."
    docker-compose up -d --build
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Test backend health
echo "🏥 Testing backend health..."
if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📋 Backend logs:"
    docker-compose logs --tail=20 backend
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    echo "📋 Frontend logs:"
    docker-compose logs --tail=20 frontend
fi

echo ""
echo "🎉 Deployment completed!"
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8080/api"
echo "🗄️  Database: localhost:5432"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@sakifarm.com"
echo "   Password: admin123"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
