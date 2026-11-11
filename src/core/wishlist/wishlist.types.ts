import { type ProductCardModel } from '../product/product.types';

/**
 * A customer wishlist item snapshot.
 */
export interface WishlistItem {
  profileId: string;
  productId: string;
  createdAt: string; // ISO timestamp
  product: ProductCardModel;
}
export default WishlistItem;
