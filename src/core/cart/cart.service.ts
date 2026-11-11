import { commerceConfig } from '../config/commerce.config';
import { CartPresenter } from './cart.presenter';
import {
  type Cart,
  type CartItem,
  type CartSummary,
  type Coupon,
  type CartEvent,
} from './cart.types';

/**
 * Creates a unique serialization key for tracking separate options configurations.
 */
export function serializeCartItemKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId || 'default'}`;
}

/**
 * Pure Domain service managing inventory validation math, totals, and event publications.
 */
export class CartService {
  private listeners: Array<(e: CartEvent) => void> = [];

  /**
   * Registers a listener callback for cart state updates. Used for analytics tracking.
   */
  subscribe(callback: (e: CartEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(event: CartEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Failed to notify cart listener:', err);
      }
    });
  }

  /**
   * Adds an item to the cart, clamping quantity limits using stock boundaries.
   */
  addItem(cart: Cart, item: Omit<CartItem, 'key'>): Cart {
    const key = serializeCartItemKey(item.productId, item.variantId);
    const existingIndex = cart.items.findIndex((i) => i.key === key);

    const updatedItems = [...cart.items];
    let finalItem: CartItem;

    if (existingIndex > -1) {
      const existing = cart.items[existingIndex];
      const clampedQty = Math.min(existing.quantity + item.quantity, item.stockLimit);
      finalItem = {
        ...existing,
        quantity: clampedQty,
      };
      updatedItems[existingIndex] = finalItem;
    } else {
      finalItem = {
        ...item,
        key,
        quantity: Math.min(item.quantity, item.stockLimit),
      };
      updatedItems.push(finalItem);
    }

    this.notify({ type: 'item_added', item: finalItem });

    return {
      ...cart,
      items: updatedItems,
    };
  }

  /**
   * Removes an item from the cart.
   */
  removeItem(cart: Cart, key: string): Cart {
    const target = cart.items.find((i) => i.key === key);
    const updatedItems = cart.items.filter((i) => i.key !== key);

    if (target) {
      this.notify({ type: 'item_removed', item: target });
    }

    return {
      ...cart,
      items: updatedItems,
    };
  }

  /**
   * Updates quantities for an item.
   */
  updateQuantity(cart: Cart, key: string, quantity: number): Cart {
    const existingIndex = cart.items.findIndex((i) => i.key === key);
    if (existingIndex === -1) return cart;

    const existing = cart.items[existingIndex];
    const oldQty = existing.quantity;
    const newQty = Math.max(1, Math.min(quantity, existing.stockLimit));

    if (oldQty === newQty) return cart;

    const finalItem = {
      ...existing,
      quantity: newQty,
    };

    const updatedItems = [...cart.items];
    updatedItems[existingIndex] = finalItem;

    this.notify({
      type: 'quantity_changed',
      item: finalItem,
      oldQuantity: oldQty,
      newQuantity: newQty,
    });

    return {
      ...cart,
      items: updatedItems,
    };
  }

  /**
   * Applies a promo coupon code.
   */
  applyCoupon(cart: Cart, coupon: Coupon): Cart {
    this.notify({ type: 'coupon_applied', coupon });
    return {
      ...cart,
      coupon,
    };
  }

  /**
   * Removes current promo coupon code.
   */
  removeCoupon(cart: Cart): Cart {
    if (cart.coupon) {
      this.notify({ type: 'coupon_removed', code: cart.coupon.code });
    }
    return {
      ...cart,
      coupon: null,
    };
  }

  /**
   * Clears all items and coupons from the cart.
   */
  clearCart(): Cart {
    this.notify({ type: 'cart_cleared' });
    return {
      version: 1,
      items: [],
      coupon: null,
    };
  }

  /**
   * Computes subtotal, discounts, shipping, tax rates, and final checkout totals with detailed breakdown.
   */
  calculateTotals(items: CartItem[], coupon: Coupon | null): CartSummary {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let discount = 0;
    let discountBreakdown: import('./cart.types').DiscountBreakdown | null = null;

    if (coupon && subtotal > 0) {
      // If coupon specifies qualifyingProductIds, calculate discount ONLY on eligible items
      const eligibleItems =
        coupon.qualifyingProductIds && coupon.qualifyingProductIds.length > 0
          ? items.filter((i) => coupon.qualifyingProductIds!.includes(i.productId))
          : items;

      const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const minOrder = coupon.minOrderValue ? parseFloat(coupon.minOrderValue.toString()) : 0;

      if (subtotal >= minOrder && eligibleSubtotal > 0) {
        let uncappedDiscount = 0;
        let capApplied: number | null = null;

        if (coupon.type === 'percentage') {
          uncappedDiscount = eligibleSubtotal * (coupon.value / 100);
          if (coupon.maxDiscountValue) {
            const maxDiscount = parseFloat(coupon.maxDiscountValue.toString());
            if (uncappedDiscount > maxDiscount) {
              capApplied = maxDiscount;
              discount = maxDiscount;
            } else {
              discount = uncappedDiscount;
            }
          } else {
            discount = uncappedDiscount;
          }
        } else if (coupon.type === 'fixed') {
          discount = Math.min(eligibleSubtotal, coupon.value);
        }

        discount = Math.min(discount, eligibleSubtotal);

        discountBreakdown = {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          amount: discount,
          formattedAmount: CartPresenter.formatCurrency(discount),
          eligibleSubtotal,
          capApplied,
          description:
            coupon.type === 'percentage'
              ? `${coupon.value}% off${capApplied ? ` (capped at ${CartPresenter.formatCurrency(capApplied)})` : ''}`
              : `${CartPresenter.formatCurrency(coupon.value)} flat discount`,
        };
      }
    }

    const { freeThreshold, flatRate } = commerceConfig.shipping;
    const shipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : flatRate;

    const netProductAmount = Math.max(0, subtotal - discount);
    const isInclusive = commerceConfig.tax.inclusive ?? true;
    const taxRate = commerceConfig.tax.defaultRate;

    let taxableBase = 0;
    let tax = 0;
    let total = 0;

    if (isInclusive) {
      // Tax is already included in product prices (MRP / Indian GST)
      taxableBase = netProductAmount / (1 + taxRate);
      tax = netProductAmount - taxableBase;
      // Tax is NOT added on top because product prices already include it
      total = netProductAmount + shipping;
    } else {
      // Tax is added as a surcharge on top
      taxableBase = netProductAmount;
      tax = netProductAmount * taxRate;
      total = netProductAmount + shipping + tax;
    }

    const cgst = tax / 2;
    const sgst = tax / 2;

    const taxBreakdown = {
      isInclusive,
      rate: taxRate,
      taxableBase,
      taxAmount: tax,
      cgst,
      sgst,
      formattedTaxableBase: CartPresenter.formatCurrency(taxableBase),
      formattedTaxAmount: CartPresenter.formatCurrency(tax),
      formattedCgst: CartPresenter.formatCurrency(cgst),
      formattedSgst: CartPresenter.formatCurrency(sgst),
    };

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      isTaxInclusive: isInclusive,
      taxBreakdown,
      discountBreakdown,
      formattedSubtotal: CartPresenter.formatCurrency(subtotal),
      formattedDiscount: CartPresenter.formatCurrency(discount),
      formattedShipping: shipping === 0 ? 'Free' : CartPresenter.formatCurrency(shipping),
      formattedTax: CartPresenter.formatCurrency(tax),
      formattedTotal: CartPresenter.formatCurrency(total),
    };
  }
}

export const cartService = new CartService();
export default cartService;
