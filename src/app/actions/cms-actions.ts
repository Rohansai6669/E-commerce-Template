'use server';

import fs from 'fs';
import path from 'path';
import bundledCmsStorage from '@/lib/cms/cms-storage.json';
import { revalidatePath } from 'next/cache';
import { PageConfig, SiteDesignTokens, NavAppearanceConfig, FooterConfig } from '@/types/cms';
import { defaultHomepageConfig, defaultNavAppearanceConfig, defaultFooterConfig } from '@/lib/cms/defaults';
import { homepageService, type SeasonalCampaignData } from '@/core/storefront/homepage.service';
import { type ProductCardModel } from '@/core/product/product.types';

import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { eq } from 'drizzle-orm';
import { invalidateCmsCache } from '@/lib/cms/cms-server';

const CMS_STORAGE_PATH = path.join(process.cwd(), 'src', 'lib', 'cms', 'cms-storage.json');

/**
 * Reads persistent server-side PageConfig from DB or disk.
 */
export async function getCmsPageConfigServer(slug: string = '/'): Promise<PageConfig> {
  try {
    // Try Database Sync first
    if (db) {
      const dbKey = `page_config_${slug}`;
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, dbKey))
        .limit(1);

      if (res && res.value) {
        return res.value as PageConfig;
      }
    }
  } catch (dbErr) {
    console.warn('getCmsPageConfigServer DB sync fetch warning:', dbErr);
  }

  try {
    if (fs.existsSync(CMS_STORAGE_PATH)) {
      const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data[slug]) {
        return data[slug];
      }
    }
  } catch (err) {
    console.error('getCmsPageConfigServer storage error:', err);
  }
  return defaultHomepageConfig;
}

/**
 * Saves PageConfig both to Database (Authoritative) and server filesystem (Dev mirror).
 */
export async function saveCmsPageConfigAction(slug: string, config: PageConfig): Promise<boolean> {
  try {
    const dbKey = `page_config_${slug}`;

    // 1. Authoritative Primary Sync to PostgreSQL Database
    if (db) {
      try {
        await db
          .insert(cmsSiteSettings)
          .values({
            key: dbKey,
            value: config as any,
          })
          .onConflictDoUpdate({
            target: cmsSiteSettings.key,
            set: {
              value: config as any,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        console.warn('saveCmsPageConfigAction DB sync write warning:', dbErr);
      }
    }

    // 2. Local dev filesystem mirror (only in local development, skipped on serverless / Vercel)
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      try {
        let existingData: Record<string, PageConfig> = {};
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          try {
            const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
            existingData = JSON.parse(raw);
          } catch {
            existingData = {};
          }
        }
        existingData[slug] = config;
        fs.writeFileSync(CMS_STORAGE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('saveCmsPageConfigAction disk mirror skipped:', fsErr);
      }
    }

    // 3. Flush in-memory cache and revalidate storefront route
    invalidateCmsCache(slug);
    revalidatePath('/');
    revalidatePath('/', 'layout');
    return true;
  } catch (err) {
    console.error('saveCmsPageConfigAction error:', err);
    return false;
  }
}

/**
 * Saves Site Design Tokens with full Database Sync.
 */
export async function saveSiteDesignTokensAction(tokens: SiteDesignTokens): Promise<boolean> {
  try {
    // 1. Authoritative Primary Sync to Database
    if (db) {
      try {
        await db
          .insert(cmsSiteSettings)
          .values({
            key: 'design_tokens',
            value: tokens as any,
          })
          .onConflictDoUpdate({
            target: cmsSiteSettings.key,
            set: {
              value: tokens as any,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        console.warn('saveSiteDesignTokensAction DB sync warning:', dbErr);
      }
    }

    // 2. Local dev filesystem mirror
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      try {
        let existingData: Record<string, any> = {};
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          try {
            const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
            existingData = JSON.parse(raw);
          } catch {
            existingData = {};
          }
        }
        existingData.site_design_tokens = tokens;
        fs.writeFileSync(CMS_STORAGE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('saveSiteDesignTokensAction disk mirror skipped:', fsErr);
      }
    }

    invalidateCmsCache('design_tokens');
    revalidatePath('/');
    revalidatePath('/', 'layout');
    return true;
  } catch (err) {
    console.error('saveSiteDesignTokensAction error:', err);
    return false;
  }
}

/**
 * Saves Storefront Navigation Appearance with full Database & Disk Sync.
 */
export async function saveNavAppearanceConfigAction(config: NavAppearanceConfig): Promise<boolean> {
  try {
    // 1. Authoritative Primary Sync to Database
    if (db) {
      try {
        await db
          .insert(cmsSiteSettings)
          .values({
            key: 'nav_appearance',
            value: config as any,
          })
          .onConflictDoUpdate({
            target: cmsSiteSettings.key,
            set: {
              value: config as any,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        console.warn('saveNavAppearanceConfigAction DB sync write warning:', dbErr);
      }
    }

    // 2. Local dev filesystem mirror
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      try {
        let existingData: Record<string, any> = {};
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          try {
            const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
            existingData = JSON.parse(raw);
          } catch {
            existingData = {};
          }
        }
        existingData.nav_appearance = config;
        fs.writeFileSync(CMS_STORAGE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('saveNavAppearanceConfigAction disk mirror skipped:', fsErr);
      }
    }

    invalidateCmsCache('nav_appearance');
    revalidatePath('/', 'layout');
    return true;
  } catch (err) {
    console.error('saveNavAppearanceConfigAction error:', err);
    return false;
  }
}

/**
 * Reads Storefront Navigation Appearance with DB sync.
 */
export async function getNavAppearanceConfigServer(): Promise<NavAppearanceConfig> {
  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, 'nav_appearance'))
        .limit(1);

      if (res && res.value) {
        return {
          ...defaultNavAppearanceConfig,
          ...(res.value as Partial<NavAppearanceConfig>),
        };
      }
    }
  } catch (err) {
    console.warn('getNavAppearanceConfigServer DB sync error:', err);
  }

  try {
    if (fs.existsSync(CMS_STORAGE_PATH)) {
      const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data.nav_appearance) {
        return {
          ...defaultNavAppearanceConfig,
          ...data.nav_appearance,
        };
      }
    }
  } catch (err) {
    console.error('getNavAppearanceConfigServer storage error:', err);
  }

  if ((bundledCmsStorage as any).nav_appearance) {
    return {
      ...defaultNavAppearanceConfig,
      ...(bundledCmsStorage as any).nav_appearance,
    };
  }

  return defaultNavAppearanceConfig;
}

/**
 * Saves Storefront Footer Configuration with full Database & Disk Sync.
 */
export async function saveFooterConfigAction(config: FooterConfig): Promise<boolean> {
  try {
    // 1. Authoritative Primary Sync to Database
    if (db) {
      try {
        await db
          .insert(cmsSiteSettings)
          .values({
            key: 'footer_config',
            value: config as any,
          })
          .onConflictDoUpdate({
            target: cmsSiteSettings.key,
            set: {
              value: config as any,
              updatedAt: new Date(),
            },
          });
      } catch (dbErr) {
        console.warn('saveFooterConfigAction DB sync write warning:', dbErr);
      }
    }

    // 2. Local dev filesystem mirror
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      try {
        let existingData: Record<string, any> = {};
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          try {
            const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
            existingData = JSON.parse(raw);
          } catch {
            existingData = {};
          }
        }
        existingData.footer_config = config;
        fs.writeFileSync(CMS_STORAGE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('saveFooterConfigAction disk mirror skipped:', fsErr);
      }
    }

    invalidateCmsCache('footer_config');
    revalidatePath('/', 'layout');
    return true;
  } catch (err) {
    console.error('saveFooterConfigAction error:', err);
    return false;
  }
}

/**
 * Reads Storefront Footer Configuration with DB sync.
 */
export async function getFooterConfigServer(): Promise<FooterConfig> {
  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, 'footer_config'))
        .limit(1);

      if (res && res.value) {
        return {
          ...defaultFooterConfig,
          ...(res.value as Partial<FooterConfig>),
        };
      }
    }
  } catch (err) {
    console.warn('getFooterConfigServer DB sync error:', err);
  }

  try {
    if (fs.existsSync(CMS_STORAGE_PATH)) {
      const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data.footer_config) {
        return {
          ...defaultFooterConfig,
          ...data.footer_config,
        };
      }
    }
  } catch (err) {
    console.error('getFooterConfigServer storage error:', err);
  }

  if ((bundledCmsStorage as any).footer_config) {
    return {
      ...defaultFooterConfig,
      ...(bundledCmsStorage as any).footer_config,
    };
  }

  return defaultFooterConfig;
}

/**
 * Reads Site Design Tokens with DB sync.
 */
export async function getSiteDesignTokensServer(): Promise<SiteDesignTokens | null> {
  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, 'design_tokens'))
        .limit(1);

      if (res && res.value) {
        return res.value as SiteDesignTokens;
      }
    }
  } catch (err) {
    console.warn('getSiteDesignTokensServer DB sync error:', err);
  }
  return null;
}

/**
 * Server Action to load homepage catalog and seasonal data for the Visual Builder preview.
 */
export async function fetchHomepageVisualBuilderData(): Promise<{
  seasonalSections: SeasonalCampaignData[];
  featuredProducts: ProductCardModel[];
}> {
  try {
    const data = await homepageService.getHomepageData();
    return {
      seasonalSections: data.seasonalSections,
      featuredProducts: data.featuredProducts,
    };
  } catch (err) {
    console.error('fetchHomepageVisualBuilderData error:', err);
    return {
      seasonalSections: [],
      featuredProducts: [],
    };
  }
}
