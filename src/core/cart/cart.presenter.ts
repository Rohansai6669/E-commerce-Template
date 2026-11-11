import { commerceConfig } from '../config/commerce.config';
import { type ShippingProgress } from './cart.types';

/**
 * CartPresenter formats currency, percentage gauges, and motivational shipping alerts.
 */
export class CartPresenter {
  /**
   * Safely formats currency values in INR.
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Evaluates details for progress bars showing proximity to the free shipping threshold.
   */
  static getShippingProgress(subtotal: number): ShippingProgress {
    const threshold = commerceConfig.shipping.freeThreshold;
    const isFree = subtotal >= threshold;
    const remaining = Math.max(0, threshold - subtotal);
    const percentage = Math.min(100, (subtotal / threshold) * 100);

    return {
      isFree,
      threshold,
      currentSubtotal: subtotal,
      remaining,
      percentage,
    };
  }

  /**
   * Returns a user-friendly description about shipping progress status.
   */
  static formatShippingMessage(progress: ShippingProgress): string {
    if (progress.isFree) {
      return 'Your order qualifies for Free Shipping!';
    }
    return `Add ${this.formatCurrency(progress.remaining)} more to qualify for Free Shipping.`;
  }
}
export default CartPresenter;
