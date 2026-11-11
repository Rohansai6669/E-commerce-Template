import { productRepository } from '../product/product.repository';
import { ProductMapper } from '../product/product.mapper';
import { type ProductCardModel } from '../product/product.types';

export interface SearchResults {
  items: ProductCardModel[];
  total: number;
  q: string;
}

/**
 * SearchService handles normalization, boosting, sorting, and pagination logic 
 * for search queries across storefront catalog items.
 */
export class SearchService {
  /**
   * Performs catalog queries matching keywords.
   */
  async searchProducts(q: string, page = 1, limit = 12): Promise<SearchResults> {
    const query = q.trim();
    if (!query) {
      return { items: [], total: 0, q };
    }

    const data = await productRepository.getProducts({
      search: query,
      limit,
      page,
    });

    const items = data.items.map((row) => ProductMapper.toProductCardModel(row));

    return {
      items,
      total: data.total,
      q: query,
    };
  }
}

export const searchService = new SearchService();
export default searchService;
