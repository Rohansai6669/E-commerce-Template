import { type ProductFilters, type ProductSort } from '../product/product.types';

/**
 * Parses raw Next.js route search parameters into strongly-typed ProductFilters,
 * including universal attributes (edition, festival, tag, material).
 */
export function parseProductFilters(searchParams: Record<string, string | string[] | undefined>): ProductFilters {
  const page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit as string, 10) : 12;

  const minPrice = searchParams.min ? parseFloat(searchParams.min as string) : undefined;
  const maxPrice = searchParams.max ? parseFloat(searchParams.max as string) : undefined;

  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const gender = typeof searchParams.gender === 'string' ? searchParams.gender : undefined;
  const collection = typeof searchParams.collection === 'string' ? searchParams.collection : undefined;

  // Universal Attribute Filters
  const edition = typeof searchParams.edition === 'string' ? searchParams.edition : undefined;
  const festival = typeof searchParams.festival === 'string' ? searchParams.festival : undefined;
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined;
  const material = typeof searchParams.material === 'string' ? searchParams.material : undefined;

  let availability: ProductFilters['availability'] = 'all';
  if (searchParams.availability === 'in-stock') availability = 'in-stock';
  if (searchParams.availability === 'out-of-stock') availability = 'out-of-stock';

  let sort: ProductSort = 'latest';
  const sortParam = searchParams.sort as string;
  if (['price-asc', 'price-desc', 'latest', 'rating-desc', 'popular'].includes(sortParam)) {
    sort = sortParam as ProductSort;
  }

  return {
    category,
    brand,
    search,
    gender,
    collection,
    edition,
    festival,
    tag,
    material,
    minPrice: isNaN(minPrice as number) ? undefined : minPrice,
    maxPrice: isNaN(maxPrice as number) ? undefined : maxPrice,
    availability,
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 12 : limit,
    sort,
  };
}

/**
 * Serializes typed ProductFilters back into string parameters for URL router updates.
 */
export function serializeProductFilters(filters: ProductFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.category) params.category = filters.category;
  if (filters.brand) params.brand = filters.brand;
  if (filters.search) params.search = filters.search;
  if (filters.gender) params.gender = filters.gender;
  if (filters.collection) params.collection = filters.collection;
  if (filters.edition) params.edition = filters.edition;
  if (filters.festival) params.festival = filters.festival;
  if (filters.tag) params.tag = filters.tag;
  if (filters.material) params.material = filters.material;
  if (filters.minPrice !== undefined) params.min = filters.minPrice.toString();
  if (filters.maxPrice !== undefined) params.max = filters.maxPrice.toString();
  if (filters.availability && filters.availability !== 'all') params.availability = filters.availability;
  if (filters.sort && filters.sort !== 'latest') params.sort = filters.sort;
  if (filters.page && filters.page > 1) params.page = filters.page.toString();
  if (filters.limit && filters.limit !== 12) params.limit = filters.limit.toString();

  return params;
}
export default parseProductFilters;
