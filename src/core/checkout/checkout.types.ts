/**
 * Checkout step progression.
 */
export type CheckoutStep = 'address' | 'shipping' | 'review' | 'payment' | 'confirmation';

/**
 * Customer shipping/billing address collected during checkout.
 */
export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Selectable shipping option with carrier metadata.
 */
export interface ShippingMethod {
  id: string;
  carrier: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

/**
 * Payment method selection.
 */
export interface PaymentMethod {
  type: 'card' | 'cod' | 'razorpay';
  last4?: string;
  brand?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

/**
 * Complete checkout state — each section isolated.
 */
export interface CheckoutState {
  step: CheckoutStep;
  address: CheckoutAddress | null;
  shippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethod | null;
  orderNotes: string;
}

/**
 * Checkout action types for the reducer.
 */
export type CheckoutAction =
  | { type: 'SET_ADDRESS'; address: CheckoutAddress }
  | { type: 'SET_SHIPPING_METHOD'; method: ShippingMethod }
  | { type: 'SET_PAYMENT_METHOD'; method: PaymentMethod }
  | { type: 'SET_ORDER_NOTES'; notes: string }
  | { type: 'GO_TO_STEP'; step: CheckoutStep }
  | { type: 'RESET' };

import { type TaxBreakdown, type DiscountBreakdown } from '../cart/cart.types';

/**
 * Order totals independently recomputed during checkout.
 */
export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;

  isTaxInclusive?: boolean;
  taxBreakdown?: TaxBreakdown;
  discountBreakdown?: DiscountBreakdown | null;

  formattedSubtotal: string;
  formattedDiscount: string;
  formattedShipping: string;
  formattedTax: string;
  formattedTotal: string;
}

/**
 * Inventory validation result for a single cart item.
 */
export interface InventoryCheckResult {
  productId: string;
  variantId: string | null;
  requested: number;
  available: number;
  isAvailable: boolean;
}
