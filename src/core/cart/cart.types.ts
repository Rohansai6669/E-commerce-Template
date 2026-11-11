export interface CartItemKey {
  productId: string;
  variantId: string | null;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number | string | null;
  maxDiscountValue?: number | string | null;
  qualifyingProductIds?: string[];
}

export interface CartItem {
  key: string; // Serialized string key: "productId:variantId"
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
  options: Record<string, string>; // Option combinations selected (e.g. Size: 'L')
  quantity: number;
  stockLimit: number;
}

export interface ShippingProgress {
  isFree: boolean;
  threshold: number;
  currentSubtotal: number;
  remaining: number;
  percentage: number;
}

export interface TaxBreakdown {
  isInclusive: boolean;
  rate: number;
  taxableBase: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  formattedTaxableBase: string;
  formattedTaxAmount: string;
  formattedCgst: string;
  formattedSgst: string;
}

export interface DiscountBreakdown {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  formattedAmount: string;
  eligibleSubtotal: number;
  capApplied?: number | null;
  description: string;
}

export interface CartSummary {
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

export interface Cart {
  version: number;
  items: CartItem[];
  coupon: Coupon | null;
}

export type CartEvent =
  | { type: 'item_added'; item: CartItem }
  | { type: 'item_removed'; item: CartItem }
  | { type: 'quantity_changed'; item: CartItem; oldQuantity: number; newQuantity: number }
  | { type: 'coupon_applied'; coupon: Coupon }
  | { type: 'coupon_removed'; code: string }
  | { type: 'cart_cleared' };
