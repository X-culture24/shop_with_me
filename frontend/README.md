# SakiFarm E-commerce Platform

A modern e-commerce platform built with React, TypeScript, and Material-UI, featuring a clean and responsive design with hot pink (#FF1493) and navy blue (#000080) theme.

## 🚀 Features

- **User Authentication**
  - Email/Password registration and login
  - OTP verification
  - Password reset functionality

- **Product Management**
  - Browse products with search and filters
  - Product details with image gallery
  - Product reviews and ratings

- **Shopping Experience**
  - Add/remove items from cart
  - Quantity adjustment
  - Wishlist functionality

- **Checkout Process**
  - Multiple payment methods (M-Pesa, Airtel Money)
  - Order tracking
  - PDF receipts

- **Admin Dashboard**
  - Product management (CRUD)
  - Order management
  - User management

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Backend server running (see backend README for setup)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd shop_with_me/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend root and add your environment variables:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Start the development server
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📦 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint
- `npm run format` - Formats code with Prettier

## 🌐 Production Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `build` directory to your hosting service of choice (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Default Admin Credentials

- **Email**: admin@sakifarm.com
- **Password**: admin123

## 📞 Support

For support, please open an issue or contact the development team.
