import { db } from '@/lib/db';
import { supplierProductVariants } from '@/lib/db/schema/catalog/supplier-product-variants';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { supplierInventory } from '@/lib/db/schema/marketplace/supplier-inventory';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { SupplierBrandService } from './supplier-brand-service';
import { eq, and, gte, sql } from 'drizzle-orm';

export interface CandidateSupplierScore {
  supplierId: string;
  supplierProductVariantId: string;
  costPrice: number;
  sellingPrice: number;
  leadTimeDays: number;
  availableStock: number;
  score: number;
  breakdown: {
    costScore: number;
    slaScore: number;
    stockScore: number;
    priorityScore: number;
  };
}

export const ROUTING_WEIGHTS = {
  cost: 0.40,
  sla: 0.30,
  stock: 0.15,
  priority: 0.15,
};

export class SupplierRoutingService {
  /**
   * Ranks candidate suppliers for a given variant and required quantity using normalized 0-100 scoring.
   * Differentiates stock coverage (1x-5x+), cost, SLA lead time, and supplier priority.
   */
  async rankSupplierCandidates(
    variantId: string,
    brandId: string,
    quantity: number,
    client: any = db
  ): Promise<CandidateSupplierScore[]> {
    // 1. Query all active candidate supplier variant records for variantId
    const candidates = await client
      .select({
        supplierId: supplierProducts.supplierId,
        supplierProductVariantId: supplierProductVariants.id,
        costPrice: supplierProductVariants.costPrice,
        sellingPrice: supplierProductVariants.sellingPrice,
        leadTime: supplierProductVariants.leadTime,
        available: supplierInventory.available,
        isActive: supplierProductVariants.isActive,
      })
      .from(supplierProductVariants)
      .innerJoin(supplierProducts, eq(supplierProductVariants.supplierProductId, supplierProducts.id))
      .innerJoin(supplierInventory, eq(supplierInventory.supplierProductVariantId, supplierProductVariants.id))
      .where(
        and(
          eq(supplierProductVariants.variantId, variantId),
          eq(supplierProductVariants.isActive, true),
          gte(supplierInventory.available, quantity)
        )
      );

    if (candidates.length === 0) {
      return [];
    }

    // 2. Filter candidates by brand authorization boundary
    const authorizedCandidates = [];
    for (const cand of candidates) {
      const isAuth = await SupplierBrandService.isSupplierAuthorizedForBrand(cand.supplierId, brandId, client);
      if (isAuth) {
        authorizedCandidates.push(cand);
      }
    }

    if (authorizedCandidates.length === 0) {
      return [];
    }

    // 3. Compute normalized scores across eligible candidate set
    const minCost = Math.min(...authorizedCandidates.map((c) => Number(c.costPrice)));
    const minSla = Math.min(...authorizedCandidates.map((c) => c.leadTime));

    const scored: CandidateSupplierScore[] = authorizedCandidates.map((c) => {
      const cost = Number(c.costPrice);
      const costScore = cost > 0 ? (minCost / cost) * 100 : 100;
      const slaScore = c.leadTime > 0 ? (minSla / c.leadTime) * 100 : 100;

      // Stock coverage score: min(available / quantity, 5.0) / 5.0 * 100
      const coverageRatio = c.available / quantity;
      const stockScore = (Math.min(coverageRatio, 5.0) / 5.0) * 100;

      const priorityScore = 100; // Baseline priority score

      const score =
        costScore * ROUTING_WEIGHTS.cost +
        slaScore * ROUTING_WEIGHTS.sla +
        stockScore * ROUTING_WEIGHTS.stock +
        priorityScore * ROUTING_WEIGHTS.priority;

      return {
        supplierId: c.supplierId,
        supplierProductVariantId: c.supplierProductVariantId,
        costPrice: Number(c.costPrice),
        sellingPrice: Number(c.sellingPrice),
        leadTimeDays: c.leadTime,
        availableStock: c.available,
        score,
        breakdown: {
          costScore,
          slaScore,
          stockScore,
          priorityScore,
        },
      };
    });

    // 4. Deterministic sorting: score DESC, leadTime ASC, costPrice ASC, supplierId ASC
    scored.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.001) return b.score - a.score;
      if (a.leadTimeDays !== b.leadTimeDays) return a.leadTimeDays - b.leadTimeDays;
      if (a.costPrice !== b.costPrice) return a.costPrice - b.costPrice;
      return a.supplierId.localeCompare(b.supplierId);
    });

    return scored;
  }
}

export const supplierRoutingService = new SupplierRoutingService();
