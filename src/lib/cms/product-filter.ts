import { type ProductData } from '@/components/commerce/configurable-product-card';

export interface AttributeFilterCriteria {
  productSource?: string;
  filterCategory?: string;
  filterSubcategory?: string;
  filterGender?: string;
  filterBrand?: string;
  filterSeason?: string;
  filterFit?: string;
  filterMaterial?: string;
  filterOccasion?: string;
  filterAvailability?: string;
  filterMinPrice?: number;
  filterMaxPrice?: number;
  attributeName?: string;
  attributeValue?: string;
  sortBy?: string;
  maxProducts?: number;
  [key: string]: any;
}

export const GENDER_FILTER_OPTIONS = [
  { label: 'All Audiences', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids & Teens', value: 'kids' },
  { label: 'Unisex', value: 'unisex' },
];

export const FIT_FILTER_OPTIONS = [
  { label: 'All Fits', value: 'all' },
  { label: 'Regular Fit', value: 'Regular Fit' },
  { label: 'Slim Fit', value: 'Slim Fit' },
  { label: 'Oversized', value: 'Oversized' },
  { label: 'Relaxed Fit', value: 'Relaxed Fit' },
  { label: 'Tailored Fit', value: 'Tailored' },
  { label: 'Athletic Fit', value: 'Athletic' },
];

export const SEASON_FILTER_OPTIONS = [
  { label: 'All Seasons', value: 'all' },
  { label: 'Spring / Summer', value: 'Spring/Summer' },
  { label: 'Autumn / Winter', value: 'Autumn/Winter' },
  { label: 'Resort Collection', value: 'Resort' },
  { label: 'Festive & Holiday', value: 'Festive' },
  { label: 'All Season Essentials', value: 'All Season' },
];

export const MATERIAL_FILTER_OPTIONS = [
  { label: 'All Materials', value: 'all' },
  { label: '100% Organic Cotton', value: 'Cotton' },
  { label: 'Mulberry Silk & Satin', value: 'Silk' },
  { label: 'Japanese Selvedge Denim', value: 'Denim' },
  { label: 'Virgin Italian Wool', value: 'Wool' },
  { label: 'Pure Mongolian Cashmere', value: 'Cashmere' },
  { label: 'Breezy Natural Linen', value: 'Linen' },
  { label: 'Full Grain Leather', value: 'Leather' },
];

export const OCCASION_FILTER_OPTIONS = [
  { label: 'All Occasions', value: 'all' },
  { label: 'Casual & Daily', value: 'Casual' },
  { label: 'Formal & Black Tie', value: 'Formal' },
  { label: 'Workwear & Office', value: 'Workwear' },
  { label: 'Party & Celebration', value: 'Party' },
  { label: 'Urban Streetwear', value: 'Streetwear' },
  { label: 'Evening Soiree', value: 'Evening' },
  { label: 'Active & Gym', value: 'Activewear' },
];

export const AVAILABILITY_FILTER_OPTIONS = [
  { label: 'All Stock Levels', value: 'all' },
  { label: 'In Stock Only', value: 'in_stock' },
];

export const SORT_FILTER_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Popularity & Rating', value: 'popularity' },
];

/**
 * Universal catalog product attribute evaluator for storefront and visual builder preview canvas.
 */
export function filterCatalogProducts(
  products: ProductData[] = [],
  config: AttributeFilterCriteria = {}
): ProductData[] {
  if (!products || products.length === 0) return [];

  let result = [...products];

  // 1. Category / Subcategory Filter
  const targetCategory =
    config.filterSubcategory ||
    config.filterCategory ||
    config.categoryId ||
    (config.productSource === 'category' ? config.sourceId : null);

  if (targetCategory && targetCategory !== 'all') {
    const target = targetCategory.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pCatName = (p.category || p.categoryName || '').toLowerCase().trim();
      const pCatId = (p.categoryId || '').toLowerCase().trim();
      const pCatSlug = (p.categorySlug || '').toLowerCase().trim();
      return (
        pCatName === target ||
        pCatId === target ||
        pCatSlug === target ||
        pCatName.includes(target) ||
        target.includes(pCatName && pCatName.length > 2 ? pCatName : '___nomatch___')
      );
    });
  }

  // 2. Gender Filter
  const targetGender = config.filterGender || config.gender;
  if (targetGender && targetGender !== 'all') {
    const target = targetGender.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pGender = (p.gender || '').toLowerCase().trim();
      const attrGender = p.attributes
        ?.find((a: any) => a.name?.toLowerCase().includes('gender'))
        ?.value?.toLowerCase()
        ?.trim();
      if (pGender === target || attrGender === target) return true;
      if (target === 'unisex' && (pGender === 'unisex' || attrGender === 'unisex' || !pGender)) return true;
      return false;
    });
  }

  // 3. Brand Filter
  const targetBrand =
    config.filterBrand ||
    config.brand ||
    (config.productSource === 'brand' ? config.sourceId : null);

  if (targetBrand && targetBrand !== 'all') {
    const target = targetBrand.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pBrandName = (p.brand || p.brandName || '').toLowerCase().trim();
      const pBrandId = (p.brandId || '').toLowerCase().trim();
      return (
        pBrandName === target ||
        pBrandId === target ||
        pBrandName.includes(target) ||
        target.includes(pBrandName && pBrandName.length > 2 ? pBrandName : '___nomatch___')
      );
    });
  }

  // 4. Fit Filter
  const targetFit = config.filterFit || config.fit;
  if (targetFit && targetFit !== 'all') {
    const target = targetFit.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pFit = (p.fit || '').toLowerCase().trim();
      const attrFit = p.attributes
        ?.find((a: any) => a.name?.toLowerCase().includes('fit'))
        ?.value?.toLowerCase()
        ?.trim();
      return pFit.includes(target) || target.includes(pFit) || attrFit?.includes(target);
    });
  }

  // 5. Season Filter
  const targetSeason = config.filterSeason || config.season;
  if (targetSeason && targetSeason !== 'all') {
    const target = targetSeason.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pSeason = (p.season || '').toLowerCase().trim();
      const attrSeason = p.attributes
        ?.find((a: any) => a.name?.toLowerCase().includes('season'))
        ?.value?.toLowerCase()
        ?.trim();
      return pSeason.includes(target) || target.includes(pSeason) || attrSeason?.includes(target);
    });
  }

  // 6. Material / Fabric Filter
  const targetMaterial = config.filterMaterial || config.material;
  if (targetMaterial && targetMaterial !== 'all') {
    const target = targetMaterial.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pMaterial = (p.material || '').toLowerCase().trim();
      const attrMaterial = p.attributes
        ?.find((a: any) => a.name?.toLowerCase().includes('material') || a.name?.toLowerCase().includes('fabric'))
        ?.value?.toLowerCase()
        ?.trim();
      return (
        pMaterial.includes(target) ||
        target.includes(pMaterial && pMaterial.length > 2 ? pMaterial : '___nomatch___') ||
        attrMaterial?.includes(target)
      );
    });
  }

  // 7. Occasion Filter
  const targetOccasion = config.filterOccasion || config.occasion;
  if (targetOccasion && targetOccasion !== 'all') {
    const target = targetOccasion.toLowerCase().trim();
    result = result.filter((p: any) => {
      const pOccasion = (p.occasion || '').toLowerCase().trim();
      const attrOccasion = p.attributes
        ?.find((a: any) => a.name?.toLowerCase().includes('occasion'))
        ?.value?.toLowerCase()
        ?.trim();
      return (
        pOccasion.includes(target) ||
        target.includes(pOccasion && pOccasion.length > 2 ? pOccasion : '___nomatch___') ||
        attrOccasion?.includes(target)
      );
    });
  }

  // 8. Availability Filter
  if (config.filterAvailability === 'in_stock' || config.filterAvailability === 'in-stock') {
    result = result.filter((p: any) => p.inStock === true || (typeof p.quantity === 'number' && p.quantity > 0));
  }

  // 9. Pre-configured Bundles (productSource)
  const source = config.productSource || 'all';
  if (source === 'offers') {
    result = result.filter(
      (p: any) =>
        (p.compareAtPrice && p.compareAtPrice > p.price) ||
        p.badges?.some((b: string) => b.toLowerCase().includes('off') || b.toLowerCase().includes('sale')) ||
        p.attributes?.some((a: any) => a.name?.toLowerCase().includes('offer') || a.value?.toLowerCase().includes('offer'))
    );
  } else if (source === 'festive') {
    result = result.filter((p: any) => {
      const hasFestiveBadge = p.badges?.some((b: string) =>
        ['festive', 'special', 'dussehra', 'diwali', 'holiday', 'christmas'].some((w) => b.toLowerCase().includes(w))
      );
      const hasFestiveAttr = p.attributes?.some((a: any) =>
        ['festive', 'special', 'dussehra', 'diwali', 'holiday', 'christmas'].some((w) =>
          a.name?.toLowerCase().includes(w) || a.value?.toLowerCase().includes(w)
        )
      );
      return hasFestiveBadge || hasFestiveAttr;
    });
  } else if (source === 'limited') {
    result = result.filter((p: any) => {
      const hasLimitedBadge = p.badges?.some((b: string) =>
        ['limited', 'exclusive'].some((w) => b.toLowerCase().includes(w))
      );
      const hasLimitedAttr = p.attributes?.some((a: any) =>
        ['edition', 'limited', 'exclusive'].some((w) =>
          a.name?.toLowerCase().includes(w) || a.value?.toLowerCase().includes(w)
        )
      );
      return hasLimitedBadge || hasLimitedAttr;
    });
  } else if (source === 'bestsellers') {
    result = result.filter(
      (p: any) =>
        p.badges?.some((b: string) => b.toLowerCase().includes('bestseller')) ||
        (p.rating && p.rating >= 4.8)
    );
  } else if (source === 'new_arrivals') {
    result = result.filter((p: any) => p.isNew || p.badges?.some((b: string) => b.toLowerCase().includes('new')));
  }

  // 10. Custom Named Attribute & Value Filter
  if (config.attributeName) {
    const targetAttrName = config.attributeName.toLowerCase().trim();
    const targetAttrVal = config.attributeValue ? config.attributeValue.toLowerCase().trim() : null;

    result = result.filter((p: any) => {
      const hasAttr = p.attributes?.some((a: any) => {
        const nameMatches = a.name?.toLowerCase() === targetAttrName;
        const valMatches = !targetAttrVal || a.value?.toLowerCase().includes(targetAttrVal);
        return nameMatches && valMatches;
      });
      return hasAttr;
    });
  }

  // 11. Sorting
  const sortBy = config.sortBy || 'newest';
  if (sortBy === 'price_asc') {
    result.sort((a: any, b: any) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    result.sort((a: any, b: any) => b.price - a.price);
  } else if (sortBy === 'popularity') {
    result.sort(
      (a: any, b: any) =>
        (b.reviewCount || b.reviewsCount || 0) - (a.reviewCount || a.reviewsCount || 0) ||
        (b.rating || 0) - (a.rating || 0)
    );
  }

  return result;
}

/**
 * Returns human-readable tags describing which attribute filters are currently active on a section.
 */
export function getProductFilterSummary(config: Record<string, any> = {}): string[] {
  const chips: string[] = [];

  if (config.filterCategory && config.filterCategory !== 'all') {
    chips.push(`Category: ${config.filterCategory}`);
  }
  if (config.filterSubcategory && config.filterSubcategory !== 'all') {
    chips.push(`Subcategory: ${config.filterSubcategory}`);
  }
  if (config.filterGender && config.filterGender !== 'all') {
    chips.push(`Gender: ${config.filterGender.toUpperCase()}`);
  }
  if (config.filterBrand && config.filterBrand !== 'all') {
    chips.push(`Brand: ${config.filterBrand}`);
  }
  if (config.filterFit && config.filterFit !== 'all') {
    chips.push(`Fit: ${config.filterFit}`);
  }
  if (config.filterSeason && config.filterSeason !== 'all') {
    chips.push(`Season: ${config.filterSeason}`);
  }
  if (config.filterMaterial && config.filterMaterial !== 'all') {
    chips.push(`Material: ${config.filterMaterial}`);
  }
  if (config.filterOccasion && config.filterOccasion !== 'all') {
    chips.push(`Occasion: ${config.filterOccasion}`);
  }
  if (config.filterAvailability === 'in_stock') {
    chips.push('In-Stock Only');
  }
  if (config.productSource && config.productSource !== 'all') {
    chips.push(`Bundle: ${config.productSource}`);
  }

  return chips;
}

