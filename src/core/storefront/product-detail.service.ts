import { productRepository } from '../product/product.repository';
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
      productRepository.getProducts({
        category: product.categorySlug || undefined,
        limit: 5, // Fetch 5 to filter out active item and retain exactly 4
      }),
      productRepository.getProductReviews(product.id),
    ]);

    const relatedProducts = relatedRaw.items
      .filter((item) => item.product.id !== product.id)
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
