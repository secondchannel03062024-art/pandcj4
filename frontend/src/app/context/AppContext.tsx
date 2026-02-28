import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product as DBProduct, Order, Coupon, Banner, Category, db } from '../services/database-enhanced';
import { seedDatabase } from '../services/seedData';

export interface Product extends DBProduct {
  id: string; // Alias for _id for compatibility
}

export interface CartItem extends Product {
  cartQuantity: number;
}

interface AppContextType {
  // Cart & Wishlist
  cartItems: CartItem[];
  wishlist: string[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  clearCart: () => void;
  
  // Database with Real-time Sync
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  categories: Category[];
  refreshProducts: () => void;
  refreshOrders: () => void;
  refreshCoupons: () => void;
  refreshBanners: () => void;
  
  // Order Management
  createOrder: (orderData: Omit<Order, '_id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  
  // Product Management
  createProduct: (productData: Omit<Product, '_id' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Coupon Management
  createCoupon: (couponData: Omit<Coupon, '_id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => Promise<Coupon>;
  updateCoupon: (couponId: string, couponData: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  validateCoupon: (code: string, orderValue: number) => { valid: boolean; coupon?: Coupon; error?: string };
  
  // Banner Management
  createBanner: (bannerData: Omit<Banner, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Banner>;
  updateBanner: (bannerId: string, bannerData: Partial<Banner>) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Real-time synced database state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Initialize database and seed data
  useEffect(() => {
    seedDatabase();
    
    // Load initial data
    const loadData = async () => {
      const loadedProducts = (await db.getAll<DBProduct>('products')).map(p => ({ ...p, id: p._id }));
      const loadedOrders = await db.getAll<Order>('orders');
      const loadedCoupons = await db.getAll<Coupon>('coupons');
      const loadedBanners = await db.getAll<Banner>('banners');
      const loadedCategories = await db.getAll<Category>('categories');
      
      setProducts(loadedProducts);
      setOrders(loadedOrders);
      setCoupons(loadedCoupons);
      setBanners(loadedBanners);
      setCategories(loadedCategories);
    };

    loadData();
    
    // Subscribe to real-time updates
    const unsubProducts = db.subscribe('products', (data) => {
      setProducts(data.map((p: DBProduct) => ({ ...p, id: p._id })));
    });
    
    const unsubOrders = db.subscribe('orders', (data) => {
      setOrders(data);
    });
    
    const unsubCoupons = db.subscribe('coupons', (data) => {
      setCoupons(data);
    });
    
    const unsubBanners = db.subscribe('banners', (data) => {
      setBanners(data);
    });
    
    const unsubCategories = db.subscribe('categories', (data) => {
      setCategories(data);
    });
    
    return () => {
      unsubProducts();
      unsubOrders();
      unsubCoupons();
      unsubBanners();
      unsubCategories();
    };
  }, []);

  // Cart Management
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 5 }]; // Start with minimum 5 meters
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Enforce minimum of 5 meters
    if (quantity < 5) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, cartQuantity: quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Refresh functions (for manual updates if needed)
  const refreshProducts = async () => {
    const data = (await db.getAll<DBProduct>('products')).map(p => ({ ...p, id: p._id }));
    setProducts(data);
  };

  const refreshOrders = async () => {
    const data = await db.getAll<Order>('orders');
    setOrders(data);
  };

  const refreshCoupons = async () => {
    const data = await db.getAll<Coupon>('coupons');
    setCoupons(data);
  };

  const refreshBanners = async () => {
    const data = await db.getAll<Banner>('banners');
    setBanners(data);
  };

  // Order Management
  const createOrder = async (orderData: Omit<Order, '_id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const order = await db.create<Order>('orders', {
      ...orderData,
      orderNumber,
      status: orderData.status || 'pending',
      paymentStatus: orderData.paymentStatus || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Order);
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await db.update<Order>('orders', orderId, { status });
  };

  // Product Management
  const createProduct = async (productData: Omit<Product, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const product = await db.create<DBProduct>('products', {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as DBProduct);
    return { ...product, id: product._id };
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    const { id, ...dataWithoutId } = productData;
    await db.update<DBProduct>('products', productId, dataWithoutId);
  };

  const deleteProduct = async (productId: string) => {
    await db.delete('products', productId);
  };

  // Coupon Management
  const createCoupon = async (couponData: Omit<Coupon, '_id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<Coupon> => {
    return await db.create<Coupon>('coupons', { 
      ...couponData, 
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Coupon);
  };

  const updateCoupon = async (couponId: string, couponData: Partial<Coupon>) => {
    await db.update<Coupon>('coupons', couponId, couponData);
  };

  const deleteCoupon = async (couponId: string) => {
    await db.delete('coupons', couponId);
  };

  const validateCoupon = (code: string, orderValue: number) => {
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    
    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }
    
    if (!coupon.isActive) {
      return { valid: false, error: 'Coupon is not active' };
    }
    
    if (new Date(coupon.validFrom) > new Date()) {
      return { valid: false, error: 'Coupon is not yet valid' };
    }
    
    if (new Date(coupon.validTo) < new Date()) {
      return { valid: false, error: 'Coupon has expired' };
    }
    
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }
    
    if (orderValue < coupon.minOrderValue) {
      return { valid: false, error: `Minimum order value of ₹${coupon.minOrderValue} required` };
    }
    
    return { valid: true, coupon };
  };

  // Banner Management
  const createBanner = async (bannerData: Omit<Banner, '_id' | 'createdAt' | 'updatedAt'>): Promise<Banner> => {
    return await db.create<Banner>('banners', {
      ...bannerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Banner);
  };

  const updateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
    await db.update<Banner>('banners', bannerId, bannerData);
  };

  const deleteBanner = async (bannerId: string) => {
    await db.delete('banners', bannerId);
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        wishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleWishlist,
        clearCart,
        products,
        orders,
        coupons,
        banners,
        categories,
        refreshProducts,
        refreshOrders,
        refreshCoupons,
        refreshBanners,
        createOrder,
        updateOrderStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        createBanner,
        updateBanner,
        deleteBanner
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    // In Figma preview mode, components may render without the provider
    // Return mock/empty values to prevent crashes during preview
    console.warn('useApp called outside AppProvider - returning mock data for preview');
    return {
      cartItems: [],
      wishlist: [],
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      toggleWishlist: () => {},
      clearCart: () => {},
      products: [],
      orders: [],
      coupons: [],
      banners: [],
      categories: [],
      refreshProducts: () => {},
      refreshOrders: () => {},
      refreshCoupons: () => {},
      refreshBanners: () => {},
      createOrder: async () => ({ _id: '', orderNumber: '', customerName: '', customerEmail: '', customerPhone: '', shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' }, items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, status: 'pending', paymentStatus: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateOrderStatus: async () => {},
      createProduct: async () => ({ _id: '', id: '', sku: '', name: '', price: 0, offerPercentage: 0, quantity: 0, category: '', subCategory: '', fabricType: '', careInstructions: '', description: '', images: [], colors: [], features: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateProduct: async () => {},
      deleteProduct: async () => {},
      createCoupon: async () => ({ _id: '', code: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, validFrom: new Date().toISOString(), validTo: new Date().toISOString(), usageLimit: 0, usedCount: 0, isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateCoupon: async () => {},
      deleteCoupon: async () => {},
      validateCoupon: () => ({ valid: false, error: 'Preview mode' }),
      createBanner: async () => ({ _id: '', type: 'hero-main', title: '', image: '', link: '', isActive: false, order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateBanner: async () => {},
      deleteBanner: async () => {},
    } as AppContextType;
  }
  return context;
}