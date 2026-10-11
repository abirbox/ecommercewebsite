import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Heart, Star, Package, Truck, CreditCard, ChevronRight, Filter, Plus, Minus, Trash2, Eye, Edit, Check, XCircle, Store, BarChart3, Settings, Users, ShoppingBag, LogOut, Bell, Home, Tag, DollarSign, TrendingUp, AlertCircle, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { store, getSession, setSession, clearSession } from './store';
import type { User as UserType, Product, Category, Order, Address, CartItem, Review, PlatformSettings } from './types';

// Context
interface AuthContextType { user: UserType | null; login: (email: string, password: string) => boolean; logout: () => void; }
const AuthContext = createContext<AuthContextType>({ user: null, login: () => false, logout: () => {} });
const useAuth = () => useContext(AuthContext);

// Toast
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
const ToastContext = createContext<{ addToast: (msg: string, type: Toast['type']) => void }>({ addToast: () => {} });
const useToast = () => useContext(ToastContext);

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-slide-in ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          <span className="text-sm">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-2"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(store.getCurrentUser());
  const [, setTick] = useState(0);

  useEffect(() => store.subscribe(() => { setUser(store.getCurrentUser()); setTick(t => t + 1); }), []);

  const login = useCallback((email: string, password: string) => {
    const u = store.login(email, password);
    if (u) { setUser(u); return true; }
    return false;
  }, []);

  const logout = useCallback(() => { store.logout(); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// Protected Route
function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

// ============ STOREFRONT COMPONENTS ============

function Header() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const cart = store.getCart(user.id);
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">ShopVerse</Link>
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </form>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">Products</Link>
            <Link to="/categories" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">Categories</Link>
            {user ? (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                </Link>
                <Link to={user.role === 'admin' || user.role === 'super_admin' ? '/admin/dashboard' : user.role === 'seller' ? '/seller/dashboard' : '/account'} className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 text-sm font-medium">
                  <User size={18} /> {user.fullName.split(' ')[0]}
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Sign Up</Link>
              </>
            )}
          </nav>
          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <form onSubmit={handleSearch} className="flex">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-4 pr-4 py-2 border rounded-lg" />
            </form>
            <Link to="/products" className="block py-2 text-gray-600" onClick={() => setMobileMenu(false)}>Products</Link>
            <Link to="/categories" className="block py-2 text-gray-600" onClick={() => setMobileMenu(false)}>Categories</Link>
            {user ? (
              <>
                <Link to="/cart" className="block py-2 text-gray-600" onClick={() => setMobileMenu(false)}>Cart ({cartCount})</Link>
                <Link to="/account" className="block py-2 text-gray-600" onClick={() => setMobileMenu(false)}>My Account</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-600" onClick={() => setMobileMenu(false)}>Login</Link>
                <Link to="/register" className="block py-2 text-indigo-600 font-medium" onClick={() => setMobileMenu(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">ShopVerse</h3>
            <p className="text-sm">Your trusted multi-vendor marketplace. Shop from thousands of sellers worldwide.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link to="/seller/register" className="hover:text-white">Become a Seller</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white">Return Policy</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Mail size={14} /> support@shopverse.com</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> San Francisco, CA</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 ShopVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!user) { addToast('Please login to add items to cart', 'error'); return; }
    store.addToCart(user.id, product.id, 1);
    addToast('Added to cart!', 'success');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          {discount > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">-{discount}%</span>}
          {product.isFeatured && <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">Featured</span>}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
            {product.salePrice && <span className="text-sm text-gray-400 line-through ml-2">${product.price.toFixed(2)}</span>}
          </div>
          <button onClick={handleAddToCart} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ PAGES ============

function HomePage() {
  const products = store.getApprovedProducts();
  const categories = store.getActiveCategories().filter(c => !c.parentId);
  const featured = products.filter(p => p.isFeatured);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  const discounted = products.filter(p => p.salePrice).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Products</h1>
            <p className="text-lg text-indigo-100 mb-8">Shop from thousands of trusted sellers. Find everything you need at the best prices.</p>
            <Link to="/products" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-indigo-50 hover:shadow-sm transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Tag size={20} className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-indigo-600 text-sm font-medium flex items-center gap-1">View All <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Deals */}
      {discounted.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
            <h2 className="text-2xl font-bold">🔥 Hot Deals</h2>
            <p className="text-red-100">Limited time offers on top products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {discounted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-indigo-600 text-sm font-medium flex items-center gap-1">View All <ChevronRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-indigo-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h2>
          <p className="text-gray-600 mb-4">Subscribe to our newsletter for exclusive deals and new arrivals.</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const categories = store.getActiveCategories();
  const sellers = store.getSellerProfiles().filter(s => s.status === 'approved');

  const products = store.searchProducts(search, category || undefined, undefined, priceRange[0] || undefined, priceRange[1] < 2000 ? priceRange[1] : undefined, sort || undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {search ? `Results for "${search}"` : 'All Products'}
          <span className="text-gray-400 text-lg font-normal ml-2">({products.length})</span>
        </h1>
        <button className="md:hidden flex items-center gap-2 text-gray-600" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} /> Filters
        </button>
      </div>
      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} md:block md:static md:w-64 shrink-0`}>
          {showFilters && <button className="md:hidden mb-4 text-gray-600" onClick={() => setShowFilters(false)}>Close</button>}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(c => (
                  <Link key={c.id} to={`/products?category=${c.id}`} className={`block text-sm ${category === c.id ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600'}`}>{c.name}</Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={priceRange[0] || ''} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full px-2 py-1 border rounded text-sm" />
                <input type="number" placeholder="Max" value={priceRange[1] >= 2000 ? '' : priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 2000])} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sellers</h3>
              <div className="space-y-2">
                {sellers.map(s => (
                  <Link key={s.userId} to={`/products?seller=${s.userId}`} className="block text-sm text-gray-600 hover:text-indigo-600">{s.storeName}</Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
              <select value={sort} onChange={e => { const params = new URLSearchParams(searchParams); if (e.target.value) params.set('sort', e.target.value); else params.delete('sort'); window.history.pushState({}, '', `/products?${params}`); }} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Default</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const products = store.getApprovedProducts();
  const product = products.find(p => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const reviews = product ? store.getReviews(product.id) : [];
  const relatedProducts = product ? products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4) : [];
  const category = product ? store.getCategory(product.categoryId) : null;
  const seller = product ? store.getSellerProfile(product.sellerId) : null;

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h1 className="text-2xl font-bold">Product not found</h1><Link to="/products" className="text-indigo-600 mt-4 inline-block">Back to products</Link></div>;

  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!user) { addToast('Please login to add items to cart', 'error'); return; }
    store.addToCart(user.id, product.id, quantity);
    addToast('Added to cart!', 'success');
  };

  const handleBuyNow = () => {
    if (!user) { addToast('Please login to purchase', 'error'); return; }
    store.addToCart(user.id, product.id, quantity);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!user) { addToast('Please login', 'error'); return; }
    store.toggleWishlist(user.id, product.id);
    addToast('Wishlist updated!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight size={14} />
        {category && <Link to={`/products?category=${category.id}`} className="hover:text-indigo-600">{category.name}</Link>}
        <ChevronRight size={14} />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-indigo-600' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {product.brand && <p className="text-gray-500 mb-2">Brand: {product.brand}</p>}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
            </div>
            <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</span>
            {product.salePrice && <><span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span><span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full">-{discount}%</span></>}
          </div>
          <p className="text-gray-600 mb-6">{product.shortDescription}</p>

          {/* Stock */}
          <div className="mb-4">
            {product.stock > 0 ? (
              <span className="text-green-600 text-sm font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600 text-sm font-medium">✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2"><Minus size={16} /></button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2"><Plus size={16} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Buy Now
            </button>
            <button onClick={handleWishlist} className="p-3 border rounded-lg hover:bg-gray-50">
              <Heart size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Seller info */}
          {seller && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Sold by</p>
              <Link to={`/products?seller=${seller.userId}`} className="text-indigo-600 font-medium">{seller.storeName}</Link>
            </div>
          )}

          {/* Specs */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key}><dt className="text-sm text-gray-500">{key}</dt><dd className="text-sm font-medium">{val}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}</div>
                  <span className="font-medium text-sm">{r.title}</span>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">By {r.customerName} • {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesPage() {
  const categories = store.getActiveCategories();
  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">All Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parentCategories.map(cat => {
          const children = categories.filter(c => c.parentId === cat.id);
          return (
            <div key={cat.id} className="bg-white rounded-xl border p-6">
              <Link to={`/products?category=${cat.id}`} className="text-lg font-semibold text-indigo-600 hover:text-indigo-700">{cat.name}</Link>
              <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              {children.length > 0 && (
                <div className="mt-4 space-y-1">
                  {children.map(child => (
                    <Link key={child.id} to={`/products?category=${child.id}`} className="block text-sm text-gray-600 hover:text-indigo-600">→ {child.name}</Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);

  if (!user) return <Navigate to="/login" />;
  const cartItems = store.getCart(user.id);
  const settings = store.getSettings();

  const cartDetails = cartItems.map(item => {
    const product = store.getProduct(item.productId);
    return { ...item, product };
  }).filter(i => i.product);

  const subtotal = cartDetails.reduce((s, i) => s + ((i.product!.salePrice || i.product!.price) * i.quantity), 0);
  const discount = couponResult?.valid ? couponResult.discount : 0;
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
  const tax = (subtotal - discount) * (settings.taxRate / 100);
  const total = subtotal - discount + shipping + tax;

  const applyCoupon = () => {
    const result = store.validateCoupon(couponCode, subtotal);
    setCouponResult(result);
    if (!result.valid) addToast(result.message, 'error');
    else addToast(result.message, 'success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link to="/products" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartDetails.map(item => (
            <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-xl border p-4 flex gap-4">
              <img src={item.product!.images[0]} alt={item.product!.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <Link to={`/product/${item.product!.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">{item.product!.name}</Link>
                <p className="text-sm text-gray-500">{item.product!.sellerId && store.getSellerProfile(item.product!.sellerId)?.storeName}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => store.updateCartQuantity(user.id, item.productId, item.quantity - 1, item.variantId)} className="px-2 py-1"><Minus size={14} /></button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => store.updateCartQuantity(user.id, item.productId, item.quantity + 1, item.variantId)} className="px-2 py-1"><Plus size={14} /></button>
                  </div>
                  <span className="font-bold">${((item.product!.salePrice || item.product!.price) * item.quantity).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => { store.removeFromCart(user.id, item.productId, item.variantId); addToast('Removed from cart', 'info'); }} className="text-red-500 hover:text-red-700 self-start">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border p-6 h-fit sticky top-20">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Tax ({settings.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          {/* Coupon */}
          <div className="mt-4">
            <div className="flex gap-2">
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={applyCoupon} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">Apply</button>
            </div>
            {couponResult && <p className={`text-xs mt-1 ${couponResult.valid ? 'text-green-600' : 'text-red-600'}`}>{couponResult.message}</p>}
          </div>

          <button onClick={() => navigate('/checkout')} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  if (!user) return <Navigate to="/login" />;
  const cartItems = store.getCart(user.id);
  const profile = store.getCustomerProfile(user.id);
  const settings = store.getSettings();

  const cartDetails = cartItems.map(item => {
    const product = store.getProduct(item.productId);
    return { ...item, product };
  }).filter(i => i.product);

  const subtotal = cartDetails.reduce((s, i) => s + ((i.product!.salePrice || i.product!.price) * i.quantity), 0);
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
  const tax = subtotal * (settings.taxRate / 100);
  const total = subtotal + shipping + tax;

  const address = profile?.addresses.find(a => a.id === selectedAddress) || profile?.addresses[0];

  const placeOrder = () => {
    if (!address) { addToast('Please select a shipping address', 'error'); return; }
    const order = store.createOrder(user.id, cartItems, address, paymentMethod);
    if (order) {
      addToast('Order placed successfully!', 'success');
      navigate(`/account/orders/${order.id}`);
    } else {
      addToast('Failed to place order. Some items may be out of stock.', 'error');
    }
  };

  if (cartItems.length === 0) return <Navigate to="/cart" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center mb-8">
        {['Address', 'Shipping', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
            <span className={`ml-2 text-sm ${step === i + 1 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{s}</span>
            {i < 3 && <div className={`w-12 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {step === 1 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
              {profile?.addresses && profile.addresses.length > 0 ? (
                <div className="space-y-3">
                  {profile.addresses.map(addr => (
                    <label key={addr.id} className={`block p-4 border rounded-lg cursor-pointer ${selectedAddress === addr.id ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mr-2" />
                      <span className="font-medium">{addr.label}</span>
                      <p className="text-sm text-gray-600 mt-1">{addr.fullName}, {addr.addressLine1}, {addr.city}, {addr.state} {addr.zipCode}</p>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No addresses saved. <Link to="/account/addresses" className="text-indigo-600">Add one</Link></p>
              )}
              <button onClick={() => setStep(2)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Method</h2>
              <div className="space-y-3">
                <label className="block p-4 border rounded-lg cursor-pointer border-indigo-600 bg-indigo-50">
                  <input type="radio" name="shipping" defaultChecked className="mr-2" />
                  <span className="font-medium">Standard Shipping</span>
                  <span className="float-right text-sm">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  <p className="text-sm text-gray-500 mt-1">5-7 business days</p>
                </label>
                <label className="block p-4 border rounded-lg cursor-pointer">
                  <input type="radio" name="shipping" className="mr-2" />
                  <span className="font-medium">Express Shipping</span>
                  <span className="float-right text-sm">$19.99</span>
                  <p className="text-sm text-gray-500 mt-1">2-3 business days</p>
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg font-medium">Back</button>
                <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`block p-4 border rounded-lg cursor-pointer ${paymentMethod === 'credit_card' ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="mr-2" />
                  <CreditCard size={16} className="inline mr-2" />
                  <span className="font-medium">Credit/Debit Card</span>
                </label>
                <label className={`block p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-2" />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
              </div>
              {paymentMethod === 'credit_card' && (
                <div className="mt-4 space-y-3">
                  <input type="text" placeholder="Card Number" className="w-full px-4 py-2 border rounded-lg" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" className="px-4 py-2 border rounded-lg" />
                    <input type="text" placeholder="CVV" className="px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg font-medium">Back</button>
                <button onClick={() => setStep(4)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4">Review Order</h2>
              <div className="space-y-3 mb-4">
                {cartDetails.map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img src={item.product!.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product!.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">${((item.product!.salePrice || item.product!.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {address && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium">Shipping to: {address.fullName}</p>
                  <p className="text-xs text-gray-500">{address.addressLine1}, {address.city}, {address.state} {address.zipCode}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-6 py-2 border rounded-lg font-medium">Back</button>
                <button onClick={placeOrder} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700">Place Order - ${total.toFixed(2)}</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border p-6 h-fit">
          <h3 className="font-bold mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ AUTH PAGES ============

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      const user = store.getCurrentUser();
      addToast('Welcome back!', 'success');
      if (user?.role === 'admin' || user?.role === 'super_admin') navigate('/admin/dashboard');
      else if (user?.role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    } else {
      addToast('Invalid email or password', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">Sign In</button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Don't have an account? <Link to="/register" className="text-indigo-600 font-medium">Sign up</Link></p>
            <p className="mt-2">
              <Link to="/seller/login" className="text-indigo-600">Seller Login</Link> • <Link to="/admin/login" className="text-indigo-600">Admin Login</Link>
            </p>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Demo Accounts:</p>
            <p>Customer: customer@test.com / Customer@123</p>
            <p>Seller: techstore@shop.com / Seller@123</p>
            <p>Admin: admin@shopverse.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { addToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 8) { addToast('Password must be at least 8 characters', 'error'); return; }
    const user = store.register({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: 'customer' });
    if (user) { addToast('Account created successfully!', 'success'); navigate('/'); }
    else addToast('Email already registered', 'error');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" required className="rounded" /> I agree to the Terms and Privacy Policy
            </label>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">Create Account</button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

function SellerLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      const user = store.getCurrentUser();
      if (user?.role === 'seller') { navigate('/seller/dashboard'); addToast('Welcome to your store!', 'success'); }
      else { store.logout(); addToast('This is the seller login portal', 'error'); }
    } else addToast('Invalid credentials', 'error');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Store className="mx-auto text-indigo-600 mb-2" size={40} />
            <h1 className="text-2xl font-bold">Seller Login</h1>
            <p className="text-gray-500 text-sm">Access your seller dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Seller email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">Sign In</button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">New seller? <Link to="/seller/register" className="text-indigo-600 font-medium">Register your store</Link></p>
        </div>
      </div>
    </div>
  );
}

function SellerRegisterPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', storeName: '', storeSlug: '', storeDescription: '', businessAddress: '', country: '', city: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = store.registerSeller(form);
    if (result) { addToast('Store registered! Awaiting admin approval.', 'success'); navigate('/seller/dashboard'); }
    else addToast('Email already registered', 'error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Store className="mx-auto text-indigo-600 mb-2" size={40} />
            <h1 className="text-2xl font-bold">Open Your Store</h1>
            <p className="text-gray-500 text-sm">Join thousands of sellers on ShopVerse</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required placeholder="Owner Name" className="px-4 py-2 border rounded-lg" />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="Email" className="px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="Phone" className="px-4 py-2 border rounded-lg" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Password" className="px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} required placeholder="Store Name" className="px-4 py-2 border rounded-lg" />
              <input type="text" value={form.storeSlug} onChange={e => setForm({ ...form, storeSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required placeholder="Store Slug (e.g., my-store)" className="px-4 py-2 border rounded-lg" />
            </div>
            <textarea value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })} required placeholder="Store Description" rows={3} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" value={form.businessAddress} onChange={e => setForm({ ...form, businessAddress: e.target.value })} required placeholder="Business Address" className="w-full px-4 py-2 border rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required placeholder="Country" className="px-4 py-2 border rounded-lg" />
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required placeholder="City" className="px-4 py-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">Register Store</button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Already a seller? <Link to="/seller/login" className="text-indigo-600 font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      const user = store.getCurrentUser();
      if (user?.role === 'admin' || user?.role === 'super_admin') { navigate('/admin/dashboard'); addToast('Welcome, Administrator!', 'success'); }
      else { store.logout(); addToast('Unauthorized access', 'error'); }
    } else addToast('Invalid credentials', 'error');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Restricted access</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value })} required placeholder="Admin email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500" />
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800">Access Panel</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============ CUSTOMER DASHBOARD ============

function CustomerLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== 'customer') return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <div className="text-center mb-4 pb-4 border-b">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User size={20} className="text-indigo-600" />
              </div>
              <p className="font-medium text-sm">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <nav className="space-y-1">
              {[
                { to: '/account', label: 'Overview', icon: Home },
                { to: '/account/orders', label: 'My Orders', icon: Package },
                { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
                { to: '/account/addresses', label: 'Addresses', icon: MapPin },
                { to: '/account/reviews', label: 'Reviews', icon: Star },
              ].map(item => (
                <Link key={item.to} to={item.to} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
                  <item.icon size={16} /> {item.label}
                </Link>
              ))}
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full">
                <LogOut size={16} /> Logout
              </button>
            </nav>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function CustomerDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const orders = store.getCustomerOrders(user.id);
  const profile = store.getCustomerProfile(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Wishlist Items</p>
          <p className="text-2xl font-bold">{profile?.wishlist.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Saved Addresses</p>
          <p className="text-2xl font-bold">{profile?.addresses.length || 0}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <Link key={order.id} to={`/account/orders/${order.id}`} className="block bg-white rounded-xl border p-4 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.total.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No orders yet. <Link to="/products" className="text-indigo-600">Start shopping!</Link></p>
      )}
    </div>
  );
}

function CustomerOrders() {
  const { user } = useAuth();
  if (!user) return null;
  const orders = store.getCustomerOrders(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? <p className="text-gray-500">No orders yet.</p> : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/account/orders/${order.id}`} className="block bg-white rounded-xl border p-4 hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{order.orderNumber}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {order.items.slice(0, 3).map(item => (
                  <img key={item.id} src={item.productImage} alt="" className="w-10 h-10 object-cover rounded" />
                ))}
                {order.items.length > 3 && <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="font-bold">${order.total.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerOrderDetail() {
  const { orderId } = useParams();
  const order = store.getOrder(orderId || '');
  if (!order) return <div className="text-center py-8"><p className="text-gray-500">Order not found</p></div>;

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-gray-500 mb-6">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i <= currentStep ? <Check size={16} /> : i + 1}
              </div>
              <span className="text-xs mt-1 capitalize text-center">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <img src={item.productImage} alt="" className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">Seller: {item.sellerName} • Qty: {item.quantity}</p>
              </div>
              <span className="font-bold">${item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>${order.shippingCost.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
        {order.trackingNumber && <p className="mt-4 text-sm text-gray-500">Tracking: <span className="font-medium">{order.trackingNumber}</span></p>}
      </div>
    </div>
  );
}

function CustomerWishlist() {
  const { user } = useAuth();
  const { addToast } = useToast();
  if (!user) return null;
  const profile = store.getCustomerProfile(user.id);
  const wishlistProducts = (profile?.wishlist || []).map(id => store.getProduct(id)).filter(Boolean) as Product[];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {wishlistProducts.length === 0 ? <p className="text-gray-500">Your wishlist is empty.</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistProducts.map(p => (
            <div key={p.id} className="bg-white rounded-xl border p-4">
              <Link to={`/product/${p.slug}`}><img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-lg mb-2" /></Link>
              <Link to={`/product/${p.slug}`}><h3 className="font-medium text-sm line-clamp-2">{p.name}</h3></Link>
              <p className="font-bold mt-1">${(p.salePrice || p.price).toFixed(2)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { store.addToCart(user.id, p.id, 1); addToast('Added to cart!', 'success'); }} className="flex-1 bg-indigo-600 text-white py-1.5 rounded text-xs font-medium">Add to Cart</button>
                <button onClick={() => { store.toggleWishlist(user.id, p.id); }} className="p-1.5 border rounded text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerAddresses() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', fullName: '', phone: '', addressLine1: '', city: '', state: '', zipCode: '', country: '' });
  if (!user) return null;
  const profile = store.getCustomerProfile(user.id);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    store.addAddress(user.id, { ...form, isDefault: (profile?.addresses.length || 0) === 0 });
    addToast('Address added!', 'success');
    setShowForm(false);
    setForm({ label: '', fullName: '', phone: '', addressLine1: '', city: '', state: '', zipCode: '', country: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16} /> Add Address</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required placeholder="Label (e.g., Home)" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required placeholder="Full Name" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} required placeholder="Address" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required placeholder="City" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required placeholder="State" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} required placeholder="ZIP" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Save Address</button>
        </form>
      )}
      <div className="space-y-3">
        {(profile?.addresses || []).map(addr => (
          <div key={addr.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{addr.label}</span>
                {addr.isDefault && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Default</span>}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{addr.fullName} • {addr.phone}</p>
            <p className="text-sm text-gray-500">{addr.addressLine1}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SELLER DASHBOARD ============

function SellerLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== 'seller') return <Navigate to="/seller/login" />;
  const profile = store.getSellerProfile(user.id);

  if (profile?.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2">Store Pending Approval</h1>
        <p className="text-gray-500">Your store "{profile.storeName}" is awaiting admin approval. You'll be notified once approved.</p>
        <button onClick={() => { logout(); navigate('/'); }} className="mt-6 text-indigo-600 font-medium">Logout</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r shrink-0 hidden md:block">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">{profile?.storeName}</h2>
          <p className="text-xs text-gray-500">Seller Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { to: '/seller/dashboard', label: 'Overview', icon: BarChart3 },
            { to: '/seller/products', label: 'Products', icon: Package },
            { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
            { to: '/seller/finance', label: 'Finance', icon: DollarSign },
            { to: '/seller/settings', label: 'Store Settings', icon: Settings },
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

function SellerDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const profile = store.getSellerProfile(user.id);
  const products = store.getProductsBySeller(user.id);
  const orders = store.getSellerOrders(user.id);
  const earnings = store.getSellerEarnings(user.id);
  const balance = store.getSellerBalance(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-green-600">${earnings.grossSales.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Net Earnings</p>
          <p className="text-2xl font-bold">${earnings.netEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold text-indigo-600">${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Recent Orders</h2>
          {orders.length > 0 ? orders.slice(0, 5).map(o => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{o.orderNumber}</p>
                <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
            </div>
          )) : <p className="text-gray-500 text-sm">No orders yet</p>}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Products ({products.length})</h2>
          {products.length > 0 ? products.slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                <p className="text-xs text-gray-500">Stock: {p.stock} • ${(p.salePrice || p.price).toFixed(2)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
            </div>
          )) : <p className="text-gray-500 text-sm">No products yet</p>}
        </div>
      </div>
    </div>
  );
}

function SellerProducts() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', shortDescription: '', categoryId: '', brand: '', price: '', salePrice: '', stock: '', sku: '', status: 'draft' as const });
  if (!user) return null;
  const products = store.getProductsBySeller(user.id);
  const categories = store.getActiveCategories();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    store.addProduct({
      sellerId: user.id, name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description, shortDescription: form.shortDescription,
      categoryId: form.categoryId, brand: form.brand, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      price: Number(form.price), salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: Number(form.stock), sku: form.sku, status: form.status as any, isFeatured: false,
    });
    addToast('Product added!', 'success');
    setShowForm(false);
    setForm({ name: '', description: '', shortDescription: '', categoryId: '', brand: '', price: '', salePrice: '', stock: '', sku: '', status: 'draft' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16} /> Add Product</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Product Name" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required placeholder="SKU" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="Short Description" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Full Description" className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
          <div className="grid grid-cols-4 gap-4">
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="Price" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} placeholder="Sale Price" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required placeholder="Stock" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="px-3 py-2 border rounded-lg text-sm">
              <option value="draft">Draft</option>
              <option value="pending_approval">Submit for Approval</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Save Product</button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3">${(p.salePrice || p.price).toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                <td className="p-3">
                  <button onClick={() => { store.updateProduct(p.id, { status: p.status === 'approved' ? 'suspended' : 'approved' }); addToast('Product updated', 'success'); }} className="text-indigo-600 hover:text-indigo-700 mr-2"><Edit size={14} /></button>
                  <button onClick={() => { store.deleteProduct(p.id); addToast('Product deleted', 'info'); }} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellerOrders() {
  const { user } = useAuth();
  const { addToast } = useToast();
  if (!user) return null;
  const orders = store.getSellerOrders(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const sellerItems = order.items.filter(i => i.sellerId === user.id);
          const suborder = order.suborders.find(so => so.sellerId === user.id);
          return (
            <div key={order.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • Customer: {order.shippingAddress.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                  {order.status === 'pending' && (
                    <button onClick={() => { store.updateOrderStatus(order.id, 'confirmed'); addToast('Order confirmed', 'success'); }} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Accept</button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => { store.updateOrderStatus(order.id, 'shipped'); addToast('Marked as shipped', 'success'); }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Mark Shipped</button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {sellerItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-1">
                    <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-medium">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Shipping: {order.shippingAddress.addressLine1}, {order.shippingAddress.city}</span>
                <span className="font-bold">Your Earning: ${sellerItems.reduce((s, i) => s + i.sellerEarning, 0).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SellerFinance() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  if (!user) return null;
  const earnings = store.getSellerEarnings(user.id);
  const balance = store.getSellerBalance(user.id);
  const ledger = store.getSellerLedger(user.id);
  const payouts = store.getSellerPayouts(user.id);
  const settings = store.getSettings();

  const handlePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const result = store.requestPayout(user.id, Number(payoutAmount), payoutMethod, '****1234');
    if (result) { addToast('Payout requested!', 'success'); setShowPayout(false); setPayoutAmount(''); }
    else addToast(`Minimum payout is $${settings.minPayoutAmount}`, 'error');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Finance</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Gross Sales</p>
          <p className="text-2xl font-bold">${earnings.grossSales.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Commission Paid</p>
          <p className="text-2xl font-bold text-red-600">-${earnings.totalCommission.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold text-green-600">${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Request Payout</h2>
        <button onClick={() => setShowPayout(!showPayout)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Request Payout</button>
      </div>

      {showPayout && (
        <form onSubmit={handlePayout} className="bg-white rounded-xl border p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} required placeholder={`Amount (min $${settings.minPayoutAmount})`} className="px-3 py-2 border rounded-lg text-sm" />
            <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option>Bank Transfer</option>
              <option>PayPal</option>
              <option>Wire Transfer</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Submit Request</button>
        </form>
      )}

      {/* Payout History */}
      {payouts.length > 0 && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-bold mb-3">Payout History</h3>
          {payouts.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">${p.amount.toFixed(2)} via {p.method}</p>
                <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ledger */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-bold">Transaction Ledger</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(entry => (
              <tr key={entry.id} className="border-b">
                <td className="p-3">{new Date(entry.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${entry.type === 'sale' ? 'bg-green-100 text-green-700' : entry.type === 'commission' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{entry.type}</span></td>
                <td className="p-3">{entry.description}</td>
                <td className={`p-3 text-right font-medium ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellerSettings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ storeName: '', storeDescription: '' });
  if (!user) return null;
  const profile = store.getSellerProfile(user.id);

  useEffect(() => { if (profile) setForm({ storeName: profile.storeName, storeDescription: profile.storeDescription }); }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSellerProfile(user.id, { storeName: form.storeName, storeDescription: form.storeDescription });
    addToast('Store settings updated!', 'success');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl border p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input type="text" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
          <textarea value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })} rows={4} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Store Slug: <span className="font-medium">{profile?.storeSlug}</span></p>
          <p className="text-sm text-gray-500">Commission Rate: <span className="font-medium">{profile?.commissionRate}%</span></p>
          <p className="text-sm text-gray-500">Status: <span className={`font-medium ${profile?.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>{profile?.status}</span></p>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Save Changes</button>
      </form>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============

function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return <Navigate to="/admin/login" />;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white shrink-0 hidden md:block">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Admin Panel</h2>
          <p className="text-xs text-gray-400">ShopVerse Management</p>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { to: '/admin/dashboard', label: 'Overview', icon: BarChart3 },
            { to: '/admin/users', label: 'Users', icon: Users },
            { to: '/admin/sellers', label: 'Sellers', icon: Store },
            { to: '/admin/products', label: 'Products', icon: Package },
            { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
            { to: '/admin/coupons', label: 'Coupons', icon: Tag },
            { to: '/admin/payouts', label: 'Payouts', icon: DollarSign },
            { to: '/admin/settings', label: 'Settings', icon: Settings },
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full mt-4">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

function AdminDashboard() {
  const stats = store.getAdminStats();
  const orders = store.getOrders();
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-green-500" /><span className="text-sm text-gray-500">Total Sales</span></div>
          <p className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><ShoppingBag size={16} className="text-blue-500" /><span className="text-sm text-gray-500">Total Orders</span></div>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={16} className="text-purple-500" /><span className="text-sm text-gray-500">Customers</span></div>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Store size={16} className="text-amber-500" /><span className="text-sm text-gray-500">Sellers</span></div>
          <p className="text-2xl font-bold">{stats.totalSellers}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-indigo-500" /><span className="text-sm text-gray-500">Commission Revenue</span></div>
          <p className="text-2xl font-bold">${stats.totalCommission.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Package size={16} className="text-green-500" /><span className="text-sm text-gray-500">Active Products</span></div>
          <p className="text-2xl font-bold">{stats.activeProducts}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><AlertCircle size={16} className="text-yellow-500" /><span className="text-sm text-gray-500">Pending Approvals</span></div>
          <p className="text-2xl font-bold">{stats.pendingSellerApprovals}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-red-500" /><span className="text-sm text-gray-500">Pending Payouts</span></div>
          <p className="text-2xl font-bold">${stats.pendingPayouts.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id} className="border-b">
                <td className="p-3 font-medium">{o.orderNumber}</td>
                <td className="p-3">{store.getUser(o.customerId)?.fullName}</td>
                <td className="p-3 font-medium">${o.total.toFixed(2)}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span></td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span></td>
                <td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminUsers() {
  const users = store.getAllUsers();
  const { addToast } = useToast();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-3 font-medium">{u.fullName}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-gray-100 text-gray-700' : u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {u.role !== 'super_admin' && (
                    <button onClick={() => { store.toggleUserStatus(u.id); addToast(`User ${u.isActive ? 'suspended' : 'activated'}`, 'info'); }} className={`text-xs px-2 py-1 rounded ${u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSellers() {
  const { addToast } = useToast();
  const sellers = store.getSellerProfiles();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Seller Management</h1>
      <div className="space-y-4">
        {sellers.map(seller => {
          const user = store.getUser(seller.userId);
          const earnings = store.getSellerEarnings(seller.userId);
          return (
            <div key={seller.userId} className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{seller.storeName}</h3>
                  <p className="text-sm text-gray-500">{user?.fullName} • {user?.email}</p>
                  <p className="text-sm text-gray-500">{seller.city}, {seller.country} • Commission: {seller.commissionRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">Sales: ${earnings.grossSales.toFixed(2)} • Earnings: ${earnings.netEarnings.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${seller.status === 'approved' ? 'bg-green-100 text-green-700' : seller.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : seller.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{seller.status}</span>
                  {seller.status === 'pending' && (
                    <>
                      <button onClick={() => { store.approveSeller(seller.userId); addToast('Seller approved!', 'success'); }} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Approve</button>
                      <button onClick={() => { store.rejectSeller(seller.userId); addToast('Seller rejected', 'info'); }} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Reject</button>
                    </>
                  )}
                  {seller.status === 'approved' && (
                    <button onClick={() => { store.updateSellerProfile(seller.userId, { status: 'suspended' }); addToast('Seller suspended', 'info'); }} className="text-red-600 text-xs hover:underline">Suspend</button>
                  )}
                  {seller.status === 'suspended' && (
                    <button onClick={() => { store.updateSellerProfile(seller.userId, { status: 'approved' }); addToast('Seller reactivated', 'success'); }} className="text-green-600 text-xs hover:underline">Reactivate</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminProducts() {
  const { addToast } = useToast();
  const products = store.getProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Seller</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const seller = store.getSellerProfile(p.sellerId);
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{seller?.storeName || 'Unknown'}</td>
                  <td className="p-3">${(p.salePrice || p.price).toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-gray-100 text-gray-700' : p.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                  <td className="p-3 space-x-2">
                    {p.status !== 'approved' && <button onClick={() => { store.updateProduct(p.id, { status: 'approved' }); addToast('Product approved', 'success'); }} className="text-green-600 text-xs hover:underline">Approve</button>}
                    {p.status === 'approved' && <button onClick={() => { store.updateProduct(p.id, { status: 'suspended' }); addToast('Product suspended', 'info'); }} className="text-red-600 text-xs hover:underline">Suspend</button>}
                    <button onClick={() => { store.updateProduct(p.id, { isFeatured: !p.isFeatured }); addToast('Updated', 'success'); }} className={`text-xs hover:underline ${p.isFeatured ? 'text-amber-600' : 'text-gray-500'}`}>{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders() {
  const orders = store.getOrders();
  const { addToast } = useToast();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Order #</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b">
                <td className="p-3 font-medium">{o.orderNumber}</td>
                <td className="p-3">{store.getUser(o.customerId)?.fullName}</td>
                <td className="p-3">{o.items.length}</td>
                <td className="p-3 font-medium">${o.total.toFixed(2)}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span></td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span></td>
                <td className="p-3">
                  {o.status !== 'delivered' && o.status !== 'cancelled' && (
                    <select value={o.status} onChange={e => { store.updateOrderStatus(o.id, e.target.value as any); addToast('Status updated', 'success'); }} className="text-xs border rounded px-2 py-1">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCoupons() {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage' as 'fixed' | 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', startDate: '', endDate: '' });
  const coupons = store.getCoupons();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    store.addCoupon({ code: form.code.toUpperCase(), type: form.type, value: Number(form.value), minOrderAmount: Number(form.minOrderAmount), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined, usageLimit: Number(form.usageLimit), perCustomerLimit: 1, startDate: form.startDate, endDate: form.endDate, isActive: true });
    addToast('Coupon created!', 'success');
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16} /> Add Coupon</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="Coupon Code" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="px-3 py-2 border rounded-lg text-sm">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required placeholder="Value" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} required placeholder="Min Order" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Max Discount" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} required placeholder="Usage Limit" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="px-3 py-2 border rounded-lg text-sm" />
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Create Coupon</button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Value</th>
              <th className="text-left p-3">Min Order</th>
              <th className="text-left p-3">Usage</th>
              <th className="text-left p-3">Expires</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b">
                <td className="p-3 font-mono font-medium">{c.code}</td>
                <td className="p-3 capitalize">{c.type}</td>
                <td className="p-3">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                <td className="p-3">${c.minOrderAmount}</td>
                <td className="p-3">{c.usedCount}/{c.usageLimit}</td>
                <td className="p-3 text-gray-500">{c.endDate}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPayouts() {
  const { addToast } = useToast();
  const payouts = store.getPayouts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payout Management</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Seller</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => {
              const seller = store.getSellerProfile(p.sellerId);
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-3 font-medium">{seller?.storeName}</td>
                  <td className="p-3 font-medium">${p.amount.toFixed(2)}</td>
                  <td className="p-3">{p.method}</td>
                  <td className="p-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'approved' ? 'bg-blue-100 text-blue-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                  <td className="p-3 space-x-2">
                    {p.status === 'requested' && (
                      <>
                        <button onClick={() => { store.updatePayoutStatus(p.id, 'approved'); addToast('Payout approved', 'success'); }} className="text-green-600 text-xs hover:underline">Approve</button>
                        <button onClick={() => { store.updatePayoutStatus(p.id, 'rejected'); addToast('Payout rejected', 'info'); }} className="text-red-600 text-xs hover:underline">Reject</button>
                      </>
                    )}
                    {p.status === 'approved' && (
                      <button onClick={() => { store.updatePayoutStatus(p.id, 'paid', undefined, 'TXN-' + Date.now()); addToast('Payout marked as paid', 'success'); }} className="text-blue-600 text-xs hover:underline">Mark Paid</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSettings() {
  const { addToast } = useToast();
  const settings = store.getSettings();
  const [form, setForm] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(form);
    addToast('Settings saved!', 'success');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>
      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace Name</label>
              <input type="text" value={form.marketplaceName} onChange={e => setForm({ ...form, marketplaceName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input type="text" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Financial</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission Rate (%)</label>
              <input type="number" value={form.defaultCommissionRate} onChange={e => setForm({ ...form, defaultCommissionRate: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payout ($)</label>
              <input type="number" value={form.minPayoutAmount} onChange={e => setForm({ ...form, minPayoutAmount: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flat Shipping Rate ($)</label>
              <input type="number" step="0.01" value={form.flatShippingRate} onChange={e => setForm({ ...form, flatShippingRate: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
              <input type="number" value={form.freeShippingThreshold} onChange={e => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Policies</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.sellerApprovalRequired} onChange={e => setForm({ ...form, sellerApprovalRequired: e.target.checked })} className="rounded" />
              <span className="text-sm">Require seller approval before publishing</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.productApprovalRequired} onChange={e => setForm({ ...form, productApprovalRequired: e.target.checked })} className="rounded" />
              <span className="text-sm">Require product approval before listing</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.guestCheckoutEnabled} onChange={e => setForm({ ...form, guestCheckoutEnabled: e.target.checked })} className="rounded" />
              <span className="text-sm">Enable guest checkout</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.maintenanceMode} onChange={e => setForm({ ...form, maintenanceMode: e.target.checked })} className="rounded" />
              <span className="text-sm">Maintenance mode</span>
            </label>
          </div>
        </div>

        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">Save Settings</button>
      </form>
    </div>
  );
}

// ============ MAIN APP ============

function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContext.Provider value={{ addToast }}>
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
            <Route path="/products" element={<StorefrontLayout><ProductsPage /></StorefrontLayout>} />
            <Route path="/product/:slug" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
            <Route path="/categories" element={<StorefrontLayout><CategoriesPage /></StorefrontLayout>} />
            <Route path="/cart" element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
            <Route path="/checkout" element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>} />

            {/* Auth */}
            <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
            <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />
            <Route path="/seller/login" element={<StorefrontLayout><SellerLoginPage /></StorefrontLayout>} />
            <Route path="/seller/register" element={<StorefrontLayout><SellerRegisterPage /></StorefrontLayout>} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Customer */}
            <Route path="/account" element={<ProtectedRoute roles={['customer']}><StorefrontLayout><CustomerLayout><CustomerDashboard /></CustomerLayout></StorefrontLayout></ProtectedRoute>} />
            <Route path="/account/orders" element={<ProtectedRoute roles={['customer']}><StorefrontLayout><CustomerLayout><CustomerOrders /></CustomerLayout></StorefrontLayout></ProtectedRoute>} />
            <Route path="/account/orders/:orderId" element={<ProtectedRoute roles={['customer']}><StorefrontLayout><CustomerLayout><CustomerOrderDetail /></CustomerLayout></StorefrontLayout></ProtectedRoute>} />
            <Route path="/account/wishlist" element={<ProtectedRoute roles={['customer']}><StorefrontLayout><CustomerLayout><CustomerWishlist /></CustomerLayout></StorefrontLayout></ProtectedRoute>} />
            <Route path="/account/addresses" element={<ProtectedRoute roles={['customer']}><StorefrontLayout><CustomerLayout><CustomerAddresses /></CustomerLayout></StorefrontLayout></ProtectedRoute>} />

            {/* Seller */}
            <Route path="/seller/dashboard" element={<ProtectedRoute roles={['seller']}><SellerLayout><SellerDashboard /></SellerLayout></ProtectedRoute>} />
            <Route path="/seller/products" element={<ProtectedRoute roles={['seller']}><SellerLayout><SellerProducts /></SellerLayout></ProtectedRoute>} />
            <Route path="/seller/orders" element={<ProtectedRoute roles={['seller']}><SellerLayout><SellerOrders /></SellerLayout></ProtectedRoute>} />
            <Route path="/seller/finance" element={<ProtectedRoute roles={['seller']}><SellerLayout><SellerFinance /></SellerLayout></ProtectedRoute>} />
            <Route path="/seller/settings" element={<ProtectedRoute roles={['seller']}><SellerLayout><SellerSettings /></SellerLayout></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/sellers" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminSellers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminCoupons /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/payouts" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminPayouts /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
          </Routes>
        </ToastContext.Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
