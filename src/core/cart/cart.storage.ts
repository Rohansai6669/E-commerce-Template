import { type Cart } from './cart.types';

export interface CartStorage {
  load(): Cart | null;
  save(cart: Cart): void;
  clear(): void;
}

const STORAGE_KEY = 'storefront_cart_v1';
const CURRENT_VERSION = 1;

/**
 * LocalStorage implementation of CartStorage, guarded against SSR environments.
 */
export class LocalStorageCartStorage implements CartStorage {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  load(): Cart | null {
    if (!this.isBrowser()) return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const cart = JSON.parse(raw) as Cart;
      if (cart.version !== CURRENT_VERSION) {
        console.warn(`Mismatched cart schema version: ${cart.version}. Migrating to default...`);
        this.clear();
        return null;
      }
      return cart;
    } catch (e) {
      console.error('Failed to load cart from LocalStorage:', e);
      this.clear();
      return null;
    }
  }

  save(cart: Cart): void {
    if (!this.isBrowser()) return;

    try {
      const envelope: Cart = {
        version: CURRENT_VERSION,
        items: cart.items,
        coupon: cart.coupon,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch (e) {
      console.error('Failed to save cart to LocalStorage:', e);
    }
  }

  clear(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear cart in LocalStorage:', e);
    }
  }
}

export const cartStorage = new LocalStorageCartStorage();
export default cartStorage;
