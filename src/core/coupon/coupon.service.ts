import { couponRepository } from './coupon.repository';
import { type Coupon } from '../cart/cart.types';

export interface CartItemAttributeInput {
  productId: string;
  variantId?: string | null;
  name?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon | null;
  error?: string;
  qualifyingProductIds?: string[];
}

/**
 * CouponService handles database verification and attribute-based eligibility analysis
 * for coupons, festive promotional drops, and limited edition items.
 */
export class CouponService {
  /**
   * Validates code against database and verifies attribute eligibility if cart items are provided.
   */
  async validateCoupon(
    code: string,
    items?: CartItemAttributeInput[]
  ): Promise<Coupon | null> {
    const result = await this.validateCouponDetailed(code, items);
    return result.valid ? result.coupon : null;
  }

  /**
   * Detailed coupon verification returning eligibility analysis and human-readable feedback.
   */
  async validateCouponDetailed(
    code: string,
    items?: CartItemAttributeInput[]
  ): Promise<CouponValidationResult> {
    try {
      const dbCoupon = await couponRepository.findByCode(code);
      if (!dbCoupon) {
        return {
          valid: false,
          coupon: null,
          error: 'Invalid, inactive, or expired coupon code.',
        };
      }

      const couponObj: Coupon = {
        code: dbCoupon.code,
        type: dbCoupon.discountType,
        value: parseFloat(dbCoupon.discountValue),
        minOrderValue: dbCoupon.minOrderValue ? parseFloat(dbCoupon.minOrderValue) : null,
        maxDiscountValue: dbCoupon.maxDiscountValue ? parseFloat(dbCoupon.maxDiscountValue) : null,
      };

      // If no items provided or cart is empty, return standard validation
      if (!items || items.length === 0) {
        return { valid: true, coupon: couponObj };
      }

      const productIds = items.map((i) => i.productId).filter(Boolean);
      const attributes = await couponRepository.getProductAttributes(productIds);

      // Check explicit metadata attribute constraints
      const meta = dbCoupon.metadata || {};
      const requiredAttrName = (meta.targetAttributeName || meta.requiredAttributeName || '').toLowerCase();
      const requiredAttrVal = (meta.targetAttributeValue || meta.requiredAttributeValue || '').toLowerCase();

      // Check coupon code pattern heuristics
      const upperCode = dbCoupon.code.toUpperCase();
      const isFestiveCoupon =
        requiredAttrName === 'festival' ||
        upperCode.includes('DIWALI') ||
        upperCode.includes('FESTIVE') ||
        upperCode.includes('HOLIDAY');

      const isLimitedCoupon =
        requiredAttrName === 'edition' ||
        upperCode.includes('LIMITED') ||
        upperCode.includes('EXCLUSIVE');

      if (requiredAttrName || isFestiveCoupon || isLimitedCoupon) {
        const qualifyingProductIds: string[] = [];

        for (const item of items) {
          const itemAttrs = attributes.filter((a) => a.productId === item.productId);

          let matches = false;
          if (requiredAttrName) {
            matches = itemAttrs.some(
              (a) =>
                a.attributeName.toLowerCase() === requiredAttrName &&
                (!requiredAttrVal || a.attributeValue.toLowerCase().includes(requiredAttrVal))
            );
          } else if (isFestiveCoupon) {
            matches = itemAttrs.some(
              (a) =>
                a.attributeName.toLowerCase().includes('festival') ||
                a.attributeValue.toLowerCase().includes('diwali') ||
                a.attributeValue.toLowerCase().includes('festive') ||
                a.attributeValue.toLowerCase().includes('christmas')
            );
          } else if (isLimitedCoupon) {
            matches = itemAttrs.some(
              (a) =>
                a.attributeName.toLowerCase().includes('edition') ||
                a.attributeValue.toLowerCase().includes('limited') ||
                a.attributeValue.toLowerCase().includes('exclusive')
            );
          }

          if (matches) {
            qualifyingProductIds.push(item.productId);
          }
        }

        if (qualifyingProductIds.length === 0) {
          const requirementDesc = isFestiveCoupon
            ? 'Festival (e.g. Diwali / Festive)'
            : isLimitedCoupon
            ? 'Edition: Limited Edition'
            : `${meta.targetAttributeName || 'required attribute'}`;

          return {
            valid: false,
            coupon: null,
            error: `Coupon "${dbCoupon.code}" is only applicable to products with the "${requirementDesc}" attribute.`,
          };
        }

        return {
          valid: true,
          coupon: {
            ...couponObj,
            qualifyingProductIds,
          },
          qualifyingProductIds,
        };
      }

      return {
        valid: true,
        coupon: couponObj,
      };
    } catch (err: any) {
      console.error('Error validating coupon with attributes:', err);
      return {
        valid: false,
        coupon: null,
        error: err.message || 'Failed to validate promotional coupon.',
      };
    }
  }
}

export const couponService = new CouponService();
export default couponService;
