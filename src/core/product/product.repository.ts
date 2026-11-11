import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog/products';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { productImages } from '@/lib/db/schema/catalog/images';
import {
  productVariants,
  globalAttributes,
  globalAttributeValues,
  productAttributes,
  productAttributeValues,
  variantAttributeValues
} from '@/lib/db/schema/catalog/variants';
import { inventory } from '@/lib/db/schema/inventory';
import { reviews } from '@/lib/db/schema/reviews';
import { productCategories } from '@/lib/db/schema/catalog/product-taxonomy';
import { collections, collectionProducts } from '@/lib/db/schema/catalog/collections';
import { audiences, productAudiences } from '@/lib/db/schema/catalog/audiences';
import { eq, and, or, like, gte, lte, sql, desc, asc, inArray } from 'drizzle-orm';
import { type ProductFilters, type FilterFacets, type FacetOption } from './product.types';

/**
 * ProductRepository abstracts database access logic for catalogs, categories, and inventory.
 */
export class ProductRepository {
  /**
   * Fetches paginated, filtered products from database.
   */
  async getProducts(filters: ProductFilters) {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      availability,
      page = 1,
      limit = 12,
      sort = 'latest',
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];

    // Filter out soft-deleted items
    conditions.push(sql`${products.deletedAt} IS NULL`);
    
    // Only filter active products for public users
    if (filters.visibility !== 'admin') {
      conditions.push(eq(products.status, 'active'));
    }

    if (category) {
      conditions.push(
        or(
          eq(categories.slug, category),
          sql`exists (
            select 1 from ${productCategories}
            inner join ${categories} as sub_cat on sub_cat.id = ${productCategories.categoryId}
            where ${productCategories.productId} = ${products.id} and sub_cat.slug = ${category}
          )`,
          sql`exists (
            select 1 from ${categories} as parent_cat
            where parent_cat.id = ${categories.parentId} and parent_cat.slug = ${category}
          )`
        )
      );
    }

    if (brand) {
      conditions.push(eq(brands.slug, brand));
    }

    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()));
    }

    if (filters.gender) {
      conditions.push(
        or(
          eq(products.gender, filters.gender),
          sql`exists (
            select 1 from ${productAudiences}
            inner join ${audiences} on ${audiences.id} = ${productAudiences.audienceId}
            where ${productAudiences.productId} = ${products.id} and (${audiences.slug} = ${filters.gender} or ${audiences.name} = ${filters.gender})
          )`
        )
      );
    }
    if (filters.fit) {
      conditions.push(eq(products.fit, filters.fit));
    }
    if (filters.pattern) {
      conditions.push(eq(products.pattern, filters.pattern));
    }
    if (filters.season) {
      conditions.push(eq(products.season, filters.season));
    }
    if (filters.collection) {
      conditions.push(
        or(
          eq(products.collection, filters.collection),
          sql`exists (
            select 1 from ${collectionProducts}
            inner join ${collections} on ${collections.id} = ${collectionProducts.collectionId}
            where ${collectionProducts.productId} = ${products.id} and (${collections.slug} = ${filters.collection} or ${collections.name} = ${filters.collection})
          )`
        )
      );
    }
    if (filters.occasion) {
      conditions.push(eq(products.occasion, filters.occasion));
    }
    if (filters.material) {
      conditions.push(like(products.material, `%${filters.material}%`));
    }
    if (filters.edition) {
      conditions.push(sql`exists (
        select 1 from ${productAttributes} pa
        inner join ${globalAttributes} ga on ga.id = pa.attribute_id
        inner join ${productAttributeValues} pav on pav.product_attribute_id = pa.id
        inner join ${globalAttributeValues} gav on gav.id = pav.attribute_value_id
        where pa.product_id = ${products.id} and lower(ga.name) = 'edition' and lower(gav.value) like ${`%${filters.edition.toLowerCase()}%`}
      )`);
    }
    if (filters.festival) {
      conditions.push(sql`exists (
        select 1 from ${productAttributes} pa
        inner join ${globalAttributes} ga on ga.id = pa.attribute_id
        inner join ${productAttributeValues} pav on pav.product_attribute_id = pa.id
        inner join ${globalAttributeValues} gav on gav.id = pav.attribute_value_id
        where pa.product_id = ${products.id} and lower(ga.name) = 'festival' and lower(gav.value) like ${`%${filters.festival.toLowerCase()}%`}
      )`);
    }
    if (filters.tag) {
      conditions.push(sql`exists (
        select 1 from ${productAttributes} pa
        inner join ${globalAttributes} ga on ga.id = pa.attribute_id
        inner join ${productAttributeValues} pav on pav.product_attribute_id = pa.id
        inner join ${globalAttributeValues} gav on gav.id = pav.attribute_value_id
        where pa.product_id = ${products.id} and lower(gav.value) like ${`%${filters.tag.toLowerCase()}%`}
      )`);
    }

    if (availability === 'in-stock') {
      conditions.push(
        sql`coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) > 0`
      );
    } else if (availability === 'out-of-stock') {
      conditions.push(
        sql`coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) = 0`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    switch (sort) {
      case 'price-asc':
        orderByClause = asc(products.price);
        break;
      case 'price-desc':
        orderByClause = desc(products.price);
        break;
      case 'rating-desc':
        orderByClause = desc(sql`(select avg(rating) from ${reviews} where ${reviews.productId} = ${products.id})`);
        break;
      case 'popular':
        orderByClause = desc(sql`(select count(id) from ${reviews} where ${reviews.productId} = ${products.id})`);
        break;
      case 'latest':
      default:
        orderByClause = desc(products.createdAt);
        break;
    }

    const itemsQuery = db
      .select({
        product: products,
        category: categories,
        brand: brands,
        quantity: sql<number>`cast(coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) as integer)`,
        rating: sql<number | null>`cast((select avg(rating) from ${reviews} where ${reviews.productId} = ${products.id} and ${reviews.status} = 'approved' and ${reviews.deletedAt} is null) as double precision)`,
        reviewsCount: sql<number>`cast(coalesce((select count(id) from ${reviews} where ${reviews.productId} = ${products.id} and ${reviews.status} = 'approved' and ${reviews.deletedAt} is null), 0) as integer)`,
        primaryImage: sql<string | null>`(select url from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
        images: sql<string[]>`coalesce((select array_agg(url order by sort_order asc) from ${productImages} where ${productImages.productId} = ${products.id}), array[]::text[])`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`cast(count(${products.id}) as integer)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause);

    const [items, countResult] = await Promise.all([itemsQuery, countQuery]);
    const total = countResult[0]?.count || 0;

    // Attach universal product attributes for downstream storefront and CMS visual builder grids
    // Skip in admin catalog view where attributes are not displayed, saving an expensive 4-table join roundtrip
    if (items.length > 0 && filters.visibility !== 'admin') {
      const prodIds = items.map((i) => i.product.id);
      const attrs = await db
        .select({
          productId: productAttributes.productId,
          name: globalAttributes.name,
          value: globalAttributeValues.value,
        })
        .from(productAttributes)
        .innerJoin(globalAttributes, eq(productAttributes.attributeId, globalAttributes.id))
        .innerJoin(productAttributeValues, eq(productAttributeValues.productAttributeId, productAttributes.id))
        .innerJoin(globalAttributeValues, eq(productAttributeValues.attributeValueId, globalAttributeValues.id))
        .where(inArray(productAttributes.productId, prodIds));

      const itemsWithAttrs = items.map((row) => {
        const productAttrs = attrs
          .filter((a) => a.productId === row.product.id)
          .map((a) => ({ name: a.name, value: a.value }));
        return {
          ...row,
          attributes: productAttrs,
        };
      });

      return {
        items: itemsWithAttrs,
        total,
      };
    }

    return {
      items,
      total,
    };
  }

  /**
   * Fetches featured items.
   */
  async getFeaturedProducts(limit = 4) {
    return db
      .select({
        product: products,
        category: categories,
        brand: brands,
        quantity: sql<number>`cast(coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) as integer)`,
        rating: sql<number | null>`cast((select avg(rating) from ${reviews} where ${reviews.productId} = ${products.id} and ${reviews.status} = 'approved' and ${reviews.deletedAt} is null) as double precision)`,
        reviewsCount: sql<number>`cast(coalesce((select count(id) from ${reviews} where ${reviews.productId} = ${products.id} and ${reviews.status} = 'approved' and ${reviews.deletedAt} is null), 0) as integer)`,
        primaryImage: sql<string | null>`(select url from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
        images: sql<string[]>`coalesce((select array_agg(url order by sort_order asc) from ${productImages} where ${productImages.productId} = ${products.id}), array[]::text[])`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(
        and(
          sql`${products.deletedAt} IS NULL`,
          eq(products.status, 'active')
        )
      )
      .limit(limit)
      .orderBy(desc(sql`(select avg(rating) from ${reviews} where ${reviews.productId} = ${products.id})`));
  }

  /**
   * Fetches single product detailed relations for Product Detail View (PDP).
   */
  async getProductBySlug(slug: string) {
    const result = await db
      .select({
        product: products,
        category: categories,
        brand: brands,
        quantity: sql<number>`cast(coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) as integer)`,
        rating: sql<number | null>`cast((select avg(rating) from ${reviews} where ${reviews.productId} = ${products.id} and ${reviews.status} = 'approved' and ${reviews.deletedAt} is null) as double precision)`,
        reviewsCount: sql<number>`cast(coalesce((select count(id) from ${reviews} where ${reviews.productId} = ${products.id} and ${reviews.status} = 'approved' and ${reviews.deletedAt} is null), 0) as integer)`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(
        and(
          eq(products.slug, slug),
          sql`${products.deletedAt} IS NULL`
        )
      )
      .limit(1);

    const match = result[0];
    if (!match) return null;

    // Fetch images, variants, options, and option values
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, match.product.id))
      .orderBy(asc(productImages.sortOrder));

    const variants = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, match.product.id),
          eq(productVariants.status, 'active')
        )
      );

    // Mapped options (global attributes)
    const dbProductAttributes = await db
      .select({
        id: globalAttributes.id,
        name: globalAttributes.name,
      })
      .from(productAttributes)
      .innerJoin(globalAttributes, eq(productAttributes.attributeId, globalAttributes.id))
      .where(eq(productAttributes.productId, match.product.id));

    const options = dbProductAttributes.map((pa) => ({
      id: pa.id,
      name: pa.name,
    }));

    // Mapped option values (global attribute values)
    const optionValues: any[] = [];
    const prodAttrIds = await db
      .select({ id: productAttributes.id, attributeId: productAttributes.attributeId })
      .from(productAttributes)
      .where(eq(productAttributes.productId, match.product.id));

    for (const pa of prodAttrIds) {
      const vals = await db
        .select({
          id: globalAttributeValues.id,
          value: globalAttributeValues.value,
        })
        .from(productAttributeValues)
        .innerJoin(globalAttributeValues, eq(productAttributeValues.attributeValueId, globalAttributeValues.id))
        .where(eq(productAttributeValues.productAttributeId, pa.id));

      vals.forEach((v) => {
        optionValues.push({
          id: v.id,
          optionId: pa.attributeId,
          value: v.value,
        });
      });
    }

    // variantOptionsList matching ProductMapper format
    const variantIds = variants.map((v) => v.id);
    const variantOptionsList: any[] = [];

    if (variantIds.length > 0) {
      const vOptions = await db
        .select({
          variantId: variantAttributeValues.variantId,
          valueId: globalAttributeValues.id,
          value: globalAttributeValues.value,
          attributeName: globalAttributes.name,
        })
        .from(variantAttributeValues)
        .innerJoin(globalAttributeValues, eq(variantAttributeValues.attributeValueId, globalAttributeValues.id))
        .innerJoin(globalAttributes, eq(globalAttributeValues.attributeId, globalAttributes.id))
        .where(inArray(variantAttributeValues.variantId, variantIds));

      vOptions.forEach((vo) => {
        variantOptionsList.push({
          variantOption: {
            variantId: vo.variantId,
            optionValueId: vo.valueId,
          },
          optionValue: {
            value: vo.value,
          },
          option: {
            name: vo.attributeName,
          },
        });
      });
    }

    // Query inventory stock records
    const inventoryList = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, match.product.id));

    return {
      product: match.product,
      category: match.category,
      brand: match.brand,
      quantity: match.quantity,
      rating: match.rating,
      reviewsCount: match.reviewsCount,
      images,
      variants,
      options,
      optionValues,
      variantOptionsList,
      inventoryList,
    };
  }

  /**
   * Fetches user reviews list for a given product.
   */
  async getProductReviews(productId: string) {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async getCategories() {
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.isActive, true), sql`${categories.deletedAt} IS NULL`))
      .orderBy(asc(categories.name));
  }

  async getBrands() {
    return db
      .select()
      .from(brands)
      .where(sql`${brands.deletedAt} IS NULL`)
      .orderBy(asc(brands.name));
  }

  /**
   * Fetches multiple product details matching an array of slugs.
   */
  async getProductsBySlugs(slugs: string[]) {
    if (slugs.length === 0) return [];
    
    return db
      .select({
        product: products,
        category: categories,
        brand: brands,
        quantity: sql<number>`cast(coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) as integer)`,
        rating: sql<number | null>`cast((select avg(rating) from ${reviews} where ${reviews.productId} = ${products.id}) as double precision)`,
        reviewsCount: sql<number>`cast(coalesce((select count(id) from ${reviews} where ${reviews.productId} = ${products.id}), 0) as integer)`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(
        and(
          inArray(products.slug, slugs),
          sql`${products.deletedAt} IS NULL`,
          eq(products.status, 'active')
        )
      );
  }

  /**
   * Fetches live aggregate facet counts for storefront filtering.
   * Directly computed against active catalog items in PostgreSQL.
   */
  async getFilterFacets(): Promise<FilterFacets> {
    const activeCondition = and(
      sql`${products.deletedAt} IS NULL`,
      eq(products.status, 'active')
    );

    // 1. Categories with counts
    const categoryQuery = db
      .select({
        name: categories.name,
        slug: categories.slug,
        count: sql<number>`cast(count(distinct ${products.id}) as integer)`,
      })
      .from(categories)
      .innerJoin(
        products,
        and(
          or(
            eq(products.categoryId, categories.id),
            sql`exists (
              select 1 from ${productCategories}
              where ${productCategories.productId} = ${products.id} and ${productCategories.categoryId} = ${categories.id}
            )`
          ),
          activeCondition
        )
      )
      .where(and(sql`${categories.deletedAt} IS NULL`, eq(categories.isActive, true)))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(desc(sql`count(distinct ${products.id})`), asc(categories.name));

    // 2. Brands with counts
    const brandQuery = db
      .select({
        name: brands.name,
        slug: brands.slug,
        count: sql<number>`cast(count(distinct ${products.id}) as integer)`,
      })
      .from(brands)
      .innerJoin(products, and(eq(products.brandId, brands.id), activeCondition))
      .where(sql`${brands.deletedAt} IS NULL`)
      .groupBy(brands.id, brands.name, brands.slug)
      .orderBy(desc(sql`count(distinct ${products.id})`), asc(brands.name));

    // 3. Gender / Audience counts
    const genderQuery = db
      .select({
        gender: sql<string>`lower(${products.gender})`,
        count: sql<number>`cast(count(distinct ${products.id}) as integer)`,
      })
      .from(products)
      .where(and(activeCondition, sql`${products.gender} IS NOT NULL`))
      .groupBy(sql`lower(${products.gender})`)
      .orderBy(desc(sql`count(distinct ${products.id})`));

    // 4. Collections with counts
    const collectionQuery = db
      .select({
        name: collections.name,
        slug: collections.slug,
        count: sql<number>`cast(count(distinct ${products.id}) as integer)`,
      })
      .from(collections)
      .innerJoin(collectionProducts, eq(collectionProducts.collectionId, collections.id))
      .innerJoin(products, and(eq(products.id, collectionProducts.productId), activeCondition))
      .where(and(sql`${collections.deletedAt} IS NULL`, eq(collections.isActive, true)))
      .groupBy(collections.id, collections.name, collections.slug)
      .orderBy(desc(sql`count(distinct ${products.id})`), asc(collections.name));

    // 5. Universal Attributes (Edition, Festival, Material, etc.)
    const attributeQuery = db
      .select({
        attrName: sql<string>`lower(${globalAttributes.name})`,
        attrValue: globalAttributeValues.value,
        count: sql<number>`cast(count(distinct ${productAttributes.productId}) as integer)`,
      })
      .from(globalAttributes)
      .innerJoin(productAttributes, eq(productAttributes.attributeId, globalAttributes.id))
      .innerJoin(productAttributeValues, eq(productAttributeValues.productAttributeId, productAttributes.id))
      .innerJoin(globalAttributeValues, eq(globalAttributeValues.id, productAttributeValues.attributeValueId))
      .innerJoin(products, and(eq(products.id, productAttributes.productId), activeCondition))
      .groupBy(sql`lower(${globalAttributes.name})`, globalAttributeValues.value)
      .orderBy(desc(sql`count(distinct ${productAttributes.productId})`));

    // 6. Price range & total count
    const statsQuery = db
      .select({
        minPrice: sql<number>`cast(coalesce(min(${products.price}), 0) as double precision)`,
        maxPrice: sql<number>`cast(coalesce(max(${products.price}), 0) as double precision)`,
        totalProducts: sql<number>`cast(count(${products.id}) as integer)`,
      })
      .from(products)
      .where(activeCondition);

    // 7. In-stock count
    const inStockQuery = db
      .select({
        inStockCount: sql<number>`cast(count(distinct ${products.id}) as integer)`,
      })
      .from(products)
      .where(
        and(
          activeCondition,
          sql`coalesce((select sum(quantity) from ${inventory} where ${inventory.productId} = ${products.id}), 0) > 0`
        )
      );

    const [
      categoryRows,
      brandRows,
      genderRows,
      collectionRows,
      attributeRows,
      [statsRow],
      [inStockRow],
    ] = await Promise.all([
      categoryQuery,
      brandQuery,
      genderQuery,
      collectionQuery,
      attributeQuery,
      statsQuery,
      inStockQuery,
    ]);

    const editions: FacetOption[] = [];
    const festivals: FacetOption[] = [];
    const materials: FacetOption[] = [];

    for (const attr of attributeRows) {
      if (attr.attrName === 'edition') {
        editions.push({ label: attr.attrValue, value: attr.attrValue.toLowerCase(), count: attr.count });
      } else if (attr.attrName === 'festival') {
        festivals.push({ label: attr.attrValue, value: attr.attrValue.toLowerCase(), count: attr.count });
      } else if (attr.attrName === 'material') {
        materials.push({ label: attr.attrValue, value: attr.attrValue.toLowerCase(), count: attr.count });
      }
    }

    const formatGenderLabel = (g: string) => {
      if (g === 'men') return 'Men';
      if (g === 'women') return 'Women';
      if (g === 'kids') return 'Kids';
      if (g === 'unisex') return 'Unisex';
      return g.charAt(0).toUpperCase() + g.slice(1);
    };

    return {
      categories: categoryRows.map((r) => ({ label: r.name, value: r.slug, count: r.count })),
      brands: brandRows.map((r) => ({ label: r.name, value: r.slug, count: r.count })),
      genders: genderRows.map((r) => ({ label: formatGenderLabel(r.gender), value: r.gender, count: r.count })),
      collections: collectionRows.map((r) => ({ label: r.name, value: r.slug, count: r.count })),
      editions,
      festivals,
      materials,
      priceRange: {
        min: statsRow?.minPrice ?? 0,
        max: statsRow?.maxPrice ?? 10000,
      },
      inStockCount: inStockRow?.inStockCount ?? 0,
      totalProducts: statsRow?.totalProducts ?? 0,
    };
  }
}

export const productRepository = new ProductRepository();
export default productRepository;
