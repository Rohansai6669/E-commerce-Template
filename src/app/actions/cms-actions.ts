'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { PageConfig } from '@/types/cms';
import { defaultHomepageConfig } from '@/lib/cms/defaults';
import { homepageService, type SeasonalCampaignData } from '@/core/storefront/homepage.service';
import { type ProductCardModel } from '@/core/product/product.types';

import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { eq } from 'drizzle-orm';
import { SiteDesignTokens } from '@/types/cms';

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
 * Saves PageConfig both to Database and server filesystem for complete DB sync.
 */
export async function saveCmsPageConfigAction(slug: string, config: PageConfig): Promise<boolean> {
  try {
    // Save to Disk Storage
    let existingData: Record<string, PageConfig> = {};
    if (fs.existsSync(CMS_STORAGE_PATH)) {
      try {
        const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
        existingData = JSON.parse(raw);
      } catch (e) {
        existingData = {};
      }
    }
    existingData[slug] = config;
    fs.writeFileSync(CMS_STORAGE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');

    // Sync to Database
    try {
      if (db) {
        const dbKey = `page_config_${slug}`;
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
      }
    } catch (dbErr) {
      console.warn('saveCmsPageConfigAction DB sync write warning:', dbErr);
    }

    revalidatePath('/');
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
    if (db) {
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
    }
    revalidatePath('/');
    return true;
  } catch (err) {
    console.error('saveSiteDesignTokensAction error:', err);
    return false;
  }
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
