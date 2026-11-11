'use server';

import { couponService, type CartItemAttributeInput, type CouponValidationResult } from '@/core/coupon/coupon.service';
import { type Coupon } from '@/core/cart/cart.types';

/**
 * Server action to validate a coupon code, evaluating attribute-based eligibility against cart items.
 */
export async function validateCouponAction(
  code: string,
  items?: CartItemAttributeInput[]
): Promise<Coupon | null> {
  return await couponService.validateCoupon(code, items);
}

/**
 * Server action to validate a coupon code with full human-readable error messages and eligibility checks.
 */
export async function validateCouponDetailedAction(
  code: string,
  items?: CartItemAttributeInput[]
): Promise<CouponValidationResult> {
  return await couponService.validateCouponDetailed(code, items);
}
