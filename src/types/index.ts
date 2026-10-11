export type UserRole = 'customer' | 'seller' | 'admin' | 'super_admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';
export type PayoutStatus = 'requested' | 'approved' | 'processing' | 'paid' | 'rejected';
export type ReturnStatus = 'requested' | 'under_review' | 'approved' | 'rejected' | 'returned' | 'refunded';

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export interface SellerProfile {
  userId: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  businessAddress: string;
  country: string;
  city: string;
  status: SellerStatus;
  commissionRate: number;
  logo?: string;
  banner?: string;
  createdAt: string;
}

export interface CustomerProfile {
  userId: string;
  addresses: Address[];
  wishlist: string[];
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  brand?: string;
  images: string[];
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  sku: string;
  variants?: ProductVariant[];
  weight?: number;
  specifications?: Record<string, string>;
  status: ProductStatus;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  priceModifier: number;
  stock: number;
  sku: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  subtotals: { [sellerId: string]: number };
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  couponCode?: string;
  suborders: SubOrder[];
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
  commission: number;
  sellerEarning: number;
}

export interface SubOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface SellerLedgerEntry {
  id: string;
  sellerId: string;
  type: 'sale' | 'commission' | 'refund' | 'payout' | 'adjustment';
  amount: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: PayoutStatus;
  adminNotes?: string;
  transactionRef?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  reason: string;
  description: string;
  quantity: number;
  status: ReturnStatus;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'seller' | 'product' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  marketplaceName: string;
  currency: string;
  currencySymbol: string;
  defaultCommissionRate: number;
  minPayoutAmount: number;
  sellerApprovalRequired: boolean;
  productApprovalRequired: boolean;
  guestCheckoutEnabled: boolean;
  freeShippingThreshold: number;
  flatShippingRate: number;
  taxRate: number;
  maintenanceMode: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  createdAt: string;
}
