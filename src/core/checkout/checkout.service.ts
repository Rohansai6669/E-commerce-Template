import { type CartItem, type Coupon } from '../cart/cart.types';
import { type CheckoutTotals, type InventoryCheckResult, type ShippingMethod } from './checkout.types';
import { addressSchema } from './address.validation';
import { commerceConfig } from '../config/commerce.config';
import { CartPresenter } from '../cart/cart.presenter';
import { SHIPPING_METHODS } from './checkout.constants';

/**
 * CheckoutService manages pure business logic for the checkout flow.
 * 
 * Safe to be imported in both server and client environments.
 */
export class CheckoutService {
  /**
   * Validates a checkout address against the Zod schema.
   */
  validateAddress(address: unknown): { success: boolean; errors: Record<string, string> } {
    const result = addressSchema.safeParse(address);
    if (result.success) {
      return { success: true, errors: {} };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string') {
        errors[field] = issue.message;
      }
    });

    return { success: false, errors };
  }

  /**
   * Validates inventory availability for all cart items.
   */
  validateInventory(items: CartItem[]): InventoryCheckResult[] {
    return items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      requested: item.quantity,
      available: item.stockLimit,
      isAvailable: item.quantity <= item.stockLimit,
    }));
  }

  /**
   * Returns available shipping methods.
   */
  getShippingMethods(): ShippingMethod[] {
    return SHIPPING_METHODS;
  }

  /**
   * Recomputes order totals independently from the cart with full discount and tax-inclusive breakdown.
   */
  calculateOrderTotals(
    items: CartItem[],
    shippingMethod: ShippingMethod,
    coupon: Coupon | null
  ): CheckoutTotals {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let discount = 0;
    let discountBreakdown: import('../cart/cart.types').DiscountBreakdown | null = null;

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

    const shipping = shippingMethod.price;
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

export const checkoutService = new CheckoutService();
export default checkoutService;
