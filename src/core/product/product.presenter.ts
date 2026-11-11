import { formatPrice } from '../pricing/format-price';
import { calculateDiscountPercentage, calculateSavings } from '../pricing/calculate-discount';

/**
 * ProductPresenter aggregates pure presentation logic for products.
 * Free of React views to make it completely reusable across storefronts, emails, or invoices.
 */
export class ProductPresenter {
  static getFormattedPrice(price: number, currency = 'INR', locale = 'en-IN'): string {
    return formatPrice(price, { currency, locale });
  }

  static getFormattedComparePrice(price: number | null, currency = 'INR', locale = 'en-IN'): string | null {
    if (price === null) return null;
    return formatPrice(price, { currency, locale });
  }

  static getDiscountPercentage(price: number, compareAtPrice: number | null): number {
    if (compareAtPrice === null) return 0;
    return calculateDiscountPercentage(compareAtPrice, price);
  }

  static getSavings(price: number, compareAtPrice: number | null): number {
    if (compareAtPrice === null) return 0;
    return calculateSavings(compareAtPrice, price);
  }

  static getStockStatus(quantity: number, status: string, threshold = 5): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (status === 'out_of_stock' || quantity <= 0) {
      return 'out-of-stock';
    }
    if (quantity <= threshold) {
      return 'low-stock';
    }
    return 'in-stock';
  }

  static getStockLabel(quantity: number, status: string, threshold = 5): string {
    if (status === 'out_of_stock' || quantity <= 0) {
      return 'Sold Out';
    }
    if (quantity <= threshold) {
      return `Only ${quantity} left`;
    }
    return 'In Stock';
  }
}
export default ProductPresenter;
