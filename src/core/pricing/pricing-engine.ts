export interface PriceCalculationParams {
  basePrice: number;
  productId?: string;
  categoryId?: string;
  collectionIds?: string[];
  variantId?: string;
  activeCampaigns?: Array<{
    id: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    priority: number;
    isStackable?: boolean;
    metadata?: Record<string, any>;
  }>;
  activeOffers?: Array<{
    id: string;
    title: string;
    productId?: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    priority: number;
    isStackable?: boolean;
  }>;
  coupon?: {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscountValue?: number;
    minOrderValue?: number;
    metadata?: Record<string, any>;
  };
}

export interface PriceCalculationResult {
  basePrice: number;
  saleDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  finalPrice: number;
  appliedCampaign?: { id: string; name: string };
  appliedOffer?: { id: string; title: string };
  appliedCoupon?: { id: string; code: string };
}

/**
 * Central Pricing Engine
 * 
 * Single Source of Truth for calculating item pricing, promotions, discounts, and coupon application rules across PDP, Cart, Checkout, and Orders.
 * Supports targeted product, category, and collection rules.
 */
export class PricingEngine {
  /**
   * Evaluates whether a product is eligible for a candidate campaign, offer, or coupon.
   */
  static isProductEligible(
    candidate: {
      productId?: string;
      metadata?: Record<string, any>;
    },
    product: {
      id?: string;
      categoryId?: string;
      collectionIds?: string[];
    }
  ): boolean {
    // 1. If offer/campaign specifies a target productId
    if (candidate.productId && product.id && candidate.productId !== product.id) {
      return false;
    }

    const meta = candidate.metadata || {};

    // 2. If metadata specifies targetProductIds array
    if (Array.isArray(meta.targetProductIds) && meta.targetProductIds.length > 0 && product.id) {
      if (!meta.targetProductIds.includes(product.id)) {
        return false;
      }
    }

    // 3. If metadata specifies targetCategoryIds array
    if (Array.isArray(meta.targetCategoryIds) && meta.targetCategoryIds.length > 0) {
      if (!product.categoryId || !meta.targetCategoryIds.includes(product.categoryId)) {
        return false;
      }
    }

    // 4. If metadata specifies targetCollectionIds array
    if (Array.isArray(meta.targetCollectionIds) && meta.targetCollectionIds.length > 0) {
      const productCols = product.collectionIds || [];
      const hasMatchingCollection = meta.targetCollectionIds.some((colId: string) => productCols.includes(colId));
      if (!hasMatchingCollection) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculates the final unit price deterministically.
   */
  static calculatePrice(params: PriceCalculationParams): PriceCalculationResult {
    const { basePrice, productId, categoryId, collectionIds, activeCampaigns = [], activeOffers = [], coupon } = params;

    if (basePrice <= 0) {
      return {
        basePrice: 0,
        saleDiscount: 0,
        couponDiscount: 0,
        totalDiscount: 0,
        finalPrice: 0,
      };
    }

    let currentPrice = basePrice;
    let saleDiscount = 0;
    let appliedCampaign: { id: string; name: string } | undefined;
    let appliedOffer: { id: string; title: string } | undefined;

    // Filter candidate campaigns and offers by eligibility
    const eligibleCampaigns = activeCampaigns.filter((c) =>
      PricingEngine.isProductEligible({ metadata: c.metadata }, { id: productId, categoryId, collectionIds })
    );

    const eligibleOffers = activeOffers.filter((o) =>
      PricingEngine.isProductEligible({ productId: o.productId || undefined }, { id: productId, categoryId, collectionIds })
    );

    // Combine eligible campaigns and offers into a single prioritized array
    const candidates = [
      ...eligibleCampaigns.map((c) => ({ ...c, type: 'campaign' as const })),
      ...eligibleOffers.map((o) => ({ ...o, type: 'offer' as const })),
    ].sort((a, b) => b.priority - a.priority);

    // Pick highest priority eligible candidate
    if (candidates.length > 0) {
      const topCandidate = candidates[0];
      if (topCandidate.discountType === 'percentage') {
        saleDiscount = Math.min(basePrice, (basePrice * topCandidate.discountValue) / 100);
      } else {
        saleDiscount = Math.min(basePrice, topCandidate.discountValue);
      }

      currentPrice = Math.max(0, basePrice - saleDiscount);

      if (topCandidate.type === 'campaign') {
        appliedCampaign = { id: topCandidate.id, name: topCandidate.name };
      } else {
        appliedOffer = { id: topCandidate.id, title: topCandidate.title };
      }
    }

    // Apply Coupon if present and product is eligible
    let couponDiscount = 0;
    let appliedCoupon: { id: string; code: string } | undefined;

    if (coupon && currentPrice > 0) {
      const isCouponEligible = PricingEngine.isProductEligible(
        { metadata: coupon.metadata },
        { id: productId, categoryId, collectionIds }
      );

      if (isCouponEligible) {
        const minOrder = coupon.minOrderValue || 0;
        if (basePrice >= minOrder) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (currentPrice * coupon.discountValue) / 100;
          } else {
            couponDiscount = Math.min(currentPrice, coupon.discountValue);
          }

          if (coupon.maxDiscountValue && coupon.maxDiscountValue > 0) {
            couponDiscount = Math.min(couponDiscount, coupon.maxDiscountValue);
          }

          couponDiscount = Math.min(currentPrice, couponDiscount);
          appliedCoupon = { id: coupon.id, code: coupon.code };
        }
      }
    }

    const totalDiscount = saleDiscount + couponDiscount;
    const finalPrice = Math.max(0, basePrice - totalDiscount);

    return {
      basePrice,
      saleDiscount,
      couponDiscount,
      totalDiscount,
      finalPrice,
      appliedCampaign,
      appliedOffer,
      appliedCoupon,
    };
  }
}
