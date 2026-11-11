import { CartPresenter } from '../cart/cart.presenter';

/**
 * Pure formatting functions for order display values.
 */
export class OrderPresenter {
  /**
   * Formats order number for display.
   */
  static formatOrderNumber(orderNumber: string): string {
    return `#${orderNumber}`;
  }

  /**
   * Formats the order placed date.
   */
  static formatOrderDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formats estimated delivery date.
   */
  static formatEstimatedDelivery(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formats a currency amount.
   */
  static formatCurrency(amount: number): string {
    return CartPresenter.formatCurrency(amount);
  }

  /**
   * Returns a human-readable order status label.
   */
  static formatStatus(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Order Placed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  }
}
export default OrderPresenter;
