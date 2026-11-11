import { type WishlistItem } from './wishlist.types';

/**
 * WishlistPresenter formats saved items list displays and dashboard badge aggregates.
 */
export class WishlistPresenter {
  /**
   * Formats wishlist items to ProductCard payload structures.
   */
  static formatCard(item: WishlistItem) {
    return {
      product: item.product,
      category: item.product.categoryName,
      brand: item.product.brandName,
      price: typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price,
    };
  }

  /**
   * Generates badge count display text.
   */
  static getBadgeText(count: number): string {
    if (count === 0) return 'Empty';
    if (count === 1) return '1 Item';
    return `${count} Items`;
  }
}
export default WishlistPresenter;
