import { type ProductCardModel, type ProductDetailModel, type StorefrontVariant, type SizeChartGrid } from './product.types';

/**
 * ProductMapper flattens Drizzle join rows into clean view-facing models.
 */
export class ProductMapper {
  /**
   * Translates database catalog rows into ProductCardModel.
   */
  static toProductCardModel(row: {
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      compareAtPrice?: string | null;
      status: string;
      imageUrl?: string | null;
      createdAt: Date;
      gender?: string | null;
      fit?: string | null;
      season?: string | null;
    };
    category?: { name: string } | null;
    brand?: { name: string } | null;
    quantity: number;
    rating: number | null;
    reviewsCount: number;
    primaryImage?: string | null;
    images?: string[];
    attributes?: Array<{ name: string; value: string }>;
  }): ProductCardModel {
    const { product, category, brand, quantity, rating, reviewsCount, attributes } = row;

    const isNew =
      new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

    const primaryImg = (row as any).primaryImage || product.imageUrl || null;
    const rawImages: string[] =
      (row as any).images && Array.isArray((row as any).images) && (row as any).images.length > 0
        ? (row as any).images
        : primaryImg
        ? [primaryImg]
        : [];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
      status: product.status,
      quantity,
      imageUrl: primaryImg,
      images: rawImages,
      rating,
      reviewsCount,
      isNew,
      categoryName: category?.name || null,
      brandName: brand?.name || null,
      gender: product.gender || null,
      fit: product.fit || null,
      season: product.season || null,
      attributes: attributes || [],
    };
  }

  /**
   * Translates database detailed catalog maps into ProductDetailModel.
   */
  static toProductDetailModel(data: {
    product: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      price: string;
      compareAtPrice?: string | null;
      status: string;
      createdAt: Date;
      gender?: string | null;
      material?: string | null;
      fit?: string | null;
      pattern?: string | null;
      season?: string | null;
      collection?: string | null;
      occasion?: string | null;
      careInstructions?: string | null;
      countryOfOrigin?: string | null;
      sizeChart?: unknown;
      metadata?: unknown;
    };
    category?: { name: string; slug: string } | null;
    brand?: { name: string; slug: string } | null;
    quantity: number;
    rating: number | null;
    reviewsCount: number;
    images: Array<{ id?: string; url: string; altText?: string | null; variantId?: string | null; isPrimary?: boolean }>;
    variants: Array<{ id: string; sku: string; price?: string | null; compareAtPrice?: string | null }>;
    options: Array<{ id: string; name: string }>;
    optionValues: Array<{ id: string; optionId: string; value: string; colorHex?: string | null }>;
    variantOptionsList: Array<{
      variantOption: { variantId: string; optionValueId: string };
      optionValue: { value: string } | null;
      option: { name: string } | null;
    }>;
    inventoryList: Array<{ variantId: string | null; quantity: number }>;
  }): ProductDetailModel {
    const {
      product,
      category,
      brand,
      quantity,
      rating,
      reviewsCount,
      images,
      variants,
      options,
      optionValues,
      variantOptionsList,
      inventoryList,
    } = data;

    const isNew =
      new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

    // 1. Map variants with custom options and inventory counts
    const mappedVariants: StorefrontVariant[] = variants.map((v) => {
      const stockItem = inventoryList.find((inv) => inv.variantId === v.id);
      const variantQty = stockItem ? stockItem.quantity : 0;

      const optionsDict: Record<string, string> = {};
      const relativeOptions = variantOptionsList.filter((vo) => vo.variantOption.variantId === v.id);
      relativeOptions.forEach((ro) => {
        if (ro.option?.name && ro.optionValue?.value) {
          optionsDict[ro.option.name] = ro.optionValue.value;
        }
      });

      return {
        id: v.id,
        sku: v.sku,
        price: v.price ? parseFloat(v.price) : null,
        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
        quantity: variantQty,
        options: optionsDict,
      };
    });

    // 2. Map options and nest option values
    const mappedOptions = options.map((opt) => {
      const values = optionValues
        .filter((val) => val.optionId === opt.id)
        .map((val) => ({
          id: val.id,
          value: val.value,
          colorHex: val.colorHex || null,
        }));

      return {
        id: opt.id,
        name: opt.name,
        values,
      };
    });

    let parsedSizeChart: SizeChartGrid | null = null;
    if (product.sizeChart && typeof product.sizeChart === 'object') {
      parsedSizeChart = product.sizeChart as SizeChartGrid;
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price),
      compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
      status: product.status,
      quantity,
      isNew,
      rating,
      reviewsCount,
      categoryName: category?.name || null,
      categorySlug: category?.slug || null,
      brandName: brand?.name || null,
      brandSlug: brand?.slug || null,

      // Fashion Specification Attributes
      gender: product.gender || null,
      material: product.material || null,
      fit: product.fit || null,
      pattern: product.pattern || null,
      season: product.season || null,
      collection: product.collection || null,
      occasion: product.occasion || null,
      careInstructions: product.careInstructions || null,
      countryOfOrigin: product.countryOfOrigin || null,
      sizeChart: parsedSizeChart,

      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || null,
        variantId: img.variantId || null,
        isPrimary: img.isPrimary || false,
      })),
      variants: mappedVariants,
      options: mappedOptions,
      metadata: product.metadata && typeof product.metadata === 'object'
        ? (product.metadata as Record<string, unknown>)
        : {},
    };
  }
}
export default ProductMapper;
