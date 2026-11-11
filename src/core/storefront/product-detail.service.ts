import { productRepository } from '../product/product.repository';
import { getCachedProducts } from '../performance/cache';
import { ProductMapper } from '../product/product.mapper';
import { type ProductDetailModel, type ProductCardModel } from '../product/product.types';

export interface ProductDetailPageData {
  product: ProductDetailModel;
  relatedProducts: ProductCardModel[];
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }>;
}

/**
 * ProductDetailService manages data fetching orchestrations and models aggregation for PDP.
 */
export class ProductDetailService {
  async getProductDetail(slug: string): Promise<ProductDetailPageData | null> {
    const rawProduct = await productRepository.getProductBySlug(slug);
    if (!rawProduct) return null;

    const product = ProductMapper.toProductDetailModel(rawProduct);

    // Fetch related recommendations and detailed review listings in parallel
    const [relatedRaw, reviewsRaw] = await Promise.all([
      getCachedProducts({
        category: product.categorySlug || undefined,
        limit: 8, // Fetch up to 8 to account for filtering active item
      }),
      productRepository.getProductReviews(product.id),
    ]);

    let relatedItems = relatedRaw.items.filter((item) => item.product.id !== product.id);

    // If category has fewer than 4 items, backfill from other active catalog products
    // to ensure the recommendation grid never has empty columns.
    if (relatedItems.length < 4) {
      try {
        const fallbackRaw = await getCachedProducts({
          limit: 8,
          sort: 'latest',
        });
        const additional = fallbackRaw.items.filter(
          (item) => item.product.id !== product.id && !relatedItems.some((r) => r.product.id === item.product.id)
        );
        relatedItems = [...relatedItems, ...additional];
      } catch (err) {
        console.warn('Fallback related products fetch error:', err);
      }
    }

    const relatedProducts = relatedItems
      .slice(0, 4)
      .map((row) => ProductMapper.toProductCardModel(row));

    const reviews = reviewsRaw.map((rev) => ({
      id: rev.id,
      rating: rev.rating,
      comment: rev.comment,
      createdAt: rev.createdAt,
    }));

    return {
      product,
      relatedProducts,
      reviews,
    };
  }
}

export const productDetailService = new ProductDetailService();
export default productDetailService;
