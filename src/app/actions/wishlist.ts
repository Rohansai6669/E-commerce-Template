'use server';

import { getCurrentUser } from '@/core/auth/session';
import { wishlistService } from '@/core/wishlist/wishlist.service';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Helper to safely extract error message from unknown catch blocks.
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

/**
 * Server action to toggle wishlist item saved status.
 * Returns true if added, false if removed.
 */
export async function toggleWishlistAction(productId: string): Promise<{ success: boolean; isSaved?: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please log in to save items to your wishlist.' };
    }

    const isSaved = await wishlistService.toggleItem(user.id, productId);
    
    revalidatePath('/account/wishlist');
    revalidatePath(`/products`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as any)('products');
    
    return { success: true, isSaved };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
