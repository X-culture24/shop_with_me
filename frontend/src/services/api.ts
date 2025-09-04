import axios from 'axios';
import { AuthResponse, User, Product, Order, Payment, Category, PaginatedResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    phone: string;
    first_name: string;
    last_name: string;
  }) => api.post<AuthResponse>('/auth/register', userData),

  login: (credentials: { identifier: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),

  sendOTP: (data: { phone: string; purpose: string }) =>
    api.post('/auth/send-otp', data),

  verifyOTP: (data: { phone: string; code: string; purpose: string }) =>
    api.post('/auth/verify-otp', data),

  loginWithOTP: (data: { phone: string; code: string; purpose: string }) =>
    api.post<AuthResponse>('/auth/login-otp', data),

  resetPassword: (data: { phone: string; new_password: string; otp_code: string }) =>
    api.post('/auth/reset-password', data),

  getProfile: () => api.get<User>('/profile'),
};

// Products API
export const productsApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
  }) => api.get<PaginatedResponse<Product>>('/products', { params }),

  getProduct: (id: number) => api.get<{ product: Product }>(`/products/${id}`),

  getCategories: () => api.get<{ categories: Category[] }>('/products/categories'),

  // Admin only
  createProduct: (productData: any) =>
    api.post<{ message: string; product: Product }>('/admin/products', productData),

  updateProduct: (id: number, productData: any) =>
    api.put<{ message: string; product: Product }>(`/admin/products/${id}`, productData),

  deleteProduct: (id: number) =>
    api.delete<{ message: string }>(`/admin/products/${id}`),

  addProductImage: (id: number, imageData: any) =>
    api.post(`/admin/products/${id}/images`, imageData),

  deleteProductImage: (productId: number, imageId: number) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),
};

// Orders API
export const ordersApi = {
  createOrder: (orderData: {
    items: { product_id: number; quantity: number }[];
    shipping_address: any;
    billing_address: any;
    payment_method: string;
    phone_number: string;
    notes?: string;
  }) => api.post<{ message: string; order: Order; payment: Payment }>('/orders', orderData),

  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<Order>>('/orders', { params }),

  getOrder: (id: number) => api.get<{ order: Order }>(`/orders/${id}`),

  cancelOrder: (id: number) =>
    api.put<{ message: string; order: Order }>(`/orders/${id}/cancel`),

  generateReceipt: (id: number) => api.get(`/orders/${id}/receipt`, {
    responseType: 'blob',
  }),

  trackOrder: (trackingNumber: string) =>
    api.get(`/track/${trackingNumber}`),

  // Admin only
  updateOrderStatus: (id: number, statusData: {
    status: string;
    tracking_number?: string;
    notes?: string;
  }) => api.put<{ message: string; order: Order }>(`/admin/orders/${id}/status`, statusData),
};

// Payments API
export const paymentsApi = {
  getPaymentStatus: (id: number) => api.get<{ payment: Payment }>(`/payments/${id}`),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
