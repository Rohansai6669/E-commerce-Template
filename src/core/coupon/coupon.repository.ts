import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema/marketing';
import { productAttributes, productAttributeValues, globalAttributes, globalAttributeValues } from '@/lib/db/schema/catalog/variants';
import { eq, and, sql, inArray } from 'drizzle-orm';

export interface DbCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  currency: string;
  minOrderValue: string | null;
  maxDiscountValue: string | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  metadata?: any;
}

/**
 * CouponRepository handles database-backed verification and counts for promotional codes,
 * including checking attribute eligibility rules (festive, limited edition, offer tags).
 */
export class CouponRepository {
  /**
   * Retrieves active, non-expired coupon records from the database.
   */
  async findByCode(code: string): Promise<DbCoupon | null> {
    const uppercaseCode = code.trim().toUpperCase();

    const [row] = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, uppercaseCode),
          eq(coupons.isActive, true)
        )
      )
      .limit(1);

    if (!row) return null;

    const now = new Date();

    // Verify date constraints
    if (row.startDate && now < new Date(row.startDate)) {
      return null;
    }
    if (row.endDate && now > new Date(row.endDate)) {
      return null;
    }

    // Verify overall usage caps
    if (row.usageLimit !== null && row.usedCount >= row.usageLimit) {
      return null;
    }

    return {
      ...row,
      discountType: row.discountType as 'percentage' | 'fixed',
    };
  }

  /**
   * Retrieves all product attribute names and values for a given list of product IDs.
   */
  async getProductAttributes(
    productIds: string[]
  ): Promise<Array<{ productId: string; attributeName: string; attributeValue: string }>> {
    if (!productIds || productIds.length === 0) return [];

    try {
      return await db
        .select({
          productId: productAttributes.productId,
          attributeName: globalAttributes.name,
          attributeValue: globalAttributeValues.value,
        })
        .from(productAttributes)
        .innerJoin(globalAttributes, eq(productAttributes.attributeId, globalAttributes.id))
        .innerJoin(productAttributeValues, eq(productAttributeValues.productAttributeId, productAttributes.id))
        .innerJoin(globalAttributeValues, eq(productAttributeValues.attributeValueId, globalAttributeValues.id))
        .where(inArray(productAttributes.productId, productIds));
    } catch (err) {
      console.warn('Error fetching product attributes for coupon validation:', err);
      return [];
    }
  }

  /**
   * Increments the count of redemptions for a verified coupon.
   */
  async incrementUsedCount(couponId: string): Promise<void> {
    await db
      .update(coupons)
      .set({
        usedCount: sql`${coupons.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, couponId));
  }
}

export const couponRepository = new CouponRepository();
export default couponRepository;
