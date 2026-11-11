export type ProductSort = 'price-asc' | 'price-desc' | 'latest' | 'rating-desc' | 'popular';

export interface FacetOption {
  label: string;
  value: string;
  count: number;
}

export interface FilterFacets {
  categories: FacetOption[];
  brands: FacetOption[];
  genders: FacetOption[];
  collections: FacetOption[];
  editions: FacetOption[];
  festivals: FacetOption[];
  materials: FacetOption[];
  priceRange: {
    min: number;
    max: number;
  };
  inStockCount: number;
  totalProducts: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'in-stock' | 'out-of-stock' | 'all';
  gender?: string;
  fit?: string;
  pattern?: string;
  season?: string;
  collection?: string;
  occasion?: string;
  material?: string;
  edition?: string;
  festival?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sort?: ProductSort;
  visibility?: 'public' | 'admin';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductCardModel {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  status: string;
  quantity: number;
  imageUrl: string | null;
  images?: string[];
  rating: number | null;
  reviewsCount: number;
  isNew: boolean;
  categoryName: string | null;
  brandName: string | null;
  gender: string | null;
  fit: string | null;
  season: string | null;
  attributes?: Array<{ name: string; value: string }>;
}

export interface StorefrontVariant {
  id: string;
  sku: string;
  price: number | null;
  compareAtPrice: number | null;
  quantity: number;
  options: Record<string, string>; // Maps option name to value (e.g. Size: "L", Color: "Red")
}

export interface SizeChartGrid {
  title?: string;
  unit?: 'inches' | 'cm';
  columns: string[]; // e.g. ["Size", "Bust", "Waist", "Hips", "Length"]
  rows: Record<string, string>[]; // e.g. [{ Size: "S", Bust: "34", Waist: "28", Hips: "36" }]
}

export interface ProductDetailModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  status: string;
  quantity: number;
  isNew: boolean;
  rating: number | null;
  reviewsCount: number;
  categoryName: string | null;
  categorySlug: string | null;
  brandName: string | null;
  brandSlug: string | null;

  // Fashion Attributes
  gender: string | null;
  material: string | null;
  fit: string | null;
  pattern: string | null;
  season: string | null;
  collection: string | null;
  occasion: string | null;
  careInstructions: string | null;
  countryOfOrigin: string | null;
  sizeChart: SizeChartGrid | null;

  images: Array<{
    id?: string;
    url: string;
    altText?: string | null;
    variantId?: string | null;
    isPrimary?: boolean;
  }>;
  variants: StorefrontVariant[];
  options: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      value: string;
      colorHex?: string | null;
    }>;
  }>;
  metadata: Record<string, unknown>;
}
