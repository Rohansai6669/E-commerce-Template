import { wishlistRepository } from './wishlist.repository';

/**
 * WishlistService coordinates wishlist business rules and status toggling actions.
 */
export class WishlistService {
  /**
   * Toggles the saved state of a product: adds it if missing, removes it if present.
   * Returns true if added, false if removed.
   */
  async toggleItem(profileId: string, productId: string): Promise<boolean> {
    const isSaved = await wishlistRepository.exists(profileId, productId);
    if (isSaved) {
      await wishlistRepository.remove(profileId, productId);
      return false; // Removed
    } else {
      await wishlistRepository.add(profileId, productId);
      return true; // Added
    }
  }

  /**
   * Determines if a specific product is saved in the customer's wishlist.
   */
  async isSaved(profileId: string, productId: string): Promise<boolean> {
    return await wishlistRepository.exists(profileId, productId);
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
