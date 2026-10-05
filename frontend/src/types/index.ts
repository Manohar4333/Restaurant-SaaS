export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface Tenant {
  id: string;
  businessName: string;
  slug: string;
  email?: string;
  phone?: string;
  logo?: string;
  currency: string;
  taxPercentage: number;
  status: 'ACTIVE' | 'PAYMENT_PENDING' | 'SUSPENDED' | 'DEACTIVATED';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface Subscription {
  status: 'ACTIVE' | 'PAYMENT_PENDING' | 'GRACE_PERIOD' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  expiryDate: string;
  gracePeriodEndDate?: string;
  amount?: number;
  plan?: {
    _id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

export interface Product {
  _id: string;
  categoryId: { _id: string; name: string } | string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock: number;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  status: 'ACTIVE' | 'INACTIVE';
  isPopular?: boolean;
}

export interface RestaurantTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'ORDER_PLACED' | 'SERVING' | 'CLEANING';
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  tenantId: string | Tenant;
  customerId: { _id: string; name: string; phone: string } | string;
  tableId: { _id: string; tableNumber: string } | string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'PAY_AT_RESTAURANT' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
  errors?: Record<string, string>;
}
