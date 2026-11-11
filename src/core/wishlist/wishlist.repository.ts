import { db } from '@/lib/db';
import { wishlistItems } from '@/lib/db/schema/wishlist';
import { eq, and } from 'drizzle-orm';
import { type WishlistItem } from './wishlist.types';

/**
 * WishlistRepository manages wishlist database persistence queries.
 */
export class WishlistRepository {
  /**
   * Retrieves the customer's saved items, joined with product details.
   */
  async getWishlist(profileId: string): Promise<WishlistItem[]> {
    const rows = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.profileId, profileId),
      with: {
        product: {
          with: {
            images: true,
            brand: true,
            category: true,
          },
        },
      },
    });
    return rows as unknown as WishlistItem[];
  }

  /**
   * Checks if an item is already saved in the user's wishlist.
   */
  async exists(profileId: string, productId: string): Promise<boolean> {
    const [row] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.profileId, profileId), eq(wishlistItems.productId, productId)));
    return !!row;
  }

  /**
   * Adds a product to the user's wishlist.
   */
  async add(profileId: string, productId: string): Promise<boolean> {
    const [inserted] = await db
      .insert(wishlistItems)
      .values({ profileId, productId })
      .returning();
    return !!inserted;
  }

  /**
   * Removes a product from the user's wishlist.
   */
  async remove(profileId: string, productId: string): Promise<boolean> {
    const [deleted] = await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.profileId, profileId), eq(wishlistItems.productId, productId)))
      .returning();
    return !!deleted;
  }
}

export const wishlistRepository = new WishlistRepository();
export default wishlistRepository;
