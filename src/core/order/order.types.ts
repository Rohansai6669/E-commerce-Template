import { type CheckoutAddress, type ShippingMethod, type PaymentMethod } from '../checkout/checkout.types';
import { type CartItem } from '../cart/cart.types';

/**
 * A line item snapshot captured at the time an order is placed.
 */
export interface OrderLineItem {
  productId: string;
  variantId: string | null;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  options: Record<string, string>;
}

/**
 * Placed order view model for UI display.
 */
export interface PlacedOrder {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderLineItem[];
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  orderNotes: string;
  placedAt: string;      // ISO 8601
  estimatedDelivery: string; // ISO 8601
}

/**
 * Parameters for creating a new order.
 */
export interface CreateOrderParams {
  items: CartItem[];
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  orderNotes: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  guestEmail: string;
  profileId?: string | null;
}
