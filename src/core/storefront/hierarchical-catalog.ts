import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { products } from '@/lib/db/schema/catalog/products';
import { productCategories } from '@/lib/db/schema/catalog/product-taxonomy';
import { audiences, productAudiences } from '@/lib/db/schema/catalog/audiences';
import { brands } from '@/lib/db/schema/catalog/brands';
import { productImages } from '@/lib/db/schema/catalog/images';
import { collections } from '@/lib/db/schema/catalog/collections';
import { eq, and, or, sql, desc, asc, ilike } from 'drizzle-orm';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { type BreadcrumbItem } from '@/components/navigation/Breadcrumb/breadcrumb';

import { DEPARTMENTS } from './departments';

export const KNOWN_AUDIENCES = new Set(['men', 'women', 'kids', 'unisex', 'baby']);

export interface HierarchicalTaxonomyResolution {
  audience?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  childSlug?: string;
  matchedCategory?: typeof categories.$inferSelect | null;
  matchedChildCategory?: typeof categories.$inferSelect | null;
  matchedProduct?: typeof products.$inferSelect | null;
  isProduct: boolean;
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
  pageSubtitle: string;
  pageDescription: string;
  breadcrumbString: string;
  subtags: Array<{ label: string; href?: string; slug?: string }>;
  heroImage?: string | null;
}

export interface HierarchicalCatalogResult {
  resolution: HierarchicalTaxonomyResolution;
  items: ProductData[];
}

/**
 * Normalizes slug or name into a human-readable display title.
 */
export function formatTaxonomyTitle(slugOrName: string): string {
  return slugOrName
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Resolves a stacked path such as:
 * - ['men', 'streetwear', 'oversized-shirt']
 * - ['women', 'dresses', 'evening-gowns']
 * - ['streetwear', 'hoodies']
 * - ['men', 'streetwear']
 * - ['streetwear']
 */
export async function resolveHierarchicalCatalog(
  segments: string[],
  sort: string = 'newest'
): Promise<HierarchicalCatalogResult> {
  const cleanSegments = segments.map((s) => decodeURIComponent(s).toLowerCase().trim());
  if (cleanSegments.length === 0) {
    return {
      resolution: {
        breadcrumbs: [{ label: 'Shop All', href: '/products' }],
        pageTitle: 'ALL COLLECTIONS',
        pageSubtitle: 'Minimalist luxury apparel crafted in India.',
        pageDescription: 'Explore our comprehensive catalog of elevated essentials, contemporary tailoring, and seasonal drops.',
        breadcrumbString: 'LEXIDO · EDITORIAL',
        subtags: [{ label: 'All' }],
        isProduct: false,
      },
      items: [],
    };
  }

  // 1. Check if the last segment matches an individual product slug
  const lastSegment = cleanSegments[cleanSegments.length - 1];
  let matchedProduct: typeof products.$inferSelect | null = null;

  try {
    if (db) {
      const [prod] = await db
        .select()
        .from(products)
        .where(and(eq(products.slug, lastSegment), sql`${products.deletedAt} IS NULL`))
        .limit(1);

      if (prod) {
        matchedProduct = prod;
      }
    }
  } catch (err) {
    console.warn('resolveHierarchicalCatalog product lookup warning:', err);
  }

  // If this route points to an exact product
  if (matchedProduct) {
    const parentSegments = cleanSegments.slice(0, cleanSegments.length - 1);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let accHref = '';
    for (const seg of parentSegments) {
      accHref += `/${seg}`;
      breadcrumbs.push({
        label: formatTaxonomyTitle(seg),
        href: accHref,
      });
    }
    breadcrumbs.push({ label: matchedProduct.name });

    return {
      resolution: {
        matchedProduct,
        isProduct: true,
        breadcrumbs,
        pageTitle: matchedProduct.name,
        pageSubtitle: matchedProduct.gender ? `${formatTaxonomyTitle(matchedProduct.gender)}'s Collection` : 'Lexido Atelier',
        pageDescription: matchedProduct.description || '',
        breadcrumbString: breadcrumbs.map((b) => b.label).join(' · '),
        subtags: [{ label: 'All' }],
        heroImage: null,
      },
      items: [],
    };
  }

  // 2. Parse stacked taxonomy hierarchy: [audience] / [category] / [child]
  let audience: string | undefined;
  let categorySlug: string | undefined;
  let childSlug: string | undefined;

  if (KNOWN_AUDIENCES.has(cleanSegments[0])) {
    audience = cleanSegments[0];
    categorySlug = cleanSegments[1];
    childSlug = cleanSegments[2];
    if (categorySlug && categorySlug.toLowerCase() === audience.toLowerCase()) {
      categorySlug = childSlug;
      childSlug = undefined;
    }
  } else {
    categorySlug = cleanSegments[0];
    childSlug = cleanSegments[1];
  }

  // 3. Database Category Lookups
  let matchedCategory: typeof categories.$inferSelect | null = null;
  let matchedChildCategory: typeof categories.$inferSelect | null = null;
  let childCategories: Array<typeof categories.$inferSelect> = [];

  try {
    if (db) {
      // 3a. Resolve audience category id if audience is provided
      let audienceCatId: string | null = null;
      if (audience) {
        const [audCat] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              or(
                eq(categories.slug, audience),
                eq(categories.name, audience),
                ilike(categories.name, audience)
              ),
              sql`${categories.deletedAt} IS NULL`,
              eq(categories.isActive, true)
            )
          )
          .limit(1);
        if (audCat) {
          audienceCatId = audCat.id;
        }
      }

      if (categorySlug) {
        // Find primary or sub-category
        const cleanNoHyphen = categorySlug.replace(/[-_]/g, '');
        const cleanWithHyphen = categorySlug.replace(/[-_]/g, '-');
        const cleanWithSpace = categorySlug.replace(/[-_]/g, ' ');

        let cat: typeof categories.$inferSelect | undefined;

        // If audience was specified, prioritize category under this audience parent
        if (audienceCatId) {
          const [audChild] = await db
            .select()
            .from(categories)
            .where(
              and(
                eq(categories.parentId, audienceCatId),
                or(
                  eq(categories.slug, categorySlug),
                  eq(categories.slug, cleanNoHyphen),
                  eq(categories.slug, cleanWithHyphen),
                  ilike(categories.slug, `%${cleanNoHyphen}%`),
                  ilike(categories.slug, `%${cleanWithHyphen}%`),
                  ilike(categories.name, `%${cleanWithSpace}%`)
                ),
                sql`${categories.deletedAt} IS NULL`,
                eq(categories.isActive, true)
              )
            )
            .limit(1);
          cat = audChild;
        }

        // Fallback to global category match if not found under specific audience
        if (!cat) {
          const [globalCat] = await db
            .select()
            .from(categories)
            .where(
              and(
                or(
                  eq(categories.slug, categorySlug),
                  eq(categories.slug, cleanNoHyphen),
                  eq(categories.slug, cleanWithHyphen),
                  ilike(categories.slug, `%${cleanNoHyphen}%`),
                  ilike(categories.slug, `%${cleanWithHyphen}%`),
                  ilike(categories.name, `%${cleanWithSpace}%`)
                ),
                sql`${categories.deletedAt} IS NULL`,
                eq(categories.isActive, true)
              )
            )
            .limit(1);
          cat = globalCat;
        }

        if (cat) {
          matchedCategory = cat;

          // Fetch child categories for subtag pills
          childCategories = await db
            .select()
            .from(categories)
            .where(
              and(
                eq(categories.parentId, cat.id),
                sql`${categories.deletedAt} IS NULL`,
                eq(categories.isActive, true)
              )
            )
            .orderBy(asc(categories.name));
        }

        // If childSlug is provided, find child category definition
        if (childSlug) {
          const childNoHyphen = childSlug.replace(/[-_]/g, '');
          const childWithHyphen = childSlug.replace(/[-_]/g, '-');
          const childWithSpace = childSlug.replace(/[-_]/g, ' ');

          let childCat: typeof categories.$inferSelect | undefined;

          // If matchedCategory is found, prioritize child categories under it
          if (matchedCategory) {
            const [matchedChild] = await db
              .select()
              .from(categories)
              .where(
                and(
                  eq(categories.parentId, matchedCategory.id),
                  or(
                    eq(categories.slug, childSlug),
                    eq(categories.slug, childNoHyphen),
                    eq(categories.slug, childWithHyphen),
                    ilike(categories.slug, `%${childNoHyphen}%`),
                    ilike(categories.name, `%${childWithSpace}%`)
                  ),
                  sql`${categories.deletedAt} IS NULL`,
                  eq(categories.isActive, true)
                )
              )
              .limit(1);
            childCat = matchedChild;
          }

          if (!childCat) {
            const [globalChild] = await db
              .select()
              .from(categories)
              .where(
                and(
                  or(
                    eq(categories.slug, childSlug),
                    eq(categories.slug, childNoHyphen),
                    eq(categories.slug, childWithHyphen),
                    ilike(categories.slug, `%${childNoHyphen}%`),
                    ilike(categories.name, `%${childWithSpace}%`)
                  ),
                  sql`${categories.deletedAt} IS NULL`,
                  eq(categories.isActive, true)
                )
              )
              .limit(1);
            childCat = globalChild;
          }

          if (childCat) {
            matchedChildCategory = childCat;
          }
        }
      } else if (audience) {
        // Look up top-level category row for audience (e.g. 'men', 'women', 'kids') only for subtags navigation
        // DO NOT set matchedCategory = audCat, because top audience is not a product category filter!
        const [audCat] = await db
          .select()
          .from(categories)
          .where(
            and(
              or(
                eq(categories.slug, audience),
                eq(categories.name, audience)
              ),
              sql`${categories.deletedAt} IS NULL`,
              eq(categories.isActive, true)
            )
          )
          .limit(1);

        if (audCat) {
          // Fetch direct subcategories under this top-level category
          childCategories = await db
            .select()
            .from(categories)
            .where(
              and(
                eq(categories.parentId, audCat.id),
                sql`${categories.deletedAt} IS NULL`,
                eq(categories.isActive, true)
              )
            )
            .orderBy(asc(categories.name));
        }
      }
    }
  } catch (err) {
    console.warn('resolveHierarchicalCatalog category lookup warning:', err);
  }

  // 4. Construct Structured Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  let basePath = '';

  if (audience) {
    basePath += `/${audience}`;
    breadcrumbs.push({
      label: formatTaxonomyTitle(audience),
      href: basePath,
    });
  }

  if (categorySlug) {
    basePath += `/${categorySlug}`;
    breadcrumbs.push({
      label: matchedCategory?.name || formatTaxonomyTitle(categorySlug),
      href: childSlug ? basePath : undefined,
    });
  }

  if (childSlug) {
    basePath += `/${childSlug}`;
    breadcrumbs.push({
      label: matchedChildCategory?.name || formatTaxonomyTitle(childSlug),
    });
  }

  // 5. Build Titles and Meta Descriptions
  const categoryTitle = matchedCategory?.name || (categorySlug ? formatTaxonomyTitle(categorySlug) : '');
  const childTitle = matchedChildCategory?.name || (childSlug ? formatTaxonomyTitle(childSlug) : '');
  const audienceTitle = audience ? formatTaxonomyTitle(audience) : '';

  let pageTitle = 'COLLECTIONS';
  let pageSubtitle = 'Precision luxury apparel crafted in India.';

  if (childTitle && categoryTitle && audienceTitle) {
    pageTitle = `${childTitle.toUpperCase()}`;
    pageSubtitle = `${audienceTitle}'s ${categoryTitle} • Engineered cuts, luxury textiles & modern silhouettes`;
  } else if (childTitle && categoryTitle) {
    pageTitle = `${childTitle.toUpperCase()}`;
    pageSubtitle = `${categoryTitle} • Atelier craftsmanship & timeless silhouettes`;
  } else if (categorySlug && categoryTitle && audienceTitle) {
    if (categoryTitle.toLowerCase() === audienceTitle.toLowerCase()) {
      const deptConfig = audience ? DEPARTMENTS[audience] : undefined;
      pageTitle = deptConfig?.title || `${audienceTitle.toUpperCase()}'S COLLECTION`;
      pageSubtitle = deptConfig?.subtitle || `Elevated essentials curated for ${audienceTitle.toLowerCase()}`;
    } else {
      pageTitle = `${audienceTitle.toUpperCase()}'S ${categoryTitle.toUpperCase()}`;
      pageSubtitle = `Elevated ${categoryTitle.toLowerCase()} essentials curated for ${audienceTitle.toLowerCase()}`;
    }
  } else if (categorySlug && categoryTitle) {
    pageTitle = `${categoryTitle.toUpperCase()} COLLECTION`;
    pageSubtitle = matchedCategory?.description || `Curated ${categoryTitle.toLowerCase()} garments with atelier precision`;
  } else if (audienceTitle) {
    const deptConfig = audience ? DEPARTMENTS[audience] : undefined;
    pageTitle = deptConfig?.title || `${audienceTitle.toUpperCase()}'S COLLECTION`;
    pageSubtitle = deptConfig?.subtitle || `Explore luxury apparel, contemporary streetwear, and refined essentials for ${audienceTitle.toLowerCase()}`;
  }

  const breadcrumbString = breadcrumbs.map((b) => b.label.toUpperCase()).join(' · ');
  const pageDescription =
    matchedChildCategory?.description ||
    matchedCategory?.description ||
    `Shop ${pageTitle} at Lexido — minimalist luxury apparel, organic textiles, and atelier precision.`;

  // 6. Build Interactive Subtags / Filter Pills
  // When at /men: subtags show categories (Streetwear, Gym Wear, Old Money...)
  // When at /men/streetwear: subtags show child categories (Oversized T-Shirts, Hoodies...)
  // When at /men/streetwear/oversized-t-shirts: subtags show sibling child categories
  const subtags: Array<{ label: string; href?: string; slug?: string }> = [];

  const audiencePrefix = audience ? `/${audience}` : '';
  const categoryPrefix = categorySlug ? `${audiencePrefix}/${categorySlug}` : audiencePrefix;

  if (categorySlug && childCategories.length > 0) {
    subtags.push({
      label: `All ${categoryTitle}`,
      href: categoryPrefix,
    });
    for (const c of childCategories) {
      subtags.push({
        label: c.name,
        href: `${categoryPrefix}/${c.slug}`,
        slug: c.slug,
      });
    }
  } else if (categorySlug && !childSlug) {
    // Curated fallback child categories for popular categories
    const commonChildMap: Record<string, string[]> = {
      streetwear: ['Oversized T-Shirts', 'Graphic T-Shirts', 'Oversized Hoodies', 'Zip Hoodies', 'Cargo Pants', 'Baggy Jeans', 'Denim Jackets', 'Shorts'],
      gymwear: ['Signature Gym Set', 'Training Joggers', 'Drop Armhole Tanks', 'Compression Tops', 'Fleece Shorts'],
      'old-money': ['Oxford Cotton Shirts', 'Cashmere Crewnecks', 'French Linen Trousers', 'Double-Breasted Blazers', 'Classic Trench Coats'],
      casual: ['Crewneck Tees', 'Pique Polo Shirts', 'Denim Overshirts', 'Relaxed Chinos', 'Straight Leg Jeans'],
      formal: ['Two-Piece Suits', 'Dress Shirts', 'Tuxedo Jackets', 'Wool Trousers', 'Oxford Shoes'],
      winter: ['Down Puffer Jackets', 'Wool Overcoats', 'Merino Base Layers', 'Fleece Lined Joggers'],
      accessories: ['Leather Duffle Bags', 'Automatic Watches', 'Silver Chains', 'Aviator Sunglasses', 'Atelier Wallets'],
    };

    const curatedChildren = commonChildMap[categorySlug.toLowerCase()] || [];
    if (curatedChildren.length > 0) {
      subtags.push({ label: `All ${categoryTitle}`, href: categoryPrefix });
      for (const ch of curatedChildren) {
        const slug = ch.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        subtags.push({
          label: ch,
          href: `${categoryPrefix}/${slug}`,
          slug,
        });
      }
    } else {
      subtags.push({ label: 'All' });
    }
  } else if (audience && !categorySlug) {
    // At top audience level (e.g. /men or /women)
    subtags.push({ label: `All ${audienceTitle}`, href: audiencePrefix });
    if (childCategories.length > 0) {
      for (const cat of childCategories) {
        subtags.push({
          label: cat.name,
          href: `${audiencePrefix}/${cat.slug}`,
          slug: cat.slug,
        });
      }
    } else {
      const topCategories = ['Streetwear', 'Gym Wear', 'Old Money', 'Casual', 'Formal', 'Winter Collection', 'Accessories'];
      for (const catName of topCategories) {
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        subtags.push({
          label: catName,
          href: `${audiencePrefix}/${slug}`,
          slug,
        });
      }
    }
  } else {
    subtags.push({ label: 'All' });
  }

  // 7. Query Database Products
  let items: ProductData[] = [];

  try {
    if (db) {
      const conditions: any[] = [
        sql`${products.deletedAt} IS NULL`,
        eq(products.status, 'active'),
      ];

      // A. Filter by Audience / Gender
      if (audience) {
        if (audience === 'men') {
          conditions.push(or(sql`${products.gender} IS NULL`, eq(sql`lower(${products.gender})`, 'men'), eq(sql`lower(${products.gender})`, 'unisex'), eq(sql`lower(${products.gender})`, 'male')));
        } else if (audience === 'women') {
          conditions.push(or(sql`${products.gender} IS NULL`, eq(sql`lower(${products.gender})`, 'women'), eq(sql`lower(${products.gender})`, 'unisex'), eq(sql`lower(${products.gender})`, 'female')));
        } else if (audience === 'kids') {
          conditions.push(or(sql`${products.gender} IS NULL`, eq(sql`lower(${products.gender})`, 'kids'), eq(sql`lower(${products.gender})`, 'boys'), eq(sql`lower(${products.gender})`, 'girls')));
        } else if (audience === 'unisex') {
          conditions.push(eq(sql`lower(${products.gender})`, 'unisex'));
        }
      }

      // B. Filter by Category (Recursive 3-Tier Hierarchy: Root -> Subcategories -> Child Categories)
      if (matchedCategory) {
        const catId = matchedCategory.id;
        const catCondition = or(
          eq(products.categoryId, catId),
          sql`exists (
            select 1 from ${productCategories}
            where ${productCategories.productId} = ${products.id} and ${productCategories.categoryId} = ${catId}
          )`,
          sql`exists (
            with recursive cat_tree as (
              select id from ${categories} where id = ${catId}
              union all
              select c.id from ${categories} c
              join cat_tree ct on c.parent_id = ct.id
              where c.deleted_at is null
            )
            select 1 from cat_tree ct
            where ct.id = ${products.categoryId}
               or exists (
                 select 1 from ${productCategories} pc
                 where pc.product_id = ${products.id} and pc.category_id = ct.id
               )
          )`
        );
        conditions.push(catCondition);
      } else if (categorySlug) {
        // Fallback matching category by name or collection tag
        const cleanCatName = categorySlug.replace(/[-_]/g, ' ');
        conditions.push(
          or(
            ilike(products.name, `%${cleanCatName}%`),
            ilike(products.description, `%${cleanCatName}%`),
            ilike(products.collection, `%${cleanCatName}%`)
          )
        );
      }

      // C. Filter by Child Category / Micro Category / Fit
      if (matchedChildCategory) {
        const childId = matchedChildCategory.id;
        conditions.push(
          or(
            eq(products.categoryId, childId),
            sql`exists (
              select 1 from ${productCategories}
              where ${productCategories.productId} = ${products.id} and ${productCategories.categoryId} = ${childId}
            )`
          )
        );
      } else if (childSlug) {
        // Smart attribute & keyword matching (e.g. 'oversized-shirt' -> fit 'Oversized' or name 'Shirt')
        const childKeywords = childSlug.split(/[-_]+/).filter(Boolean);
        const childClauses = childKeywords.map((w) =>
          or(
            ilike(products.name, `%${w}%`),
            ilike(products.description, `%${w}%`),
            ilike(products.fit, `%${w}%`)
          )
        );
        if (childClauses.length > 0) {
          conditions.push(and(...childClauses));
        }
      }

      // Sort Order
      let orderByClause = desc(products.createdAt);
      if (sort === 'price-low') orderByClause = asc(products.price);
      if (sort === 'price-high') orderByClause = desc(products.price);

      const dbProducts = await db
        .select({
          product: products,
          category: categories,
          brand: brands,
          primaryImage: sql<string | null>`(select url from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(48);

      items = dbProducts.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        slug: p.product.slug,
        price: Number(p.product.price),
        compareAtPrice: p.product.compareAtPrice ? Number(p.product.compareAtPrice) : undefined,
        category: p.category?.name || categoryTitle || pageTitle,
        rating: 5.0,
        reviewCount: 0,
        images: p.primaryImage
          ? [p.primaryImage]
          : [
              matchedCategory?.imageUrl ||
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
            ],
        badges: childTitle ? [childTitle.toUpperCase()] : categoryTitle ? [categoryTitle.toUpperCase()] : [],
        inStock: true,
      }));

      // If category or child filter returned 0 items, fetch audience products as graceful fallback
      if (items.length === 0) {
        const relaxedConditions: any[] = [
          sql`${products.deletedAt} IS NULL`,
          eq(products.status, 'active'),
        ];
        if (audience === 'men') {
          relaxedConditions.push(or(sql`${products.gender} IS NULL`, eq(sql`lower(${products.gender})`, 'men'), eq(sql`lower(${products.gender})`, 'unisex'), eq(sql`lower(${products.gender})`, 'male')));
        } else if (audience === 'women') {
          relaxedConditions.push(or(sql`${products.gender} IS NULL`, eq(sql`lower(${products.gender})`, 'women'), eq(sql`lower(${products.gender})`, 'unisex'), eq(sql`lower(${products.gender})`, 'female')));
        } else if (audience === 'kids') {
          relaxedConditions.push(or(sql`${products.gender} IS NULL`, eq(sql`lower(${products.gender})`, 'kids'), eq(sql`lower(${products.gender})`, 'boys'), eq(sql`lower(${products.gender})`, 'girls')));
        }

        const fallbackDbProducts = await db
          .select({
            product: products,
            category: categories,
            brand: brands,
            primaryImage: sql<string | null>`(select url from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .leftJoin(brands, eq(products.brandId, brands.id))
          .where(and(...relaxedConditions))
          .orderBy(orderByClause)
          .limit(24);

        if (fallbackDbProducts.length > 0) {
          items = fallbackDbProducts.map((p) => ({
            id: p.product.id,
            name: p.product.name,
            slug: p.product.slug,
            price: Number(p.product.price),
            compareAtPrice: p.product.compareAtPrice ? Number(p.product.compareAtPrice) : undefined,
            category: p.category?.name || categoryTitle || pageTitle,
            rating: 5.0,
            reviewCount: 0,
            images: p.primaryImage
              ? [p.primaryImage]
              : [
                  matchedCategory?.imageUrl ||
                    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
                ],
            badges: ['FEATURED COLLECTION'],
            inStock: true,
          }));
        }
      }
    }
  } catch (dbErr) {
    console.error('resolveHierarchicalCatalog query error:', dbErr);
  }

  const heroImage =
    matchedChildCategory?.imageUrl ||
    matchedCategory?.imageUrl ||
    (audience ? DEPARTMENTS[audience]?.heroImage : null) ||
    null;

  return {
    resolution: {
      audience,
      categorySlug,
      subcategorySlug: childSlug,
      childSlug,
      matchedCategory,
      matchedChildCategory,
      matchedProduct: null,
      isProduct: false,
      breadcrumbs,
      pageTitle,
      pageSubtitle,
      pageDescription,
      breadcrumbString,
      subtags,
      heroImage,
    },
    items,
  };
}

