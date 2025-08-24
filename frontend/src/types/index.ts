export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  is_verified: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  category: Category;
  images?: ProductImage[];
  status: 'active' | 'inactive';
  rating?: number;
  review_count?: number;
  createdAt: Date;
  updatedAt: Date;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
  isPrimary?: boolean; // For compatibility
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  user: User;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_ref: string;
  total_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  items: OrderItem[];
  shipping_address: Address;
  billing_address: Address;
  tracking_number: string;
  delivered_at?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  phone: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string;
  external_ref: string;
  phone_number: string;
  provider_response: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  parent_id?: number;
  parent?: Category;
  children: Category[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  user: User;
  product_id: number;
  product: Product;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TrackingTimeline {
  status: string;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
}
