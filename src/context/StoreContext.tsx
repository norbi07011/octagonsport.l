import React, { createContext, useContext, useState, useEffect } from 'react';
import { calcShipping, FREE_SHIPPING_THRESHOLD, ShippingQuote } from '../config/shipping';
import { Product, CartItem, Language } from '../types';
import { PRODUCTS } from '../data/products';
import { translations } from '../data/translations';

interface StoreContextType {
  // Navigation
  currentPath: string;
  navigate: (path: string) => void;

  // Products
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  amountForFreeShipping: number;
  shippingQuote: ShippingQuote;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Comparison
  comparison: string[];
  addToComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  toggleComparison: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
  isComparisonBarOpen: boolean;
  setIsComparisonBarOpen: (open: boolean) => void;

  // Quick View & Modals
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  sizeGuideOpen: boolean;
  sizeGuideCategory: string;
  openSizeGuide: (category?: string) => void;
  closeSizeGuide: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Language & Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Loyalty & User
  orders: any[];
  addOrder: (order: any) => void;

  // Toast
  toast: { message: string; type?: 'success' | 'info' } | null;
  showToast: (message: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state with browser history sync
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || (window.location.pathname + window.location.search) || '/';
    }
    return '/';
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || (window.location.pathname + window.location.search) || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Language state with localStorage persistence
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('octagon_language') as Language;
        if (saved && (saved === 'nl' || saved === 'en' || saved === 'pl')) {
          return saved;
        }
      } catch {
        // fallback
      }
    }
    return 'nl';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('octagon_language', lang);
        document.documentElement.lang = lang;
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['nl']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }
    return text;
  };

  // Katalog produktów – zawsze z pliku catalog.json (bez zapisu w przeglądarce)
  const products = PRODUCTS;

  // Usuń stare, zmyślone produkty zapisane przez poprzednią wersję sklepu
  useEffect(() => {
    try {
      ['octagon_store_products', 'octagon_last_sync', 'octagon_supplier_config'].forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  const getProductById = (id: string) => products.find(p => p.id === id || p.sku === id);
  const getProductBySlug = (slug: string) => products.find(p => p.slug === slug || p.id === slug);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('octagon_cart');
      const parsed: CartItem[] = saved ? JSON.parse(saved) : [];
      // Odśwież dane produktów w koszyku i usuń produkty, których już nie ma w katalogu
      return parsed
        .map(item => {
          const fresh = PRODUCTS.find(p => p.id === item.product?.id);
          return fresh ? { ...item, product: fresh } : null;
        })
        .filter((x): x is CartItem => x !== null);
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('octagon_cart', JSON.stringify(cart));
    } catch (e) {
      // storage unavailable
    }
  }, [cart]);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('octagon_wishlist');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      return ids.filter(id => PRODUCTS.some(p => p.id === id));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('octagon_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Comparison state with localStorage persistence (max 4 products)
  const [comparison, setComparison] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('octagon_comparison');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      return ids.filter(id => PRODUCTS.some(p => p.id === id));
    } catch {
      return [];
    }
  });
  const [isComparisonBarOpen, setIsComparisonBarOpen] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('octagon_comparison', JSON.stringify(comparison));
    } catch (e) {}
  }, [comparison]);

  const addToComparison = (productId: string) => {
    setComparison(prev => {
      if (prev.includes(productId)) {
        showToast(
          language === 'pl'
            ? 'Ten produkt znajduje się już w porównywarce.'
            : language === 'en'
            ? 'This product is already in comparison.'
            : 'Dit product staat al in de vergelijker.'
        );
        return prev;
      }
      if (prev.length >= 4) {
        showToast(
          language === 'pl'
            ? 'Możesz porównać maksymalnie 4 produkty jednocześnie.'
            : language === 'en'
            ? 'You can compare up to 4 products at once.'
            : 'Je kunt maximaal 4 producten tegelijk vergelijken.'
        );
        return prev;
      }
      const updated = [...prev, productId];
      showToast(
        language === 'pl'
          ? 'Dodano do porównywarki specyfikacji!'
          : language === 'en'
          ? 'Added to specification comparison!'
          : 'Toegevoegd aan specificatievergelijker!'
      );
      setIsComparisonBarOpen(true);
      return updated;
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparison(prev => prev.filter(id => id !== productId));
  };

  const toggleComparison = (productId: string) => {
    if (comparison.includes(productId)) {
      removeFromComparison(productId);
      showToast(
        language === 'pl' 
          ? 'Usunięto z porównywarki.' 
          : 'Verwijderd uit vergelijker.'
      );
    } else {
      addToComparison(productId);
    }
  };

  const isInComparison = (productId: string) => comparison.includes(productId);

  const clearComparison = () => {
    setComparison([]);
    showToast(
      language === 'pl' 
        ? 'Wyczyszczono listę porównywarki.' 
        : 'Vergelijkingslijst gewist.'
    );
  };

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideCategory, setSizeGuideCategory] = useState('fight-gear');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Zamówienia (tymczasowo w przeglądarce – w etapie 2 w bazie)
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('octagon_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const addOrder = (order: any) => {
    setOrders(prev => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('octagon_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, type: 'success' });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const addToCart = (product: Product, size?: string, color?: string, qty: number = 1) => {
    if (!product) return;
    if (product.stock !== undefined && product.stock <= 0) {
      showToast(
        language === 'pl' 
          ? 'Ten produkt jest chwilowo wyprzedany w magazynie.' 
          : language === 'en' 
          ? 'This item is currently out of stock.' 
          : 'Dit artikel is momenteel uitverkocht.'
      );
      return;
    }

    const safeSizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['One Size'];
    const safeColors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [{ name: 'Standard', hex: '#000000' }];
    const chosenSize = size || safeSizes[0];
    const chosenColor = color || safeColors[0]?.name || 'Standard';

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === chosenSize && item.selectedColor === chosenColor
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const newTotalQty = copy[existingIndex].quantity + (qty || 1);
        copy[existingIndex].quantity = product.stock ? Math.min(newTotalQty, product.stock) : newTotalQty;
        return copy;
      } else {
        const initialQty = product.stock ? Math.min(qty || 1, product.stock) : (qty || 1);
        return [...prev, { product, selectedSize: chosenSize, selectedColor: chosenColor, quantity: initialQty }];
      }
    });

    const localizedTitle = language === 'pl' 
      ? (product.name_pl || product.name) 
      : language === 'en' 
      ? (product.name_en || product.name) 
      : product.name;

    showToast(
      language === 'pl'
        ? `${localizedTitle} (${chosenSize}) dodano do koszyka!`
        : language === 'en'
        ? `${localizedTitle} (${chosenSize}) added to cart!`
        : `${localizedTitle} (${chosenSize}) toegevoegd aan winkelwagen!`
    );
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(
      item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, size: string, color: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Verwijderd uit verlanglijst');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Opgeslagen in verlanglijst');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  const openSizeGuide = (category: string = 'fight-gear') => {
    setSizeGuideCategory(category);
    setSizeGuideOpen(true);
  };
  const closeSizeGuide = () => setSizeGuideOpen(false);


  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = Number(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2));
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  const shippingQuote = calcShipping(cart, subtotal, 'home');
  const shippingFee = shippingQuote.fee;
  const total = Number((subtotal + shippingFee).toFixed(2));
  const amountForFreeShipping = Math.max(0, Number((freeShippingThreshold - subtotal).toFixed(2)));

  return (
    <StoreContext.Provider
      value={{
        currentPath,
        navigate,
        products,
        getProductById,
        getProductBySlug,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        shippingFee,
        total,
        freeShippingThreshold,
        amountForFreeShipping,
        shippingQuote,
        wishlist,
        toggleWishlist,
        isInWishlist,
        comparison,
        addToComparison,
        removeFromComparison,
        toggleComparison,
        isInComparison,
        clearComparison,
        isComparisonBarOpen,
        setIsComparisonBarOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        sizeGuideOpen,
        sizeGuideCategory,
        openSizeGuide,
        closeSizeGuide,
        isSearchOpen,
        setIsSearchOpen,
        language,
        setLanguage,
        t,
        orders,
        addOrder,
        toast,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
