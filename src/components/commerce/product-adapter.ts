export interface UnifiedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  images: string[];
  badges?: string[];
  inStock?: boolean;
  status?: string;
  quantity?: number;
  isNew?: boolean;
  imageUrl?: string;
  attributes?: Array<{ name: string; value: string }>;
}

/**
 * Normalizes any raw product model (ProductCardModel, CatalogProduct, ProductData)
 * into a standard UnifiedProduct structure used by the e-commerce product card system.
 */
export function normalizeProduct(product: any): UnifiedProduct {
  if (!product) {
    return {
      id: '',
      name: 'Product',
      slug: '',
      price: 0,
      images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop'],
    };
  }

  const rawPrice = product.price;
  const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0;

  const rawCompare = product.compareAtPrice;
  const compareAtPrice =
    rawCompare !== undefined && rawCompare !== null && rawCompare !== ''
      ? typeof rawCompare === 'number'
        ? rawCompare
        : parseFloat(rawCompare)
      : undefined;

  let images: string[] = [];
  if (Array.isArray(product.images)) {
    images = product.images
      .map((img: any) => (typeof img === 'string' ? img : img?.url))
      .filter(Boolean);
  }
  if (images.length === 0 && product.imageUrl) {
    images = [product.imageUrl];
  }
  // When no image is present, keep images as empty array so UI shows proper 'No Image Found' fallback

  const category = product.category || product.categoryName || undefined;

  const rating =
    product.rating !== undefined && product.rating !== null ? Number(product.rating) : undefined;
  const reviewCount =
    product.reviewCount !== undefined
      ? Number(product.reviewCount)
      : product.reviewsCount !== undefined
      ? Number(product.reviewsCount)
      : undefined;

  let badges: string[] = [];
  if (Array.isArray(product.badges)) {
    badges = [...product.badges];
  } else {
    if (product.isNew) badges.push('NEW');
  }

  const quantity = typeof product.quantity === 'number' ? product.quantity : 10;
  const inStock =
    product.inStock !== undefined
      ? Boolean(product.inStock)
      : product.status !== 'out_of_stock' && quantity > 0;

  return {
    id: String(product.id || ''),
    name: String(product.name || 'Untitled Product'),
    slug: String(product.slug || ''),
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
    category,
    rating,
    reviewCount,
    images,
    badges,
    inStock,
    status: product.status || (inStock ? 'active' : 'out_of_stock'),
    quantity,
    isNew: Boolean(product.isNew),
    imageUrl: images[0],
    attributes: product.attributes || [],
  };
}
