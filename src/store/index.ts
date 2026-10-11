import { v4 as uuidv4 } from 'uuid';
import type { User, SellerProfile, CustomerProfile, Product, Category, Order, OrderItem, Coupon, Review, CartItem, Notification, PlatformSettings, SellerLedgerEntry, PayoutRequest, Address, AuditLog, ReturnRequest, OrderStatus, PayoutStatus } from '../types';

const STORAGE_KEY = 'shopverse_data';

interface AppData {
  users: User[];
  sellerProfiles: SellerProfile[];
  customerProfiles: CustomerProfile[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  carts: { [userId: string]: CartItem[] };
  notifications: Notification[];
  settings: PlatformSettings;
  ledger: SellerLedgerEntry[];
  payouts: PayoutRequest[];
  auditLogs: AuditLog[];
  returns: ReturnRequest[];
}

const defaultSettings: PlatformSettings = {
  marketplaceName: 'ShopVerse',
  currency: 'USD',
  currencySymbol: '$',
  defaultCommissionRate: 10,
  minPayoutAmount: 50,
  sellerApprovalRequired: true,
  productApprovalRequired: true,
  guestCheckoutEnabled: true,
  freeShippingThreshold: 100,
  flatShippingRate: 9.99,
  taxRate: 8,
  maintenanceMode: false,
};

function generateMockData(): AppData {
  const adminId = uuidv4();
  const seller1Id = uuidv4();
  const seller2Id = uuidv4();
  const seller3Id = uuidv4();
  const customer1Id = uuidv4();
  const customer2Id = uuidv4();

  const users: User[] = [
    { id: adminId, email: 'admin@shopverse.com', password: 'Admin@123', fullName: 'System Admin', phone: '+1234567890', role: 'super_admin', createdAt: '2024-01-01T00:00:00Z', isActive: true },
    { id: seller1Id, email: 'techstore@shop.com', password: 'Seller@123', fullName: 'John Tech', phone: '+1234567891', role: 'seller', createdAt: '2024-01-15T00:00:00Z', isActive: true },
    { id: seller2Id, email: 'fashion@shop.com', password: 'Seller@123', fullName: 'Sarah Fashion', phone: '+1234567892', role: 'seller', createdAt: '2024-02-01T00:00:00Z', isActive: true },
    { id: seller3Id, email: 'home@shop.com', password: 'Seller@123', fullName: 'Mike Home', phone: '+1234567893', role: 'seller', createdAt: '2024-02-15T00:00:00Z', isActive: true },
    { id: customer1Id, email: 'customer@test.com', password: 'Customer@123', fullName: 'Alice Johnson', phone: '+1234567894', role: 'customer', createdAt: '2024-03-01T00:00:00Z', isActive: true },
    { id: customer2Id, email: 'bob@test.com', password: 'Customer@123', fullName: 'Bob Smith', phone: '+1234567895', role: 'customer', createdAt: '2024-03-15T00:00:00Z', isActive: true },
  ];

  const sellerProfiles: SellerProfile[] = [
    { userId: seller1Id, storeName: 'TechZone', storeSlug: 'techzone', storeDescription: 'Premium electronics and gadgets at unbeatable prices. We offer the latest smartphones, laptops, and accessories.', businessAddress: '123 Tech Street', country: 'USA', city: 'San Francisco', status: 'approved', commissionRate: 10, createdAt: '2024-01-15T00:00:00Z' },
    { userId: seller2Id, storeName: 'StyleHub', storeSlug: 'stylehub', storeDescription: 'Trendy fashion for men and women. Discover the latest styles in clothing, shoes, and accessories.', businessAddress: '456 Fashion Ave', country: 'USA', city: 'New York', status: 'approved', commissionRate: 12, createdAt: '2024-02-01T00:00:00Z' },
    { userId: seller3Id, storeName: 'HomeEssentials', storeSlug: 'homeessentials', storeDescription: 'Everything you need to make your house a home. Quality furniture, decor, and kitchen essentials.', businessAddress: '789 Home Blvd', country: 'USA', city: 'Chicago', status: 'approved', commissionRate: 8, createdAt: '2024-02-15T00:00:00Z' },
  ];

  const categories: Category[] = [
    { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', description: 'Latest electronics and gadgets', isActive: true },
    { id: 'cat-phones', name: 'Smartphones', slug: 'smartphones', description: 'Smartphones and mobile accessories', parentId: 'cat-electronics', isActive: true },
    { id: 'cat-laptops', name: 'Laptops', slug: 'laptops', description: 'Laptops and notebooks', parentId: 'cat-electronics', isActive: true },
    { id: 'cat-audio', name: 'Audio', slug: 'audio', description: 'Headphones, speakers, and audio equipment', parentId: 'cat-electronics', isActive: true },
    { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', isActive: true },
    { id: 'cat-men', name: "Men's Clothing", slug: 'mens-clothing', description: "Men's fashion and apparel", parentId: 'cat-fashion', isActive: true },
    { id: 'cat-women', name: "Women's Clothing", slug: 'womens-clothing', description: "Women's fashion and apparel", parentId: 'cat-fashion', isActive: true },
    { id: 'cat-shoes', name: 'Shoes', slug: 'shoes', description: 'Footwear for all', parentId: 'cat-fashion', isActive: true },
    { id: 'cat-home', name: 'Home & Living', slug: 'home-living', description: 'Home decor and furniture', isActive: true },
    { id: 'cat-kitchen', name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and tools', parentId: 'cat-home', isActive: true },
    { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', description: 'Home and office furniture', parentId: 'cat-home', isActive: true },
  ];

  const products: Product[] = [
    // TechZone products
    { id: 'p1', sellerId: seller1Id, name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system. Features a 6.7-inch Super Retina XDR display with ProMotion.', shortDescription: 'Latest iPhone with A17 Pro chip and titanium design', categoryId: 'cat-phones', brand: 'Apple', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'], price: 1199, salePrice: 1099, stock: 50, sku: 'TZ-IP15PM-256', status: 'approved', isFeatured: true, rating: 4.8, reviewCount: 234, createdAt: '2024-03-01T00:00:00Z', specifications: { 'Storage': '256GB', 'Color': 'Natural Titanium', 'Display': '6.7 inch', 'Chip': 'A17 Pro' } },
    { id: 'p2', sellerId: seller1Id, name: 'MacBook Air M3', slug: 'macbook-air-m3', description: 'Supercharged by the M3 chip. Up to 18 hours of battery life. Stunningly thin design with a brilliant Liquid Retina display.', shortDescription: 'Thin, light, powerful MacBook with M3 chip', categoryId: 'cat-laptops', brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'], price: 1299, stock: 30, sku: 'TZ-MBA-M3', status: 'approved', isFeatured: true, rating: 4.9, reviewCount: 189, createdAt: '2024-03-05T00:00:00Z', specifications: { 'Chip': 'M3', 'RAM': '16GB', 'Storage': '512GB SSD', 'Display': '15.3 inch' } },
    { id: 'p3', sellerId: seller1Id, name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling. Up to 30 hours battery life.', shortDescription: 'Premium noise-cancelling headphones', categoryId: 'cat-audio', brand: 'Sony', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500'], price: 399, salePrice: 349, stock: 75, sku: 'TZ-SONY-XM5', status: 'approved', isFeatured: false, rating: 4.7, reviewCount: 456, createdAt: '2024-03-10T00:00:00Z', specifications: { 'Type': 'Over-ear', 'Battery': '30 hours', 'Driver': '30mm', 'Weight': '250g' } },
    { id: 'p4', sellerId: seller1Id, name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'Galaxy AI is here. The most powerful Galaxy smartphone with built-in AI features, S Pen, and titanium frame.', shortDescription: 'AI-powered flagship smartphone', categoryId: 'cat-phones', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'], price: 1299, salePrice: 1199, stock: 40, sku: 'TZ-SGS24U', status: 'approved', isFeatured: true, rating: 4.6, reviewCount: 178, createdAt: '2024-03-15T00:00:00Z', specifications: { 'Storage': '256GB', 'RAM': '12GB', 'Display': '6.8 inch', 'Battery': '5000mAh' } },
    { id: 'p5', sellerId: seller1Id, name: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'Rebuilt from the sound up with Apple H2 chip. Adaptive Audio, Personalized Spatial Audio, and active noise cancellation.', shortDescription: 'Premium wireless earbuds with ANC', categoryId: 'cat-audio', brand: 'Apple', images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500'], price: 249, salePrice: 199, stock: 100, sku: 'TZ-APP2', status: 'approved', isFeatured: false, rating: 4.7, reviewCount: 892, createdAt: '2024-03-20T00:00:00Z', specifications: { 'Chip': 'H2', 'Battery': '6 hours', 'ANC': 'Yes', 'Case': 'MagSafe' } },
    // StyleHub products
    { id: 'p6', sellerId: seller2Id, name: 'Classic Leather Jacket', slug: 'classic-leather-jacket', description: 'Premium genuine leather jacket with a timeless design. Perfect for any occasion. Features soft inner lining and multiple pockets.', shortDescription: 'Premium genuine leather jacket', categoryId: 'cat-men', brand: 'StyleHub', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'], price: 299, salePrice: 249, stock: 25, sku: 'SH-CLJ-BLK', status: 'approved', isFeatured: true, rating: 4.5, reviewCount: 67, createdAt: '2024-03-01T00:00:00Z', specifications: { 'Material': 'Genuine Leather', 'Color': 'Black', 'Sizes': 'S-XXL', 'Lining': 'Polyester' } },
    { id: 'p7', sellerId: seller2Id, name: 'Floral Summer Dress', slug: 'floral-summer-dress', description: 'Beautiful floral print summer dress made from breathable cotton. Perfect for warm weather occasions.', shortDescription: 'Breathable cotton floral dress', categoryId: 'cat-women', brand: 'StyleHub', images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'], price: 89, salePrice: 69, stock: 60, sku: 'SH-FSD-FLR', status: 'approved', isFeatured: true, rating: 4.4, reviewCount: 123, createdAt: '2024-03-05T00:00:00Z', specifications: { 'Material': '100% Cotton', 'Pattern': 'Floral', 'Length': 'Midi', 'Care': 'Machine wash' } },
    { id: 'p8', sellerId: seller2Id, name: 'Running Sneakers Pro', slug: 'running-sneakers-pro', description: 'High-performance running shoes with advanced cushioning technology. Lightweight and breathable mesh upper.', shortDescription: 'High-performance running shoes', categoryId: 'cat-shoes', brand: 'StyleHub', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], price: 159, salePrice: 129, stock: 45, sku: 'SH-RSP-WHT', status: 'approved', isFeatured: false, rating: 4.6, reviewCount: 234, createdAt: '2024-03-10T00:00:00Z', specifications: { 'Material': 'Mesh/ Rubber', 'Sole': 'EVA Foam', 'Weight': '280g', 'Drop': '8mm' } },
    { id: 'p9', sellerId: seller2Id, name: 'Designer Handbag', slug: 'designer-handbag', description: 'Elegant designer handbag crafted from premium materials. Spacious interior with multiple compartments.', shortDescription: 'Elegant premium handbag', categoryId: 'cat-women', brand: 'StyleHub', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'], price: 199, stock: 30, sku: 'SH-DHB-TAN', status: 'approved', isFeatured: false, rating: 4.3, reviewCount: 89, createdAt: '2024-03-15T00:00:00Z', specifications: { 'Material': 'PU Leather', 'Dimensions': '30x25x12cm', 'Strap': 'Adjustable', 'Closure': 'Zipper' } },
    // HomeEssentials products
    { id: 'p10', sellerId: seller3Id, name: 'Modern Coffee Table', slug: 'modern-coffee-table', description: 'Sleek modern coffee table with tempered glass top and solid wood legs. Perfect centerpiece for your living room.', shortDescription: 'Sleek glass-top coffee table', categoryId: 'cat-furniture', brand: 'HomeEssentials', images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1a64?w=500'], price: 349, salePrice: 299, stock: 15, sku: 'HE-MCT-OAK', status: 'approved', isFeatured: true, rating: 4.5, reviewCount: 45, createdAt: '2024-03-01T00:00:00Z', specifications: { 'Material': 'Glass/Oak', 'Dimensions': '120x60x45cm', 'Weight': '25kg', 'Assembly': 'Required' } },
    { id: 'p11', sellerId: seller3Id, name: 'Smart Kitchen Scale', slug: 'smart-kitchen-scale', description: 'Digital kitchen scale with smartphone connectivity. Track nutrition, save recipes, and get precise measurements.', shortDescription: 'Connected digital kitchen scale', categoryId: 'cat-kitchen', brand: 'HomeEssentials', images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500'], price: 79, salePrice: 59, stock: 80, sku: 'HE-SKS-BLK', status: 'approved', isFeatured: false, rating: 4.4, reviewCount: 156, createdAt: '2024-03-05T00:00:00Z', specifications: { 'Capacity': '5kg', 'Precision': '1g', 'Connectivity': 'Bluetooth', 'Battery': 'Rechargeable' } },
    { id: 'p12', sellerId: seller3Id, name: 'Luxury Bedding Set', slug: 'luxury-bedding-set', description: 'Premium 1000 thread count Egyptian cotton bedding set. Includes duvet cover, fitted sheet, and 2 pillowcases.', shortDescription: '1000TC Egyptian cotton bedding', categoryId: 'cat-home', brand: 'HomeEssentials', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'], price: 249, salePrice: 199, stock: 35, sku: 'HE-LBS-QUEEN', status: 'approved', isFeatured: true, rating: 4.8, reviewCount: 267, createdAt: '2024-03-10T00:00:00Z', specifications: { 'Material': 'Egyptian Cotton', 'Thread Count': '1000', 'Size': 'Queen', 'Pieces': '4' } },
    { id: 'p13', sellerId: seller3Id, name: 'Ceramic Cookware Set', slug: 'ceramic-cookware-set', description: 'Non-toxic ceramic non-stick cookware set. 10-piece set including pots, pans, and lids. Oven safe up to 450°F.', shortDescription: '10-piece ceramic non-stick set', categoryId: 'cat-kitchen', brand: 'HomeEssentials', images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'], price: 199, salePrice: 159, stock: 40, sku: 'HE-CCS-10PC', status: 'approved', isFeatured: false, rating: 4.6, reviewCount: 198, createdAt: '2024-03-15T00:00:00Z', specifications: { 'Pieces': '10', 'Material': 'Ceramic Non-stick', 'Oven Safe': '450°F', 'Dishwasher': 'Safe' } },
    { id: 'p14', sellerId: seller1Id, name: 'Gaming Mouse RGB', slug: 'gaming-mouse-rgb', description: 'High-precision gaming mouse with 25600 DPI sensor, customizable RGB lighting, and programmable buttons.', shortDescription: 'Pro gaming mouse with 25600 DPI', categoryId: 'cat-electronics', brand: 'TechZone', images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'], price: 89, salePrice: 69, stock: 120, sku: 'TZ-GMR-BLK', status: 'approved', isFeatured: false, rating: 4.5, reviewCount: 345, createdAt: '2024-03-20T00:00:00Z', specifications: { 'DPI': '25600', 'Buttons': '8', 'Weight': '85g', 'Connection': 'USB-C' } },
    { id: 'p15', sellerId: seller2Id, name: 'Slim Fit Chinos', slug: 'slim-fit-chinos', description: 'Classic slim fit chinos made from premium stretch cotton. Versatile style for work or casual wear.', shortDescription: 'Premium stretch cotton chinos', categoryId: 'cat-men', brand: 'StyleHub', images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'], price: 79, salePrice: 59, stock: 70, sku: 'SH-SFC-KHK', status: 'approved', isFeatured: false, rating: 4.3, reviewCount: 156, createdAt: '2024-03-25T00:00:00Z', specifications: { 'Material': '98% Cotton 2% Elastane', 'Fit': 'Slim', 'Rise': 'Mid', 'Care': 'Machine wash' } },
  ];

  const coupons: Coupon[] = [
    { id: 'c1', code: 'WELCOME10', type: 'percentage', value: 10, minOrderAmount: 50, maxDiscount: 50, usageLimit: 1000, usedCount: 234, perCustomerLimit: 1, startDate: '2024-01-01', endDate: '2025-12-31', isActive: true },
    { id: 'c2', code: 'SAVE20', type: 'fixed', value: 20, minOrderAmount: 100, usageLimit: 500, usedCount: 89, perCustomerLimit: 2, startDate: '2024-01-01', endDate: '2025-12-31', isActive: true },
    { id: 'c3', code: 'FLASH50', type: 'fixed', value: 50, minOrderAmount: 200, maxDiscount: 50, usageLimit: 100, usedCount: 45, perCustomerLimit: 1, startDate: '2024-03-01', endDate: '2025-06-30', isActive: true },
  ];

  const customerProfiles: CustomerProfile[] = [
    { userId: customer1Id, addresses: [{ id: 'addr1', label: 'Home', fullName: 'Alice Johnson', phone: '+1234567894', addressLine1: '123 Main St', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA', isDefault: true }], wishlist: ['p3', 'p7'] },
    { userId: customer2Id, addresses: [{ id: 'addr2', label: 'Home', fullName: 'Bob Smith', phone: '+1234567895', addressLine1: '456 Oak Ave', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA', isDefault: true }], wishlist: ['p1', 'p10'] },
  ];

  const orders: Order[] = [
    {
      id: 'ord1', orderNumber: 'SV-2024-001', customerId: customer1Id,
      items: [
        { id: 'oi1', productId: 'p1', productName: 'iPhone 15 Pro Max', productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100', quantity: 1, unitPrice: 1099, totalPrice: 1099, sellerId: seller1Id, sellerName: 'TechZone', commission: 109.9, sellerEarning: 989.1 },
        { id: 'oi2', productId: 'p7', productName: 'Floral Summer Dress', productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100', quantity: 2, unitPrice: 69, totalPrice: 138, sellerId: seller2Id, sellerName: 'StyleHub', commission: 16.56, sellerEarning: 121.44 },
      ],
      subtotals: { [seller1Id]: 1099, [seller2Id]: 138 },
      subtotal: 1237, shippingCost: 0, tax: 98.96, discount: 123.7, total: 1212.26,
      status: 'delivered', paymentStatus: 'paid', paymentMethod: 'credit_card',
      shippingAddress: { id: 'addr1', label: 'Home', fullName: 'Alice Johnson', phone: '+1234567894', addressLine1: '123 Main St', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA', isDefault: true },
      couponCode: 'WELCOME10',
      suborders: [
        { id: 'so1', sellerId: seller1Id, sellerName: 'TechZone', items: [], subtotal: 1099, shippingCost: 0, total: 1099, status: 'delivered', trackingNumber: 'TRK123456', createdAt: '2024-03-20T00:00:00Z' },
        { id: 'so2', sellerId: seller2Id, sellerName: 'StyleHub', items: [], subtotal: 138, shippingCost: 0, total: 138, status: 'delivered', createdAt: '2024-03-20T00:00:00Z' },
      ],
      createdAt: '2024-03-20T00:00:00Z', updatedAt: '2024-03-25T00:00:00Z', trackingNumber: 'TRK123456'
    },
    {
      id: 'ord2', orderNumber: 'SV-2024-002', customerId: customer2Id,
      items: [
        { id: 'oi3', productId: 'p3', productName: 'Sony WH-1000XM5', productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100', quantity: 1, unitPrice: 349, totalPrice: 349, sellerId: seller1Id, sellerName: 'TechZone', commission: 34.9, sellerEarning: 314.1 },
      ],
      subtotals: { [seller1Id]: 349 },
      subtotal: 349, shippingCost: 9.99, tax: 28.72, discount: 0, total: 387.71,
      status: 'shipped', paymentStatus: 'paid', paymentMethod: 'credit_card',
      shippingAddress: { id: 'addr2', label: 'Home', fullName: 'Bob Smith', phone: '+1234567895', addressLine1: '456 Oak Ave', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA', isDefault: true },
      suborders: [
        { id: 'so3', sellerId: seller1Id, sellerName: 'TechZone', items: [], subtotal: 349, shippingCost: 9.99, total: 358.99, status: 'shipped', trackingNumber: 'TRK789012', createdAt: '2024-04-01T00:00:00Z' },
      ],
      createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-03T00:00:00Z', trackingNumber: 'TRK789012'
    },
    {
      id: 'ord3', orderNumber: 'SV-2024-003', customerId: customer1Id,
      items: [
        { id: 'oi4', productId: 'p10', productName: 'Modern Coffee Table', productImage: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1a64?w=100', quantity: 1, unitPrice: 299, totalPrice: 299, sellerId: seller3Id, sellerName: 'HomeEssentials', commission: 23.92, sellerEarning: 275.08 },
        { id: 'oi5', productId: 'p12', productName: 'Luxury Bedding Set', productImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100', quantity: 1, unitPrice: 199, totalPrice: 199, sellerId: seller3Id, sellerName: 'HomeEssentials', commission: 15.92, sellerEarning: 183.08 },
      ],
      subtotals: { [seller3Id]: 498 },
      subtotal: 498, shippingCost: 0, tax: 39.84, discount: 49.8, total: 488.04,
      status: 'processing', paymentStatus: 'paid', paymentMethod: 'cod',
      shippingAddress: { id: 'addr1', label: 'Home', fullName: 'Alice Johnson', phone: '+1234567894', addressLine1: '123 Main St', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA', isDefault: true },
      couponCode: 'WELCOME10',
      suborders: [
        { id: 'so4', sellerId: seller3Id, sellerName: 'HomeEssentials', items: [], subtotal: 498, shippingCost: 0, total: 498, status: 'processing', createdAt: '2024-04-10T00:00:00Z' },
      ],
      createdAt: '2024-04-10T00:00:00Z', updatedAt: '2024-04-10T00:00:00Z'
    },
  ];

  const reviews: Review[] = [
    { id: 'r1', productId: 'p1', customerId: customer1Id, customerName: 'Alice J.', rating: 5, title: 'Best phone ever!', comment: 'The camera quality is amazing and the battery lasts all day.', isApproved: true, createdAt: '2024-03-25T00:00:00Z' },
    { id: 'r2', productId: 'p1', customerId: customer2Id, customerName: 'Bob S.', rating: 4, title: 'Great but expensive', comment: 'Excellent phone but the price is steep. Still worth it for the features.', isApproved: true, createdAt: '2024-04-02T00:00:00Z' },
    { id: 'r3', productId: 'p3', customerId: customer2Id, customerName: 'Bob S.', rating: 5, title: 'Perfect noise cancellation', comment: 'These headphones are incredible. The ANC is the best I have ever used.', isApproved: true, createdAt: '2024-04-05T00:00:00Z' },
    { id: 'r4', productId: 'p7', customerId: customer1Id, customerName: 'Alice J.', rating: 4, title: 'Beautiful dress', comment: 'Love the pattern and the fabric is so comfortable.', isApproved: true, createdAt: '2024-03-28T00:00:00Z' },
  ];

  const ledger: SellerLedgerEntry[] = [
    { id: 'l1', sellerId: seller1Id, type: 'sale', amount: 1099, description: 'Order SV-2024-001 - iPhone 15 Pro Max', orderId: 'ord1', createdAt: '2024-03-20T00:00:00Z' },
    { id: 'l2', sellerId: seller1Id, type: 'commission', amount: -109.9, description: 'Commission - Order SV-2024-001', orderId: 'ord1', createdAt: '2024-03-20T00:00:00Z' },
    { id: 'l3', sellerId: seller2Id, type: 'sale', amount: 138, description: 'Order SV-2024-001 - Floral Summer Dress x2', orderId: 'ord1', createdAt: '2024-03-20T00:00:00Z' },
    { id: 'l4', sellerId: seller2Id, type: 'commission', amount: -16.56, description: 'Commission - Order SV-2024-001', orderId: 'ord1', createdAt: '2024-03-20T00:00:00Z' },
    { id: 'l5', sellerId: seller1Id, type: 'sale', amount: 349, description: 'Order SV-2024-002 - Sony WH-1000XM5', orderId: 'ord2', createdAt: '2024-04-01T00:00:00Z' },
    { id: 'l6', sellerId: seller1Id, type: 'commission', amount: -34.9, description: 'Commission - Order SV-2024-002', orderId: 'ord2', createdAt: '2024-04-01T00:00:00Z' },
    { id: 'l7', sellerId: seller3Id, type: 'sale', amount: 498, description: 'Order SV-2024-003 - Coffee Table + Bedding', orderId: 'ord3', createdAt: '2024-04-10T00:00:00Z' },
    { id: 'l8', sellerId: seller3Id, type: 'commission', amount: -39.84, description: 'Commission - Order SV-2024-003', orderId: 'ord3', createdAt: '2024-04-10T00:00:00Z' },
  ];

  const payouts: PayoutRequest[] = [
    { id: 'po1', sellerId: seller1Id, amount: 500, method: 'Bank Transfer', accountDetails: '****1234', status: 'paid', transactionRef: 'TXN-001', createdAt: '2024-03-25T00:00:00Z', processedAt: '2024-03-27T00:00:00Z' },
    { id: 'po2', sellerId: seller2Id, amount: 100, method: 'PayPal', accountDetails: 'seller@email.com', status: 'approved', createdAt: '2024-04-05T00:00:00Z' },
  ];

  return {
    users, sellerProfiles, customerProfiles, products, categories, orders, coupons, reviews,
    carts: {}, notifications: [], settings: defaultSettings, ledger, payouts,
    auditLogs: [], returns: [],
  };
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  const data = generateMockData();
  saveData(data);
  return data;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Current user session
const SESSION_KEY = 'shopverse_session';
export function getSession(): { userId: string; role: string } | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
export function setSession(userId: string, role: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, role }));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Store singleton
class Store {
  private data: AppData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = loadData();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    saveData(this.data);
    this.listeners.forEach(l => l());
  }

  getData(): AppData { return this.data; }

  // Auth
  login(email: string, password: string): User | null {
    const user = this.data.users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) { setSession(user.id, user.role); }
    return user || null;
  }

  register(userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): User | null {
    if (this.data.users.find(u => u.email === userData.email)) return null;
    const user: User = { ...userData, id: uuidv4(), createdAt: new Date().toISOString(), isActive: true };
    this.data.users.push(user);
    if (user.role === 'customer') {
      this.data.customerProfiles.push({ userId: user.id, addresses: [], wishlist: [] });
    }
    setSession(user.id, user.role);
    this.notify();
    return user;
  }

  registerSeller(userData: { email: string; password: string; fullName: string; phone: string; storeName: string; storeSlug: string; storeDescription: string; businessAddress: string; country: string; city: string }): { user: User; profile: SellerProfile } | null {
    if (this.data.users.find(u => u.email === userData.email)) return null;
    const user: User = { id: uuidv4(), email: userData.email, password: userData.password, fullName: userData.fullName, phone: userData.phone, role: 'seller', createdAt: new Date().toISOString(), isActive: true };
    const profile: SellerProfile = { userId: user.id, storeName: userData.storeName, storeSlug: userData.storeSlug, storeDescription: userData.storeDescription, businessAddress: userData.businessAddress, country: userData.country, city: userData.city, status: 'pending', commissionRate: this.data.settings.defaultCommissionRate, createdAt: new Date().toISOString() };
    this.data.users.push(user);
    this.data.sellerProfiles.push(profile);
    setSession(user.id, user.role);
    this.notify();
    return { user, profile };
  }

  logout() { clearSession(); }

  getUser(id: string): User | undefined { return this.data.users.find(u => u.id === id); }
  getCurrentUser(): User | null {
    const session = getSession();
    return session ? this.getUser(session.userId) || null : null;
  }

  // Products
  getProducts(): Product[] { return this.data.products; }
  getProduct(id: string): Product | undefined { return this.data.products.find(p => p.id === id); }
  getProductsBySeller(sellerId: string): Product[] { return this.data.products.filter(p => p.sellerId === sellerId); }
  getApprovedProducts(): Product[] { return this.data.products.filter(p => p.status === 'approved'); }
  getFeaturedProducts(): Product[] { return this.data.products.filter(p => p.status === 'approved' && p.isFeatured); }
  searchProducts(query: string, categoryId?: string, sellerId?: string, minPrice?: number, maxPrice?: number, sortBy?: string): Product[] {
    let results = this.data.products.filter(p => p.status === 'approved');
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (categoryId) results = results.filter(p => p.categoryId === categoryId || this.data.categories.find(c => c.id === categoryId && c.parentId === p.categoryId));
    if (sellerId) results = results.filter(p => p.sellerId === sellerId);
    if (minPrice !== undefined) results = results.filter(p => (p.salePrice || p.price) >= minPrice);
    if (maxPrice !== undefined) results = results.filter(p => (p.salePrice || p.price) <= maxPrice);
    if (sortBy === 'price_asc') results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    else if (sortBy === 'price_desc') results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    else if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Product {
    const p: Product = { ...product, id: uuidv4(), createdAt: new Date().toISOString(), rating: 0, reviewCount: 0 };
    this.data.products.push(p);
    this.notify();
    return p;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.notify();
    return this.data.products[idx];
  }

  deleteProduct(id: string) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.notify();
  }

  // Categories
  getCategories(): Category[] { return this.data.categories; }
  getActiveCategories(): Category[] { return this.data.categories.filter(c => c.isActive); }
  getCategory(id: string): Category | undefined { return this.data.categories.find(c => c.id === id); }
  addCategory(cat: Omit<Category, 'id'>): Category {
    const c: Category = { ...cat, id: uuidv4() };
    this.data.categories.push(c);
    this.notify();
    return c;
  }

  // Cart
  getCart(userId: string): CartItem[] { return this.data.carts[userId] || []; }
  addToCart(userId: string, productId: string, quantity: number = 1, variantId?: string) {
    if (!this.data.carts[userId]) this.data.carts[userId] = [];
    const existing = this.data.carts[userId].find(i => i.productId === productId && i.variantId === variantId);
    if (existing) existing.quantity += quantity;
    else this.data.carts[userId].push({ productId, quantity, variantId });
    this.notify();
  }
  updateCartQuantity(userId: string, productId: string, quantity: number, variantId?: string) {
    if (!this.data.carts[userId]) return;
    const item = this.data.carts[userId].find(i => i.productId === productId && i.variantId === variantId);
    if (item) { if (quantity <= 0) this.data.carts[userId] = this.data.carts[userId].filter(i => i !== item); else item.quantity = quantity; }
    this.notify();
  }
  removeFromCart(userId: string, productId: string, variantId?: string) {
    if (!this.data.carts[userId]) return;
    this.data.carts[userId] = this.data.carts[userId].filter(i => !(i.productId === productId && i.variantId === variantId));
    this.notify();
  }
  clearCart(userId: string) { this.data.carts[userId] = []; this.notify(); }

  // Orders
  getOrders(): Order[] { return this.data.orders; }
  getCustomerOrders(customerId: string): Order[] { return this.data.orders.filter(o => o.customerId === customerId); }
  getSellerOrders(sellerId: string): Order[] { return this.data.orders.filter(o => o.items.some(i => i.sellerId === sellerId)); }
  getOrder(id: string): Order | undefined { return this.data.orders.find(o => o.id === id); }

  createOrder(customerId: string, items: CartItem[], shippingAddress: Address, paymentMethod: string, couponCode?: string): Order | null {
    const orderItems: OrderItem[] = [];
    const subtotals: { [key: string]: number } = {};
    let subtotal = 0;

    for (const cartItem of items) {
      const product = this.getProduct(cartItem.productId);
      if (!product || product.stock < cartItem.quantity) return null;
      const seller = this.data.sellerProfiles.find(s => s.userId === product.sellerId);
      const price = product.salePrice || product.price;
      const totalPrice = price * cartItem.quantity;
      const commissionRate = (seller?.commissionRate || this.data.settings.defaultCommissionRate) / 100;
      const commission = totalPrice * commissionRate;
      const sellerName = seller?.storeName || 'Unknown';
      orderItems.push({ id: uuidv4(), productId: product.id, productName: product.name, productImage: product.images[0] || '', quantity: cartItem.quantity, unitPrice: price, totalPrice, sellerId: product.sellerId, sellerName, commission, sellerEarning: totalPrice - commission });
      subtotals[product.sellerId] = (subtotals[product.sellerId] || 0) + totalPrice;
      subtotal += totalPrice;
      // Deduct stock
      const pidx = this.data.products.findIndex(p => p.id === product.id);
      this.data.products[pidx].stock -= cartItem.quantity;
    }

    let discount = 0;
    if (couponCode) {
      const coupon = this.data.coupons.find(c => c.code === couponCode && c.isActive);
      if (coupon && subtotal >= coupon.minOrderAmount) {
        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else discount = coupon.value;
        coupon.usedCount++;
      }
    }

    const shippingCost = subtotal >= this.data.settings.freeShippingThreshold ? 0 : this.data.settings.flatShippingRate;
    const tax = (subtotal - discount) * (this.data.settings.taxRate / 100);
    const total = subtotal - discount + shippingCost + tax;

    // Create suborders
    const sellerIds = [...new Set(orderItems.map(i => i.sellerId))];
    const suborders = sellerIds.map(sellerId => {
      const sellerItems = orderItems.filter(i => i.sellerId === sellerId);
      const seller = this.data.sellerProfiles.find(s => s.userId === sellerId);
      return { id: uuidv4(), sellerId, sellerName: seller?.storeName || '', items: sellerItems, subtotal: sellerItems.reduce((s, i) => s + i.totalPrice, 0), shippingCost: sellerIds.length > 1 ? this.data.settings.flatShippingRate / sellerIds.length : shippingCost, total: 0, status: 'pending' as const, createdAt: new Date().toISOString() };
    });
    suborders.forEach(so => { so.total = so.subtotal + so.shippingCost; });

    const order: Order = { id: uuidv4(), orderNumber: `SV-${new Date().getFullYear()}-${String(this.data.orders.length + 1).padStart(3, '0')}`, customerId, items: orderItems, subtotals, subtotal, shippingCost, tax: Math.round(tax * 100) / 100, discount: Math.round(discount * 100) / 100, total: Math.round(total * 100) / 100, status: 'pending', paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', paymentMethod, shippingAddress, couponCode, suborders, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    this.data.orders.push(order);

    // Add ledger entries
    for (const item of orderItems) {
      this.data.ledger.push({ id: uuidv4(), sellerId: item.sellerId, type: 'sale', amount: item.totalPrice, description: `Order ${order.orderNumber} - ${item.productName}`, orderId: order.id, createdAt: new Date().toISOString() });
      this.data.ledger.push({ id: uuidv4(), sellerId: item.sellerId, type: 'commission', amount: -item.commission, description: `Commission - Order ${order.orderNumber}`, orderId: order.id, createdAt: new Date().toISOString() });
    }

    this.clearCart(customerId);
    this.notify();
    return order;
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order) { order.status = status; order.updatedAt = new Date().toISOString(); this.notify(); }
  }

  // Coupons
  getCoupons(): Coupon[] { return this.data.coupons; }
  validateCoupon(code: string, orderTotal: number): { valid: boolean; discount: number; message: string } {
    const coupon = this.data.coupons.find(c => c.code === code && c.isActive);
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
    if (orderTotal < coupon.minOrderAmount) return { valid: false, discount: 0, message: `Minimum order amount is $${coupon.minOrderAmount}` };
    if (coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    let discount = coupon.type === 'percentage' ? orderTotal * (coupon.value / 100) : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    return { valid: true, discount, message: `Coupon applied! You save $${discount.toFixed(2)}` };
  }

  addCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Coupon {
    const c: Coupon = { ...coupon, id: uuidv4(), usedCount: 0 };
    this.data.coupons.push(c);
    this.notify();
    return c;
  }

  // Reviews
  getReviews(productId: string): Review[] { return this.data.reviews.filter(r => r.productId === productId && r.isApproved); }
  addReview(review: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Review {
    const r: Review = { ...review, id: uuidv4(), createdAt: new Date().toISOString(), isApproved: true };
    this.data.reviews.push(r);
    // Update product rating
    const product = this.getProduct(review.productId);
    if (product) {
      const allReviews = this.data.reviews.filter(rv => rv.productId === review.productId);
      product.rating = Math.round((allReviews.reduce((s, rv) => s + rv.rating, 0) / allReviews.length) * 10) / 10;
      product.reviewCount = allReviews.length;
    }
    this.notify();
    return r;
  }

  // Seller profiles
  getSellerProfiles(): SellerProfile[] { return this.data.sellerProfiles; }
  getSellerProfile(userId: string): SellerProfile | undefined { return this.data.sellerProfiles.find(s => s.userId === userId); }
  updateSellerProfile(userId: string, updates: Partial<SellerProfile>) {
    const idx = this.data.sellerProfiles.findIndex(s => s.userId === userId);
    if (idx !== -1) { this.data.sellerProfiles[idx] = { ...this.data.sellerProfiles[idx], ...updates }; this.notify(); }
  }
  approveSeller(userId: string) { this.updateSellerProfile(userId, { status: 'approved' }); }
  rejectSeller(userId: string) { this.updateSellerProfile(userId, { status: 'rejected' }); }

  // Customer profiles
  getCustomerProfile(userId: string): CustomerProfile | undefined { return this.data.customerProfiles.find(c => c.userId === userId); }
  addAddress(userId: string, address: Omit<Address, 'id'>): Address {
    const profile = this.getCustomerProfile(userId);
    if (!profile) return {} as Address;
    const addr: Address = { ...address, id: uuidv4() };
    if (addr.isDefault) profile.addresses.forEach(a => a.isDefault = false);
    profile.addresses.push(addr);
    this.notify();
    return addr;
  }
  toggleWishlist(userId: string, productId: string) {
    const profile = this.getCustomerProfile(userId);
    if (!profile) return;
    const idx = profile.wishlist.indexOf(productId);
    if (idx >= 0) profile.wishlist.splice(idx, 1);
    else profile.wishlist.push(productId);
    this.notify();
  }

  // Finance
  getSellerLedger(sellerId: string): SellerLedgerEntry[] { return this.data.ledger.filter(l => l.sellerId === sellerId); }
  getSellerBalance(sellerId: string): number { return this.data.ledger.filter(l => l.sellerId === sellerId).reduce((s, l) => s + l.amount, 0); }
  getSellerEarnings(sellerId: string): { grossSales: number; totalCommission: number; netEarnings: number } {
    const entries = this.data.ledger.filter(l => l.sellerId === sellerId);
    const grossSales = entries.filter(l => l.type === 'sale').reduce((s, l) => s + l.amount, 0);
    const totalCommission = Math.abs(entries.filter(l => l.type === 'commission').reduce((s, l) => s + l.amount, 0));
    return { grossSales, totalCommission, netEarnings: grossSales - totalCommission };
  }

  // Payouts
  getPayouts(): PayoutRequest[] { return this.data.payouts; }
  getSellerPayouts(sellerId: string): PayoutRequest[] { return this.data.payouts.filter(p => p.sellerId === sellerId); }
  requestPayout(sellerId: string, amount: number, method: string, accountDetails: string): PayoutRequest | null {
    const balance = this.getSellerBalance(sellerId);
    if (amount > balance || amount < this.data.settings.minPayoutAmount) return null;
    const payout: PayoutRequest = { id: uuidv4(), sellerId, amount, method, accountDetails, status: 'requested', createdAt: new Date().toISOString() };
    this.data.payouts.push(payout);
    this.data.ledger.push({ id: uuidv4(), sellerId, type: 'payout', amount: -amount, description: `Payout request - ${method}`, createdAt: new Date().toISOString() });
    this.notify();
    return payout;
  }
  updatePayoutStatus(payoutId: string, status: string, adminNotes?: string, transactionRef?: string) {
    const payout = this.data.payouts.find(p => p.id === payoutId);
    if (payout) { payout.status = status as PayoutStatus; if (adminNotes) payout.adminNotes = adminNotes; if (transactionRef) payout.transactionRef = transactionRef; if (status === 'paid') payout.processedAt = new Date().toISOString(); this.notify(); }
  }

  // Settings
  getSettings(): PlatformSettings { return this.data.settings; }
  updateSettings(updates: Partial<PlatformSettings>) { this.data.settings = { ...this.data.settings, ...updates }; this.notify(); }

  // Users management
  getAllUsers(): User[] { return this.data.users; }
  getUsersByRole(role: string): User[] { return this.data.users.filter(u => u.role === role); }
  toggleUserStatus(userId: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) { user.isActive = !user.isActive; this.notify(); }
  }

  // Notifications
  getNotifications(userId: string): Notification[] { return this.data.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
  addNotification(userId: string, title: string, message: string, type: Notification['type']) {
    this.data.notifications.push({ id: uuidv4(), userId, title, message, type, isRead: false, createdAt: new Date().toISOString() });
    this.notify();
  }
  markNotificationRead(id: string) {
    const n = this.data.notifications.find(n => n.id === id);
    if (n) { n.isRead = true; this.notify(); }
  }

  // Returns
  getReturns(): ReturnRequest[] { return this.data.returns; }
  requestReturn(orderId: string, orderItemId: string, customerId: string, reason: string, description: string, quantity: number, refundAmount: number): ReturnRequest {
    const ret: ReturnRequest = { id: uuidv4(), orderId, orderItemId, customerId, reason, description, quantity, status: 'requested', refundAmount, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.data.returns.push(ret);
    this.notify();
    return ret;
  }

  // Audit logs
  addAuditLog(userId: string, action: string, resource: string, resourceId: string, details: string) {
    this.data.auditLogs.push({ id: uuidv4(), userId, action, resource, resourceId, details, createdAt: new Date().toISOString() });
    this.notify();
  }
  getAuditLogs(): AuditLog[] { return this.data.auditLogs; }

  // Admin stats
  getAdminStats() {
    const orders = this.data.orders;
    const products = this.data.products;
    const users = this.data.users;
    const sellers = this.data.sellerProfiles;
    const totalSales = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
    const totalCommission = orders.flatMap(o => o.items).reduce((s, i) => s + i.commission, 0);
    const pendingPayouts = this.data.payouts.filter(p => p.status === 'requested' || p.status === 'approved').reduce((s, p) => s + p.amount, 0);
    return {
      totalSales, totalOrders: orders.length, totalCustomers: users.filter(u => u.role === 'customer').length,
      totalSellers: sellers.filter(s => s.status === 'approved').length, pendingSellerApprovals: sellers.filter(s => s.status === 'pending').length,
      activeProducts: products.filter(p => p.status === 'approved').length, pendingProducts: products.filter(p => p.status === 'pending_approval').length,
      totalCommission, pendingPayouts, paidOrders: orders.filter(o => o.paymentStatus === 'paid').length,
    };
  }
}

export const store = new Store();
