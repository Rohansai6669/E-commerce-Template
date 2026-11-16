import { type ProductData } from '@/components/commerce/configurable-product-card';
import { type BreadcrumbItem } from '@/components/navigation/Breadcrumb/breadcrumb';
import { resolveHierarchicalCatalog } from './hierarchical-catalog';

export interface CategoryPageMeta {
  title: string;
  breadcrumb: string;
  description: string;
  subtags: Array<string | { label: string; href?: string; slug?: string }>;
  breadcrumbs?: BreadcrumbItem[];
  subtitle?: string;
  heroImage?: string | null;
}

/**
 * Fetches products for a category, subcategory, or child directly from PostgreSQL.
 * Supports infinite depth stacked taxonomy (e.g. Men/Streetwear/Oversized-Shirt).
 */
export async function fetchCategoryProducts(
  categorySlug: string,
  subcategorySlug?: string,
  childSlugOrSort?: string,
  sortParam?: string
): Promise<{ items: ProductData[]; meta: CategoryPageMeta }> {
  // Disambiguate arguments: (category, subcategory, sort) vs (category, subcategory, child, sort)
  let childSlug: string | undefined;
  let sort = 'newest';

  if (sortParam) {
    childSlug = childSlugOrSort;
    sort = sortParam;
  } else if (childSlugOrSort) {
    if (['newest', 'price-low', 'price-high'].includes(childSlugOrSort)) {
      sort = childSlugOrSort;
    } else {
      childSlug = childSlugOrSort;
    }
  }

  const segments = [categorySlug];
  if (subcategorySlug) segments.push(subcategorySlug);
  if (childSlug) segments.push(childSlug);

  const { resolution, items } = await resolveHierarchicalCatalog(segments, sort);

  return {
    items,
    meta: {
      title: resolution.pageTitle,
      subtitle: resolution.pageSubtitle,
      breadcrumb: resolution.breadcrumbString,
      description: resolution.pageDescription,
      subtags: resolution.subtags,
      breadcrumbs: resolution.breadcrumbs,
      heroImage: resolution.heroImage,
    },
  };
}
