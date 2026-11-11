'use server';

import { db } from '@/lib/db';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { supplierProductVariants } from '@/lib/db/schema/catalog/supplier-product-variants';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { products } from '@/lib/db/schema/catalog/products';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import {
  globalAttributes,
  globalAttributeValues,
  productAttributes,
  productAttributeValues,
  productVariants,
  variantAttributeValues
} from '@/lib/db/schema/catalog/variants';
import { productImages } from '@/lib/db/schema/catalog/images';
import { inventory, inventoryMovements } from '@/lib/db/schema/inventory';
import { categories } from '@/lib/db/schema/catalog/categories';
import { productCategories } from '@/lib/db/schema/catalog/product-taxonomy';
import { brands } from '@/lib/db/schema/catalog/brands';
import { auditLogs } from '@/lib/db/schema/audit';
import { getCurrentProfile } from '@/core/auth/session';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Ensures caller is an Admin or Staff.
 */
async function enforceAdminAuthorization() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff' && profile.role !== 'supplier')) {
    throw new Error('Unauthorized: Administrative or supplier catalog access is required.');
  }
  return profile;
}

interface AssignProductParams {
  productId: string;
  supplierId: string;
  variantId: string;
  supplierSku: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  leadTime?: number;
}

/**
 * Assigns a product variant to a specific supplier catalog inventory mapping.
 * Enforces supplier-brand fulfillment authorization invariant inside the write transaction.
 */
export async function assignProductToSupplierAction(
  params: AssignProductParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();
    const { productId, supplierId, variantId, supplierSku, sellingPrice, costPrice, stock, leadTime = 3 } = params;

    if (!productId || !supplierId || !variantId || !supplierSku) {
      return { success: false, error: 'Product, Supplier, Variant, and SKU are required.' };
    }

    if (sellingPrice < costPrice) {
      return { success: false, error: 'Selling price must be greater than or equal to cost price.' };
    }

    if (stock < 0) {
      return { success: false, error: 'Initial inventory stock cannot be negative.' };
    }

    return await db.transaction(async (tx) => {
      const [supplier] = await tx.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1);
      if (!supplier) {
        return { success: false, error: 'Supplier boutique not found.' };
      }
      if (supplier.status !== 'active') {
        return { success: false, error: 'Supplier is currently not active.' };
      }

      // Hard business invariant validation: Check product brand authorization
      const [targetProduct] = await tx
        .select({ brandId: products.brandId })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (targetProduct?.brandId) {
        await SupplierBrandService.assertSupplierAuthorizedForBrand(supplierId, targetProduct.brandId, tx);
      }

      let [supplierProduct] = await tx
        .select()
        .from(supplierProducts)
        .where(
          and(
            eq(supplierProducts.productId, productId),
            eq(supplierProducts.supplierId, supplierId)
          )
        )
        .limit(1);

      if (!supplierProduct) {
        [supplierProduct] = await tx
          .insert(supplierProducts)
          .values({
            productId,
            supplierId,
          })
          .returning();
      }

      const [newVar] = await tx
        .insert(supplierProductVariants)
        .values({
          supplierProductId: supplierProduct.id,
          variantId,
          supplierSku,
          sellingPrice: sellingPrice.toFixed(2),
          costPrice: costPrice.toFixed(2),
          leadTime: leadTime,
          isActive: true,
        })
        .returning();

      revalidatePath('/admin/products');
      return { success: true };
    });
  } catch (err: any) {
    console.error('Failed to assign variant:', err);
    return { success: false, error: err.message || 'Failed to assign variant.' };
  }
}

/**
 * Creates basic product parameters and Slug generation.
 */
export async function createProductAction(productData: {
  name: string;
  description?: string | null;
  price: string;
  compareAtPrice?: string | null;
  costPrice?: string | null;
  sku: string;
  categoryId?: string | null;
  brandId?: string | null;
  imageUrl?: string | null;
  productType: 'simple' | 'variant';
  status?: 'draft' | 'active' | 'archived';
  weight?: string | null;
  dimensions?: string | null;
  galleryUrls?: string[];
  // Fashion Specification Attributes
  gender?: string | null;
  material?: string | null;
  fit?: string | null;
  pattern?: string | null;
  season?: string | null;
  collection?: string | null;
  occasion?: string | null;
  careInstructions?: string | null;
  countryOfOrigin?: string | null;
  sizeChart?: any;
}): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();
    const {
      name,
      description,
      price,
      compareAtPrice,
      costPrice,
      sku,
      categoryId,
      brandId,
      imageUrl,
      productType,
      status = 'active',
      weight,
      dimensions,
      galleryUrls = [],
      gender,
      material,
      fit,
      pattern,
      season,
      collection,
      occasion,
      careInstructions,
      countryOfOrigin,
      sizeChart = {},
    } = productData;

    if (!name || !price || !sku) {
      return { success: false, error: 'Product name, base price, and SKU are required.' };
    }

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      return { success: false, error: 'Price must be a positive number.' };
    }

    const compareAtVal = compareAtPrice ? parseFloat(compareAtPrice) : null;

    // Slug generation
    const baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let isUnique = false;
    let counter = 2;

    while (!isUnique) {
      const conflict = await db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);
      if (conflict.length === 0) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        description: description || null,
        price: priceVal.toFixed(2),
        compareAtPrice: compareAtVal ? compareAtVal.toFixed(2) : null,
        costPrice: costPrice && !isNaN(parseFloat(costPrice)) ? parseFloat(costPrice).toFixed(2) : null,
        sku,
        status: status as any,
        categoryId: categoryId || null,
        brandId: brandId || null,
        gender: gender || null,
        material: material || null,
        fit: fit || null,
        pattern: pattern || null,
        season: season || null,
        collection: collection || null,
        occasion: occasion || null,
        careInstructions: careInstructions || null,
        countryOfOrigin: countryOfOrigin || null,
        sizeChart: sizeChart || {},
        metadata: {
          weight: weight || null,
          dimensions: dimensions || null,
          productType,
        },
      })
      .returning();

    if (imageUrl && imageUrl.trim()) {
      await db.insert(productImages).values({
        productId: newProduct.id,
        url: imageUrl.trim(),
        altText: `${name} primary view`,
        isPrimary: true,
        sortOrder: 0,
      });
    }

    if (galleryUrls && galleryUrls.length > 0) {
      const galleryInserts = galleryUrls.map((url, idx) => ({
        productId: newProduct.id,
        url: url.trim(),
        altText: `${name} view ${idx + 1}`,
        isPrimary: false,
        sortOrder: idx + 1,
      }));
      await db.insert(productImages).values(galleryInserts);
    }

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'product',
      entityId: newProduct.id,
      action: 'create',
      newValue: { name, sku, productType, price, status },
    });

    revalidatePath('/admin/products');
    return { success: true, productId: newProduct.id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create product.' };
  }
}

/**
 * Updates basic product metadata and fashion specifications.
 */
export async function updateProductAction(
  productId: string,
  productData: {
    name: string;
    description?: string | null;
    price: string;
    compareAtPrice?: string | null;
    costPrice?: string | null;
    sku: string;
    categoryId?: string | null;
    brandId?: string | null;
    imageUrl?: string | null;
    galleryUrls?: string[];
    status?: 'active' | 'draft' | 'archived';
    gender?: string | null;
    material?: string | null;
    fit?: string | null;
    pattern?: string | null;
    season?: string | null;
    collection?: string | null;
    occasion?: string | null;
    careInstructions?: string | null;
    countryOfOrigin?: string | null;
    sizeChart?: any;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();
    const {
      name,
      description,
      price,
      compareAtPrice,
      costPrice,
      sku,
      categoryId,
      brandId,
      imageUrl,
      galleryUrls,
      status,
      gender,
      material,
      fit,
      pattern,
      season,
      collection,
      occasion,
      careInstructions,
      countryOfOrigin,
      sizeChart,
    } = productData;

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      return { success: false, error: 'Price must be a positive number.' };
    }

    const compareAtVal = compareAtPrice ? parseFloat(compareAtPrice) : null;

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          name,
          description: description || null,
          price: priceVal.toFixed(2),
          compareAtPrice: compareAtVal ? compareAtVal.toFixed(2) : null,
          costPrice:
            costPrice !== undefined
              ? costPrice && !isNaN(parseFloat(costPrice))
                ? parseFloat(costPrice).toFixed(2)
                : null
              : undefined,
          sku,
          categoryId: categoryId || null,
          brandId: brandId || null,
          status: status || 'active',
          gender: gender || null,
          material: material || null,
          fit: fit || null,
          pattern: pattern || null,
          season: season || null,
          collection: collection || null,
          occasion: occasion || null,
          careInstructions: careInstructions || null,
          countryOfOrigin: countryOfOrigin || null,
          sizeChart: sizeChart || {},
        })
        .where(eq(products.id, productId));

      if (imageUrl !== undefined || galleryUrls !== undefined) {
        await tx.delete(productImages).where(eq(productImages.productId, productId));
        if (imageUrl && imageUrl.trim()) {
          await tx.insert(productImages).values({
            productId,
            url: imageUrl.trim(),
            altText: `${name} primary view`,
            isPrimary: true,
            sortOrder: 0,
          });
        }
        if (galleryUrls && galleryUrls.length > 0) {
          const galleryInserts = galleryUrls
            .filter((url) => url && url.trim() && url.trim() !== (imageUrl?.trim() || ''))
            .map((url, idx) => ({
              productId,
              url: url.trim(),
              altText: `${name} view ${idx + 1}`,
              isPrimary: false,
              sortOrder: idx + 1,
            }));
          if (galleryInserts.length > 0) {
            await tx.insert(productImages).values(galleryInserts);
          }
        }
      }

      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'product',
        entityId: productId,
        action: 'update',
        newValue: productData,
      });
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product.' };
  }
}

interface SyncVariantInput {
  id?: string;
  sku: string;
  barcode?: string | null;
  price: string;
  compareAtPrice?: string | null;
  costPrice?: string | null;
  weight?: string | null;
  status: 'active' | 'draft' | 'archived';
  imageUrl?: string | null;
  trackInventory: boolean;
  stock: number;
  attributeValueIds: string[]; // array of global_attribute_values.id
}

/**
 * Synchronizes selected attributes, attribute values and matrix variants incrementally.
 */
export async function syncVariantsAction(
  productId: string,
  selectedAttributeIds: string[],
  selectedValues: { attributeId: string; valueIds: string[] }[],
  variantsList: SyncVariantInput[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    return await db.transaction(async (tx) => {
      // 1. Sync product_attributes
      const existingProdAttrs = await tx
        .select()
        .from(productAttributes)
        .where(eq(productAttributes.productId, productId));

      const existingAttrIds = existingProdAttrs.map((pa) => pa.attributeId);

      // Add missing attributes
      const newAttrIds = selectedAttributeIds.filter((id) => !existingAttrIds.includes(id));
      for (const attrId of newAttrIds) {
        await tx.insert(productAttributes).values({ productId, attributeId: attrId });
      }

      // Remove unchecked attributes
      const toDeleteAttrIds = existingAttrIds.filter((id) => !selectedAttributeIds.includes(id));
      if (toDeleteAttrIds.length > 0) {
        const prodAttrIdsToDelete = existingProdAttrs
          .filter((pa) => toDeleteAttrIds.includes(pa.attributeId))
          .map((pa) => pa.id);

        if (prodAttrIdsToDelete.length > 0) {
          await tx
            .delete(productAttributeValues)
            .where(inArray(productAttributeValues.productAttributeId, prodAttrIdsToDelete));
          await tx
            .delete(productAttributes)
            .where(inArray(productAttributes.id, prodAttrIdsToDelete));
        }
      }

      // Re-fetch product_attributes mapping to resolve IDs
      const allProdAttrs = await tx
        .select()
        .from(productAttributes)
        .where(eq(productAttributes.productId, productId));

      // 2. Sync product_attribute_values
      for (const mapping of selectedValues) {
        const prodAttr = allProdAttrs.find((pa) => pa.attributeId === mapping.attributeId);
        if (!prodAttr) continue;

        const existingProdAttrVals = await tx
          .select()
          .from(productAttributeValues)
          .where(eq(productAttributeValues.productAttributeId, prodAttr.id));

        const existingValIds = existingProdAttrVals.map((pav) => pav.attributeValueId);

        // Insert new selected values
        const toAddValIds = mapping.valueIds.filter((id) => !existingValIds.includes(id));
        for (const valId of toAddValIds) {
          await tx.insert(productAttributeValues).values({
            productAttributeId: prodAttr.id,
            attributeValueId: valId,
          });
        }

        // Delete unselected values
        const toDeleteValIds = existingValIds.filter((id) => !mapping.valueIds.includes(id));
        if (toDeleteValIds.length > 0) {
          await tx
            .delete(productAttributeValues)
            .where(
              and(
                eq(productAttributeValues.productAttributeId, prodAttr.id),
                inArray(productAttributeValues.attributeValueId, toDeleteValIds)
              )
            );
        }
      }

      // 3. Sync variants incrementally!
      const existingVariants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

      // Load values map for existing variants
      const existingVariantsWithValues = await Promise.all(
        existingVariants.map(async (v) => {
          const mappedVals = await tx
            .select()
            .from(variantAttributeValues)
            .where(eq(variantAttributeValues.variantId, v.id));
          return {
            ...v,
            valueIds: mappedVals.map((mv) => mv.attributeValueId).sort(),
          };
        })
      );

      const activeVariantIds: string[] = [];

      for (const vInput of variantsList) {
        const sku = vInput.sku.trim();
        const price = parseFloat(vInput.price || '0').toFixed(2);
        const compareAt = vInput.compareAtPrice ? parseFloat(vInput.compareAtPrice).toFixed(2) : null;
        const costPrice = vInput.costPrice ? parseFloat(vInput.costPrice).toFixed(2) : null;
        const weightVal = vInput.weight ? parseFloat(vInput.weight).toFixed(2) : null;
        const inputValIdsSorted = [...vInput.attributeValueIds].sort();

        // Search for existing matching variant (by ID, SKU, or exact value combination)
        const match =
          (vInput.id ? existingVariantsWithValues.find((ev) => ev.id === vInput.id) : null) ||
          existingVariantsWithValues.find((ev) => ev.sku.toLowerCase() === sku.toLowerCase()) ||
          existingVariantsWithValues.find((ev) => {
            if (ev.valueIds.length !== inputValIdsSorted.length) return false;
            return ev.valueIds.every((val, idx) => val === inputValIdsSorted[idx]);
          });

        if (match) {
          // Update existing variant record
          await tx
            .update(productVariants)
            .set({
              sku,
              barcode: vInput.barcode || null,
              price,
              compareAtPrice: compareAt,
              costPrice,
              weight: weightVal,
              status: vInput.status || 'active',
              imageUrl: vInput.imageUrl || null,
              trackInventory: vInput.trackInventory,
              stock: vInput.stock,
            })
            .where(eq(productVariants.id, match.id));

          activeVariantIds.push(match.id);

          // Synchronize attribute value associations for existing variant
          await tx
            .delete(variantAttributeValues)
            .where(eq(variantAttributeValues.variantId, match.id));

          for (const valId of vInput.attributeValueIds) {
            await tx.insert(variantAttributeValues).values({
              variantId: match.id,
              attributeValueId: valId,
            });
          }

          // Update inventory stock levels directly
          let [inv] = await tx
            .select()
            .from(inventory)
            .where(eq(inventory.variantId, match.id))
            .limit(1);

          if (!inv) {
            [inv] = await tx
              .insert(inventory)
              .values({
                productId,
                variantId: match.id,
                quantity: vInput.stock,
                lowStockThreshold: 5,
              })
              .returning();
          } else if (inv.quantity !== vInput.stock) {
            const difference = vInput.stock - inv.quantity;
            await tx
              .update(inventory)
              .set({ quantity: vInput.stock, updatedAt: new Date() })
              .where(eq(inventory.id, inv.id));

            await tx.insert(inventoryMovements).values({
              inventoryId: inv.id,
              type: difference > 0 ? 'inbound' : 'outbound',
              quantity: Math.abs(difference),
              notes: 'Stock Adjustment via Variant Sync Flow',
            });
          }
        } else {
          // Create new variant
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId,
              sku,
              barcode: vInput.barcode || null,
              price,
              compareAtPrice: compareAt,
              costPrice,
              weight: weightVal,
              status: vInput.status || 'active',
              imageUrl: vInput.imageUrl || null,
              trackInventory: vInput.trackInventory,
              stock: vInput.stock,
            })
            .returning();

          activeVariantIds.push(newVariant.id);

          // Map option values
          for (const valId of vInput.attributeValueIds) {
            await tx.insert(variantAttributeValues).values({
              variantId: newVariant.id,
              attributeValueId: valId,
            });
          }

          // Register opening inventory
          const [newInv] = await tx
            .insert(inventory)
            .values({
              productId,
              variantId: newVariant.id,
              quantity: vInput.stock,
              lowStockThreshold: 5,
            })
            .returning();

          if (vInput.stock > 0) {
            await tx.insert(inventoryMovements).values({
              inventoryId: newInv.id,
              type: 'inbound',
              quantity: vInput.stock,
              notes: 'Opening Stock - Incremental Variant Generation',
            });
          }
        }
      }

      // 4. Archive variants that are no longer part of active matrix configuration
      const unusedVariants = existingVariants.filter((ev) => !activeVariantIds.includes(ev.id));
      for (const uv of unusedVariants) {
        await tx
          .update(productVariants)
          .set({ status: 'archived' })
          .where(eq(productVariants.id, uv.id));
      }

      // Record sync log
      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'product',
        entityId: productId,
        action: 'sync_variants',
        newValue: { variantsCount: variantsList.length },
      });

      revalidatePath('/admin/products');
      revalidatePath('/products');
      return { success: true };
    });
  } catch (error: any) {
    console.error('Failed sync variants:', error);
    return { success: false, error: error.message || 'Failed to synchronize variants.' };
  }
}

/**
 * Fetches product info, option mappings, and variant matrix for Shopify-style tabs layout.
 */
export async function getProductForEditAction(productId: string) {
  try {
    await enforceAdminAuthorization();

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.sortOrder);

    // Mapped product attributes
    const prodAttributes = await db
      .select({
        id: productAttributes.id,
        attributeId: productAttributes.attributeId,
      })
      .from(productAttributes)
      .where(eq(productAttributes.productId, productId));

    const selectedValues: { attributeId: string; valueIds: string[] }[] = [];
    for (const pa of prodAttributes) {
      const vals = await db
        .select({
          attributeValueId: productAttributeValues.attributeValueId,
        })
        .from(productAttributeValues)
        .where(eq(productAttributeValues.productAttributeId, pa.id));

      selectedValues.push({
        attributeId: pa.attributeId,
        valueIds: vals.map((v) => v.attributeValueId),
      });
    }

    // Fetch product variants with their options mapping & resolved live inventory quantity
    const dbVariants = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        sku: productVariants.sku,
        barcode: productVariants.barcode,
        price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice,
        costPrice: productVariants.costPrice,
        weight: productVariants.weight,
        status: productVariants.status,
        imageUrl: productVariants.imageUrl,
        trackInventory: productVariants.trackInventory,
        stock: sql<number>`cast(coalesce(${inventory.quantity}, ${productVariants.stock}) as integer)`,
        createdAt: productVariants.createdAt,
      })
      .from(productVariants)
      .leftJoin(inventory, eq(productVariants.id, inventory.variantId))
      .where(eq(productVariants.productId, productId));

    const variants = await Promise.all(
      dbVariants.map(async (v) => {
        const mappedVals = await db
          .select({
            attributeValueId: variantAttributeValues.attributeValueId,
          })
          .from(variantAttributeValues)
          .where(eq(variantAttributeValues.variantId, v.id));

        return {
          ...v,
          attributeValueIds: mappedVals.map((mv) => mv.attributeValueId),
        };
      })
    );

    const primaryImgUrl = images.find((i) => i.isPrimary)?.url || images[0]?.url || '';
    const galleryUrls = images
      .filter((i) => !i.isPrimary && i.url !== primaryImgUrl)
      .map((i) => i.url);

    return {
      success: true,
      data: {
        product: {
          ...product,
          imageUrl: primaryImgUrl,
          galleryUrls,
          images: images.map((i) => ({
            id: i.id,
            url: i.url,
            altText: i.altText,
            sortOrder: i.sortOrder,
            isPrimary: i.isPrimary,
          })),
        },
        selectedAttributeIds: prodAttributes.map((pa) => pa.attributeId),
        selectedValues,
        variants,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load product details.' };
  }
}

/**
 * Soft deletes a product inside the catalog.
 */
export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    if (!productId) {
      return { success: false, error: 'Product ID is required.' };
    }

    await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, productId));

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'product',
      entityId: productId,
      action: 'delete',
      newValue: { deleted: true },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    return { success: false, error: err.message || 'Failed to delete product.' };
  }
}

/**
 * Updates a product status in the catalog.
 */
export async function toggleProductStatusAction(
  productId: string,
  newStatus: 'active' | 'draft' | 'archived'
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    if (!productId || !newStatus) {
      return { success: false, error: 'Product ID and Status are required.' };
    }

    await db
      .update(products)
      .set({ status: newStatus })
      .where(eq(products.id, productId));

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'product',
      entityId: productId,
      action: 'toggle_status',
      newValue: { status: newStatus },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to toggle product status:', err);
    return { success: false, error: err.message || 'Failed to toggle product status.' };
  }
}

export interface BulkOperationResult {
  success: boolean;
  succeededCount: number;
  failedCount: number;
  failures: { id: string; reason: string }[];
}

/**
 * Server action: Bulk update status across multiple product catalog items (Admin/Staff only).
 * Performs item-level updates and returns partial success / failure breakdown.
 */
export async function bulkUpdateProductStatusAction(
  productIds: string[],
  newStatus: 'active' | 'draft' | 'archived'
): Promise<BulkOperationResult> {
  const failures: { id: string; reason: string }[] = [];
  let succeededCount = 0;

  try {
    const actor = await enforceAdminAuthorization();

    if (!productIds || productIds.length === 0) {
      return { success: false, succeededCount: 0, failedCount: 0, failures: [] };
    }

    for (const id of productIds) {
      try {
        await db
          .update(products)
          .set({ status: newStatus, updatedAt: new Date() })
          .where(eq(products.id, id));

        await db.insert(auditLogs).values({
          actorId: actor.id,
          entity: 'product',
          entityId: id,
          action: 'bulk_status_update',
          newValue: { status: newStatus },
        });

        succeededCount++;
      } catch (err: any) {
        failures.push({ id, reason: err.message || 'Database update failed' });
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: failures.length === 0,
      succeededCount,
      failedCount: failures.length,
      failures,
    };
  } catch (err: any) {
    return {
      success: false,
      succeededCount,
      failedCount: productIds.length - succeededCount,
      failures: [{ id: 'all', reason: err.message || 'Bulk status action failed' }],
    };
  }
}

/**
 * Bulk assigns or clears category for multiple products at once.
 */
export async function bulkUpdateProductCategoryAction(
  productIds: string[],
  categoryId: string | null
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    if (!productIds || productIds.length === 0) {
      return { success: false, count: 0, error: 'No products selected.' };
    }

    await db.transaction(async (tx) => {
      // 1. Update primary category on products table
      await tx
        .update(products)
        .set({
          categoryId: categoryId || null,
          updatedAt: new Date(),
        })
        .where(inArray(products.id, productIds));

      // 2. Synchronize product_categories junction table
      for (const id of productIds) {
        await tx
          .delete(productCategories)
          .where(and(eq(productCategories.productId, id), eq(productCategories.isPrimary, true)));

        if (categoryId) {
          await tx.insert(productCategories).values({
            productId: id,
            categoryId,
            isPrimary: true,
          });
        }

        await tx.insert(auditLogs).values({
          actorId: actor.id,
          entity: 'product',
          entityId: id,
          action: 'bulk_category_update',
          newValue: { categoryId },
        });
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/admin/categories');

    return { success: true, count: productIds.length };
  } catch (err: any) {
    console.error('bulkUpdateProductCategoryAction error:', err);
    return { success: false, count: 0, error: err.message || 'Failed to bulk update categories.' };
  }
}

/**
 * Updates a single product's category immediately from table inline selector.
 */
export async function quickUpdateProductCategoryAction(
  productId: string,
  categoryId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          categoryId: categoryId || null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await tx
        .delete(productCategories)
        .where(and(eq(productCategories.productId, productId), eq(productCategories.isPrimary, true)));

      if (categoryId) {
        await tx.insert(productCategories).values({
          productId,
          categoryId,
          isPrimary: true,
        });
      }

      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'product',
        entityId: productId,
        action: 'quick_category_update',
        newValue: { categoryId },
      });
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/admin/categories');

    return { success: true };
  } catch (err: any) {
    console.error('quickUpdateProductCategoryAction error:', err);
    return { success: false, error: err.message || 'Failed to update category.' };
  }
}

