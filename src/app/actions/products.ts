'use server';

import { productRepository } from '@/core/product/product.repository';

/**
 * Server action to fetch a list of products matching an array of slugs.
 * Safe from browser database package packaging rules.
 */
export async function getProductsBySlugsAction(slugs: string[]): Promise<unknown[]> {
  try {
    if (slugs.length === 0) return [];
    const results = await productRepository.getProductsBySlugs(slugs);
    return results;
  } catch (err) {
    console.error('Failed to get products by slugs:', err);
    return [];
  }
}
