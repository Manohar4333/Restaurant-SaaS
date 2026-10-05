import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  restaurantSlug: string | null;
  tableToken: string | null;
  tableNumber: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  setContext: (slug: string, tableToken?: string, tableNumber?: string) => void;
  addItem: (product: Product, quantity?: number, currentSlug?: string) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isDifferentRestaurantModalOpen: boolean;
  closeDifferentRestaurantModal: () => void;
  confirmResetAndAdd: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(() => localStorage.getItem('cart_restaurantSlug'));
  const [tableToken, setTableToken] = useState<string | null>(() => localStorage.getItem('cart_tableToken'));
  const [tableNumber, setTableNumber] = useState<string | null>(() => localStorage.getItem('cart_tableNumber'));
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [pendingAdd, setPendingAdd] = useState<{ product: Product; quantity: number; slug: string } | null>(null);
  const [isDifferentRestaurantModalOpen, setIsDifferentRestaurantModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
    if (restaurantSlug) localStorage.setItem('cart_restaurantSlug', restaurantSlug);
    else localStorage.removeItem('cart_restaurantSlug');

    if (tableToken) localStorage.setItem('cart_tableToken', tableToken);
    else localStorage.removeItem('cart_tableToken');

    if (tableNumber) localStorage.setItem('cart_tableNumber', tableNumber);
    else localStorage.removeItem('cart_tableNumber');
  }, [items, restaurantSlug, tableToken, tableNumber]);

  const setContext = (slug: string, token?: string, tableNum?: string) => {
    if (slug !== restaurantSlug && items.length === 0) {
      setRestaurantSlug(slug);
    }
    if (token) setTableToken(token);
    if (tableNum) setTableNumber(tableNum);
  };

  const addItem = (product: Product, quantity = 1, currentSlug?: string): boolean => {
    const slug = currentSlug || restaurantSlug;

    // Check if adding from another restaurant while cart has items
    if (restaurantSlug && slug && restaurantSlug !== slug && items.length > 0) {
      setPendingAdd({ product, quantity, slug });
      setIsDifferentRestaurantModalOpen(true);
      return false;
    }

    if (!restaurantSlug && slug) {
      setRestaurantSlug(slug);
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });

    return true;
  };

  const confirmResetAndAdd = () => {
    if (pendingAdd) {
      setRestaurantSlug(pendingAdd.slug);
      setItems([{ product: pendingAdd.product, quantity: pendingAdd.quantity }]);
      setPendingAdd(null);
      setIsDifferentRestaurantModalOpen(false);
    }
  };

  const closeDifferentRestaurantModal = () => {
    setPendingAdd(null);
    setIsDifferentRestaurantModalOpen(false);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        restaurantSlug,
        tableToken,
        tableNumber,
        items,
        itemCount,
        subtotal,
        setContext,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDifferentRestaurantModalOpen,
        closeDifferentRestaurantModal,
        confirmResetAndAdd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
