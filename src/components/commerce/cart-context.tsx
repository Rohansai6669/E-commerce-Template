'use client';

import * as React from 'react';
import { cartService } from '@/core/cart/cart.service';
import { cartStorage } from '@/core/cart/cart.storage';
import {
  type CartItem,
  type CartSummary,
  type Coupon,
  type Cart,
} from '@/core/cart/cart.types';

export interface CartContextValue {
  items: CartItem[];
  coupon: Coupon | null;
  summary: CartSummary;
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, 'key'>) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const _emptyCart: Cart = { version: 1, items: [], coupon: null };

/**
 * CartProvider acts as a thin state broker translating React events into CartService calls.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<Cart>(_emptyCart);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Defer reading localStorage to an asynchronous macro-task so initial SSR hydration finishes cleanly
    const timer = setTimeout(() => {
      const stored = cartStorage.load();
      if (stored) {
        setCart(stored);
      }
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const addItem = React.useCallback((item: Omit<CartItem, 'key'>) => {
    setCart((prev) => {
      const next = cartService.addItem(prev, item);
      cartStorage.save(next);
      return next;
    });
  }, []);

  const removeItem = React.useCallback((key: string) => {
    setCart((prev) => {
      const next = cartService.removeItem(prev, key);
      cartStorage.save(next);
      return next;
    });
  }, []);

  const updateQuantity = React.useCallback((key: string, qty: number) => {
    setCart((prev) => {
      const next = cartService.updateQuantity(prev, key, qty);
      cartStorage.save(next);
      return next;
    });
  }, []);

  const applyCoupon = React.useCallback((coupon: Coupon) => {
    setCart((prev) => {
      const next = cartService.applyCoupon(prev, coupon);
      cartStorage.save(next);
      return next;
    });
  }, []);

  const removeCoupon = React.useCallback(() => {
    setCart((prev) => {
      const next = cartService.removeCoupon(prev);
      cartStorage.save(next);
      return next;
    });
  }, []);

  const clearCart = React.useCallback(() => {
    const next = cartService.clearCart();
    setCart(next);
    cartStorage.save(next);
  }, []);

  // Compute summary values from CartService calculations
  const summary = React.useMemo(() => {
    return cartService.calculateTotals(cart.items, cart.coupon);
  }, [cart.items, cart.coupon]);

  const value = React.useMemo(
    () => ({
      items: cart.items,
      coupon: cart.coupon,
      summary,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      clearCart,
    }),
    [
      cart.items,
      cart.coupon,
      summary,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const defaultCartContext: CartContextValue = {
  items: [],
  coupon: null,
  summary: cartService.calculateTotals([], null),
  isHydrated: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  applyCoupon: () => {},
  removeCoupon: () => {},
  clearCart: () => {},
};

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('useCart was called outside of a CartProvider. Returning default fallback cart context.');
    }
    return defaultCartContext;
  }
  return context;
}
