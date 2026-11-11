import { db } from '@/lib/db';
import { salesCampaigns } from '@/lib/db/schema/catalog/promotions';
import { products as productsTable } from '@/lib/db/schema/catalog/products';
import { productRepository } from '../product/product.repository';
import { getCachedFeaturedProducts, getCachedCategories } from '../performance/cache';
import { ProductMapper } from '../product/product.mapper';
import { type ProductCardModel } from '../product/product.types';
import { PricingEngine } from '../pricing/pricing-engine';
import { safeQuery } from '@/lib/db/safe-query';
import { and, eq, lte, gte, desc, sql } from 'drizzle-orm';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { connection } from 'next/server';

export interface SeasonalCampaignData {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startsAt: Date;
  endsAt: Date;
  bannerUrl: string;
  badgeLabel: string;
  products: ProductData[];
}

/**
 * HomepageService orchestrates and pre-aggregates catalog data for storefront landing widgets.
 */
export class HomepageService {
  async getHero() {
    return {
      title: 'Discover Our Products',
      subtitle: 'Browse our latest catalog collections and quality products.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
      ctaLabel: 'Browse Products',
      ctaHref: '/products',
    };
  }

  async getFeaturedProducts(limit = 8): Promise<ProductCardModel[]> {
    const rawProducts = await getCachedFeaturedProducts(limit);
    return rawProducts.map((row) => ProductMapper.toProductCardModel(row));
  }

  async getFeaturedCategories() {
    const rawCategories = await getCachedCategories();
    // Maps active categories for landing visual grids
    return rawCategories.slice(0, 4).map((cat) => {
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        imageUrl: (cat as any).imageUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=450&auto=format&fit=crop&q=60',
      };
    });
  }

  /**
   * Dynamically loads active seasonal sale campaigns (e.g. "Dussehra Special", "Daily Sale")
   * and calculates discount pricing via PricingEngine.
   * Accepts optional pre-fetched products to prevent duplicate database calls.
   */
  async getSeasonalSaleSections(providedProducts?: ProductCardModel[]): Promise<SeasonalCampaignData[]> {
    await connection();
    let activeCampaigns = await safeQuery(
      () =>
        db
          .select()
          .from(salesCampaigns)
          .where(
            and(
              eq(salesCampaigns.status, 'active'),
              sql`${salesCampaigns.deletedAt} IS NULL`
            )
          )
          .orderBy(desc(salesCampaigns.priority)),
      'active_seasonal_campaigns'
    );

    // Auto-seed Dussehra Special & Daily Sale into PostgreSQL DB if unpopulated
    if (activeCampaigns.length === 0) {
      try {
        const dussehraStarts = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dussehraEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const dailyStarts = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyEnds = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await safeQuery(
          () =>
            db.insert(salesCampaigns).values([
              {
                name: 'Dussehra Special Sale',
                description: 'Celebrate the festive season with up to 25% OFF across top collections!',
                discountType: 'percentage',
                discountValue: '25',
                startsAt: dussehraStarts,
                endsAt: dussehraEnds,
                status: 'active',
                priority: 100,
                isStackable: true,
                metadata: { badgeLabel: 'DUSSEHRA SPECIAL • 25% OFF' },
              },
              {
                name: 'Daily Flash Sale',
                description: 'Limited 24-hour deals on best-selling luxury apparel & footwear.',
                discountType: 'fixed',
                discountValue: '500',
                startsAt: dailyStarts,
                endsAt: dailyEnds,
                status: 'active',
                priority: 90,
                isStackable: true,
                metadata: { badgeLabel: 'DAILY FLASH SALE • ₹500 OFF' },
              },
            ]),
          'seed_default_sales_campaigns'
        );

        activeCampaigns = await safeQuery(
          () =>
            db
              .select()
              .from(salesCampaigns)
              .where(
                and(
                  eq(salesCampaigns.status, 'active'),
                  sql`${salesCampaigns.deletedAt} IS NULL`
                )
              )
              .orderBy(desc(salesCampaigns.priority)),
          'active_seasonal_campaigns_re-query'
        );
      } catch (err) {
        console.warn('Failed to seed default sales campaigns to database:', err);
      }
    }

    // Deduplicate active campaigns by name to ensure no duplicate sections render
    const uniqueCampaignsMap = new Map<string, typeof activeCampaigns[number]>();
    for (const campaign of activeCampaigns) {
      if (!uniqueCampaignsMap.has(campaign.name)) {
        uniqueCampaignsMap.set(campaign.name, campaign);
      }
    }
    const uniqueCampaigns = Array.from(uniqueCampaignsMap.values());

    const catalogProducts = providedProducts || (await this.getFeaturedProducts(8));

    // If active campaigns exist in database, map them with catalog products
    if (uniqueCampaigns.length > 0) {
      return uniqueCampaigns.map((c) => {
        const dVal = parseFloat(c.discountValue);
        const discountType = (c.discountType === 'percentage' ? 'percentage' : 'fixed') as 'percentage' | 'fixed';
        const badgeText = discountType === 'percentage' ? `${dVal}% OFF` : `₹${dVal} OFF`;

        const meta = (c.metadata as Record<string, any>) || {};

        const eligibleProducts = catalogProducts.filter((p) =>
          PricingEngine.isProductEligible(
            { metadata: meta },
            { id: p.id, categoryId: (p as any).categoryId }
          )
        );

        const campaignProducts: ProductData[] = eligibleProducts.map((p) => {
          const calc = PricingEngine.calculatePrice({
            productId: p.id,
            categoryId: (p as any).categoryId,
            basePrice: p.price,
            activeCampaigns: [
              {
                id: c.id,
                name: c.name,
                discountType,
                discountValue: dVal,
                priority: c.priority,
                metadata: meta,
              },
            ],
          });

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: calc.finalPrice,
            compareAtPrice: p.price,
            category: p.categoryName ?? undefined,
            rating: p.rating ?? undefined,
            reviewCount: p.reviewsCount,
            images: p.imageUrl ? [p.imageUrl] : [],
            badges: [`${c.name.toUpperCase()} - ${badgeText}`],
            inStock: p.quantity > 0,
          };
        });

        return {
          id: c.id,
          name: c.name,
          description: c.description || 'Exclusive festive prices for a limited time only!',
          discountType,
          discountValue: dVal,
          startsAt: new Date(c.startsAt),
          endsAt: new Date(c.endsAt),
          bannerUrl: meta.bannerUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
          badgeLabel: `${c.name} • ${badgeText}`,
          products: campaignProducts,
        };
      });
    }

    // Default curated seasonal sections fallback (Dussehra Special & Daily Sale)
    const dussehraEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dailyEnds = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const dussehraProducts: ProductData[] = catalogProducts.slice(0, 4).map((p) => {
      const calc = PricingEngine.calculatePrice({
        basePrice: p.price,
        activeCampaigns: [
          {
            id: 'dussehra-special-id',
            name: 'Dussehra Special',
            discountType: 'percentage',
            discountValue: 25,
            priority: 100,
          },
        ],
      });
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: calc.finalPrice,
        compareAtPrice: p.price,
        category: p.categoryName ?? 'Festive Collection',
        rating: p.rating ?? 4.8,
        reviewCount: p.reviewsCount || 12,
        images: p.imageUrl ? [p.imageUrl] : [],
        badges: ['DUSSEHRA SPECIAL - 25% OFF'],
        inStock: p.quantity > 0,
      };
    });

    const dailyProducts: ProductData[] = catalogProducts.slice(4, 8).map((p) => {
      const calc = PricingEngine.calculatePrice({
        basePrice: p.price,
        activeCampaigns: [
          {
            id: 'daily-sale-id',
            name: 'Daily Deal',
            discountType: 'percentage',
            discountValue: 15,
            priority: 90,
          },
        ],
      });
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: calc.finalPrice,
        compareAtPrice: p.price,
        category: p.categoryName ?? 'Daily Deals',
        rating: p.rating ?? 4.6,
        reviewCount: p.reviewsCount || 8,
        images: p.imageUrl ? [p.imageUrl] : [],
        badges: ['DAILY DEAL - 15% OFF'],
        inStock: p.quantity > 0,
      };
    });

    const now = new Date();
    return [
      {
        id: 'dussehra-special-campaign',
        name: 'Dussehra Special Sale',
        description: 'Celebrate the festive season with up to 25% OFF on premium collections!',
        discountType: 'percentage',
        discountValue: 25,
        startsAt: now,
        endsAt: dussehraEnds,
        bannerUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
        badgeLabel: 'DUSSEHRA SPECIAL • 25% OFF',
        products: dussehraProducts,
      },
      {
        id: 'daily-deal-campaign',
        name: 'Daily Flash Sale',
        description: 'Handpicked daily deals refreshed every 24 hours. Grab them before stock runs out!',
        discountType: 'percentage',
        discountValue: 15,
        startsAt: now,
        endsAt: dailyEnds,
        bannerUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop&q=80',
        badgeLabel: 'DAILY FLASH SALE • 15% OFF',
        products: dailyProducts,
      },
    ];
  }

  /**
   * Aggregates homepage data feeds in parallel.
   */
  async getHomepageData() {
    const [hero, featuredProducts, featuredCategories] = await Promise.all([
      this.getHero(),
      this.getFeaturedProducts(8),
      this.getFeaturedCategories(),
    ]);

    // Reuse pre-fetched featured products to eliminate duplicate database roundtrip
    const seasonalSections = await this.getSeasonalSaleSections(featuredProducts);

    return {
      hero,
      featuredProducts,
      featuredCategories,
      seasonalSections,
    };
  }
}

export const homepageService = new HomepageService();
export default homepageService;
