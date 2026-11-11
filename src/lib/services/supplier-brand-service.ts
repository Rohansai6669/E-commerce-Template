import { db } from '@/lib/db';
import { supplierBrandPermissions } from '@/lib/db/schema/catalog/supplier-products';
import { eq, and } from 'drizzle-orm';

export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Service to manage and enforce Supplier-Brand fulfillment relationships.
 */
export const SupplierBrandService = {
  /**
   * Checks if a supplier is authorized to stock/fulfill products of a specific brand.
   * If brandId is empty/null, authorization is granted by default (unbranded product).
   */
  async isSupplierAuthorizedForBrand(
    supplierId: string,
    brandId?: string | null,
    client: DbClient = db
  ): Promise<boolean> {
    if (!brandId) return true;
    if (!supplierId) return false;

    const [permission] = await client
      .select({ supplierId: supplierBrandPermissions.supplierId })
      .from(supplierBrandPermissions)
      .where(
        and(
          eq(supplierBrandPermissions.supplierId, supplierId),
          eq(supplierBrandPermissions.brandId, brandId)
        )
      )
      .limit(1);

    return !!permission;
  },

  /**
   * Asserts that a supplier is authorized to fulfill products for a brand.
   * Throws an explicit error if unauthorized, enforcing the hard business invariant.
   */
  async assertSupplierAuthorizedForBrand(
    supplierId: string,
    brandId?: string | null,
    client: DbClient = db
  ): Promise<void> {
    if (!brandId) return;

    const isAuthorized = await this.isSupplierAuthorizedForBrand(supplierId, brandId, client);
    if (!isAuthorized) {
      throw new Error(`Business Invariant Violation: Supplier is not authorized to fulfill products for brand "${brandId}".`);
    }
  },

  /**
   * Atomically synchronizes the suppliers authorized to fulfill a brand.
   * Uses optional transaction parameter 'client'. If not provided, creates its own transaction.
   */
  async syncBrandSuppliers(
    brandId: string,
    supplierIds: string[],
    client?: DbClient
  ): Promise<void> {
    const runInTx = async (tx: DbClient) => {
      // 1. Clear existing assignments for this brand
      await tx
        .delete(supplierBrandPermissions)
        .where(eq(supplierBrandPermissions.brandId, brandId));

      // 2. Insert new assignments if any supplierIds provided
      if (supplierIds && supplierIds.length > 0) {
        const uniqueSupplierIds = Array.from(new Set(supplierIds.filter(Boolean)));
        if (uniqueSupplierIds.length > 0) {
          await tx.insert(supplierBrandPermissions).values(
            uniqueSupplierIds.map((supplierId) => ({
              brandId,
              supplierId,
            }))
          );
        }
      }
    };

    if (client) {
      await runInTx(client);
    } else {
      await db.transaction(async (tx) => {
        await runInTx(tx);
      });
    }
  },

  /**
   * Atomically synchronizes the brands a supplier is authorized to fulfill.
   * Uses optional transaction parameter 'client'. If not provided, creates its own transaction.
   */
  async syncSupplierBrands(
    supplierId: string,
    brandIds: string[],
    client?: DbClient
  ): Promise<void> {
    const runInTx = async (tx: DbClient) => {
      // 1. Clear existing brand assignments for this supplier
      await tx
        .delete(supplierBrandPermissions)
        .where(eq(supplierBrandPermissions.supplierId, supplierId));

      // 2. Insert new assignments if any brandIds provided
      if (brandIds && brandIds.length > 0) {
        const uniqueBrandIds = Array.from(new Set(brandIds.filter(Boolean)));
        if (uniqueBrandIds.length > 0) {
          await tx.insert(supplierBrandPermissions).values(
            uniqueBrandIds.map((brandId) => ({
              supplierId,
              brandId,
            }))
          );
        }
      }
    };

    if (client) {
      await runInTx(client);
    } else {
      await db.transaction(async (tx) => {
        await runInTx(tx);
      });
    }
  },

  /**
   * Retrieves list of supplier IDs authorized for a given brand.
   */
  async getAuthorizedSuppliersForBrand(
    brandId: string,
    client: DbClient = db
  ): Promise<string[]> {
    const rows = await client
      .select({ supplierId: supplierBrandPermissions.supplierId })
      .from(supplierBrandPermissions)
      .where(eq(supplierBrandPermissions.brandId, brandId));

    return rows.map((r) => r.supplierId);
  },

  /**
   * Retrieves list of brand IDs authorized for a given supplier.
   */
  async getAuthorizedBrandsForSupplier(
    supplierId: string,
    client: DbClient = db
  ): Promise<string[]> {
    const rows = await client
      .select({ brandId: supplierBrandPermissions.brandId })
      .from(supplierBrandPermissions)
      .where(eq(supplierBrandPermissions.supplierId, supplierId));

    return rows.map((r) => r.brandId);
  },

  /**
   * Fetches all supplier-brand permission links across the catalog.
   */
  async getAllSupplierBrandPermissions(
    client: DbClient = db
  ): Promise<Array<{ supplierId: string; brandId: string }>> {
    return await client
      .select({
        supplierId: supplierBrandPermissions.supplierId,
        brandId: supplierBrandPermissions.brandId,
      })
      .from(supplierBrandPermissions);
  },
};
