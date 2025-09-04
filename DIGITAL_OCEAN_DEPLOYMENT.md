# Digital Ocean Deployment Guide

## Prerequisites

1. **Digital Ocean Account** with billing enabled
2. **Domain name** (optional but recommended)
3. **Docker** and **Docker Compose** installed locally for testing

## Step 1: Create Digital Ocean Droplet

1. **Create a new Droplet:**
   - Choose **Ubuntu 22.04 LTS**
   - Select **Basic plan** (minimum 2GB RAM, 1 vCPU recommended)
   - Choose a datacenter region close to your users
   - Add your SSH key for secure access

2. **Connect to your droplet:**
   ```bash
   ssh root@your_droplet_ip
   ```

## Step 2: Server Setup

1. **Update the system:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

3. **Install Git:**
   ```bash
   apt install git -y
   ```

## Step 3: Deploy Application

1. **Clone your repository:**
   ```bash
   git clone https://github.com/yourusername/shop_with_me.git
   cd shop_with_me
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Configure environment variables in .env:**
   ```bash
   # Required - Change these values
   DB_PASSWORD=your_secure_database_password
   JWT_SECRET=your_very_long_random_jwt_secret_key_here
   
   # Optional - Configure if you want these features
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   
   # M-Pesa (for Kenyan payments)
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   ```

4. **Build and start the application:**
   ```bash
   # For production deployment
   docker-compose -f docker-compose.prod.yml up -d --build
   
   # Or for development/testing
   docker-compose up -d --build
   ```

5. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

## Step 4: Configure Firewall

1. **Enable UFW firewall:**
   ```bash
   ufw enable
   ufw allow ssh
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 8080/tcp
   ```

## Step 5: Set Up Domain (Optional)

1. **Point your domain to the droplet IP:**
   - Create an A record pointing to your droplet's IP address
   - Wait for DNS propagation (5-30 minutes)

2. **Install SSL certificate (recommended):**
   ```bash
   # Install Certbot
   apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   certbot --nginx -d yourdomain.com
   ```

## Step 6: Create Admin User

1. **Access the running backend container:**
   ```bash
   docker-compose exec backend /bin/sh
   ```

2. **Create admin user (if not automatically created):**
   ```bash
   # The system should auto-create admin user on first run
   # Default credentials: admin@sakifarm.com / admin123
   ```

## Step 7: Test Your Deployment

1. **Access your application:**
   - Frontend: `http://your_droplet_ip` or `https://yourdomain.com`
   - Backend API: `http://your_droplet_ip:8080/api/health`

2. **Test key features:**
   - User registration/login
   - Product browsing
   - Cart functionality
   - Admin panel access

## Step 8: Monitoring and Maintenance

1. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   ```

2. **Update application:**
   ```bash
   git pull origin main
   docker-compose down
   docker-compose up -d --build
   ```

3. **Backup database:**
   ```bash
   docker-compose exec postgres pg_dump -U postgres sakifarm_ecommerce > backup.sql
   ```

## Troubleshooting

### Common Issues:

1. **Port 80 already in use:**
   ```bash
   sudo lsof -i :80
   sudo systemctl stop apache2  # if Apache is running
   sudo systemctl stop nginx    # if Nginx is running
   ```

2. **Database connection issues:**
   - Check if PostgreSQL container is running: `docker-compose ps`
   - Check logs: `docker-compose logs postgres`

3. **Frontend not loading:**
   - Check if build completed successfully: `docker-compose logs frontend`
   - Verify nginx configuration

4. **API calls failing:**
   - Check backend logs: `docker-compose logs backend`
   - Verify environment variables are set correctly

## Production Recommendations

1. **Security:**
   - Change default passwords
   - Use strong JWT secrets
   - Enable firewall
   - Regular security updates

2. **Performance:**
   - Use a CDN for static assets
   - Enable database connection pooling
   - Monitor resource usage

3. **Backup:**
   - Set up automated database backups
   - Store backups in external storage (S3, etc.)

4. **Monitoring:**
   - Set up application monitoring
   - Configure log aggregation
   - Set up alerts for downtime

## Cost Estimation

- **Basic Droplet (2GB RAM):** $12/month
- **Domain name:** $10-15/year
- **SSL Certificate:** Free with Let's Encrypt
- **Total monthly cost:** ~$12-15/month

Your SakiFarm ecommerce system is now deployed and ready for production use!
