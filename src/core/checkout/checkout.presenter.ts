import { type CheckoutAddress, type ShippingMethod, type PaymentMethod } from './checkout.types';
import { CartPresenter } from '../cart/cart.presenter';

/**
 * Pure formatting functions for checkout display values.
 */
export class CheckoutPresenter {
  /**
   * Formats a checkout address into a multi-line display string.
   */
  static formatAddress(address: CheckoutAddress): string {
    const lines = [
      `${address.firstName} ${address.lastName}`,
      address.addressLine1,
      address.addressLine2 || null,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ].filter(Boolean);

    return lines.join('\n');
  }

  /**
   * Formats a single-line address summary.
   */
  static formatAddressSummary(address: CheckoutAddress): string {
    return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;
  }

  /**
   * Formats estimated delivery range from shipping method.
   */
  static formatShippingEstimate(method: ShippingMethod): string {
    if (method.estimatedDays === 1) {
      return 'Arrives tomorrow';
    }
    return `Arrives in ${method.estimatedDays} business days`;
  }

  /**
   * Formats shipping method price for display.
   */
  static formatShippingPrice(method: ShippingMethod): string {
    if (method.price === 0) return 'Free';
    return CartPresenter.formatCurrency(method.price);
  }

  /**
   * Formats payment method summary.
   */
  static formatPaymentSummary(method: PaymentMethod): string {
    if (method.type === 'cod') {
      return 'Cash on Delivery';
    }
    if (method.brand && method.last4) {
      return `${method.brand} ending in ${method.last4}`;
    }
    return 'Credit / Debit Card';
  }
}
export default CheckoutPresenter;
