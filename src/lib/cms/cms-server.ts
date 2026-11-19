import fs from 'fs';
import path from 'path';
import bundledCmsStorage from './cms-storage.json';
import { PageConfig, SiteDesignTokens, NavAppearanceConfig, FooterConfig } from '@/types/cms';
import { defaultHomepageConfig, defaultSiteDesignTokens, defaultNavAppearanceConfig, defaultFooterConfig } from '@/lib/cms/defaults';
import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { eq } from 'drizzle-orm';

const CMS_STORAGE_PATH = path.join(process.cwd(), 'src', 'lib', 'cms', 'cms-storage.json');

// In-memory microsecond cache for CMS settings to prevent roundtrips to remote DB on every page view
const cmsMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const CMS_CACHE_TTL = 60 * 1000; // 60 seconds

export function invalidateCmsCache(key?: string) {
  // Clear the in-memory cache completely to guarantee fresh state across all components
  cmsMemoryCache.clear();
}

/**
 * Self-healing helper: If a CMS setting is retrieved from bundled JSON fallback,
 * asynchronously seed it into PostgreSQL so the database becomes the permanent source of truth.
 */
async function ensureDbCmsKey(key: string, value: unknown) {
  if (!db || !value) return;
  try {
    await db
      .insert(cmsSiteSettings)
      .values({
        key,
        value: value as any,
      })
      .onConflictDoNothing();
  } catch {
    // Non-blocking self-healing
  }
}

/**
 * Direct server-side read of persistent PageConfig from DB or disk.
 * Fast in-memory cached to eliminate remote DB latency on storefront renders.
 */
export async function getCmsPageConfigServer(slug: string = '/'): Promise<PageConfig> {
  const cacheKey = `page_config_${slug}`;
  const now = Date.now();
  const cached = cmsMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value as PageConfig;
  }

  let result: PageConfig | null = null;
  let fromDb = false;

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as PageConfig;
        fromDb = true;
      }
    }
  } catch (dbErr) {
    console.warn('getCmsPageConfigServer DB fetch warning:', dbErr);
  }

  if (!result) {
    // Only attempt disk read in non-serverless dev
    if (!process.env.VERCEL) {
      try {
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
          const data = JSON.parse(raw);
          if (data[slug]) {
            result = data[slug] as PageConfig;
          }
        }
      } catch (err) {
        console.error('getCmsPageConfigServer storage error:', err);
      }
    }
    if (!result && (bundledCmsStorage as Record<string, any>)[slug]) {
      result = (bundledCmsStorage as Record<string, any>)[slug] as PageConfig;
    }
  }

  const finalConfig = result || defaultHomepageConfig;
  cmsMemoryCache.set(cacheKey, { value: finalConfig, expiresAt: Date.now() + CMS_CACHE_TTL });

  // Self-heal DB if it wasn't populated
  if (!fromDb) {
    ensureDbCmsKey(cacheKey, finalConfig);
  }

  return finalConfig;
}

/**
 * Direct server-side read of Site Design Tokens with DB sync.
 */
export async function getSiteDesignTokensServer(): Promise<SiteDesignTokens> {
  const cacheKey = 'design_tokens';
  const now = Date.now();
  const cached = cmsMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now && cached.value) {
    return cached.value as SiteDesignTokens;
  }

  let result: SiteDesignTokens | null = null;
  let fromDb = false;

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as SiteDesignTokens;
        fromDb = true;
      }
    }
  } catch (err) {
    console.warn('getSiteDesignTokensServer DB fetch error:', err);
  }

  if (!result) {
    if (!process.env.VERCEL) {
      try {
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
          const data = JSON.parse(raw);
          if (data.site_design_tokens) {
            result = data.site_design_tokens as SiteDesignTokens;
          }
        }
      } catch (err) {
        console.error('getSiteDesignTokensServer storage error:', err);
      }
    }
    if (!result && (bundledCmsStorage as any).site_design_tokens) {
      result = (bundledCmsStorage as any).site_design_tokens as SiteDesignTokens;
    }
  }

  const finalTokens: SiteDesignTokens = {
    ...defaultSiteDesignTokens,
    ...(result || {}),
  };

  cmsMemoryCache.set(cacheKey, { value: finalTokens, expiresAt: Date.now() + CMS_CACHE_TTL });
  if (!fromDb) {
    ensureDbCmsKey(cacheKey, finalTokens);
  }
  return finalTokens;
}

/**
 * Direct server-side read of Storefront Navigation Appearance with DB sync.
 */
export async function getNavAppearanceConfigServer(): Promise<NavAppearanceConfig> {
  const cacheKey = 'nav_appearance';
  const now = Date.now();
  const cached = cmsMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value as NavAppearanceConfig;
  }

  let result: Partial<NavAppearanceConfig> | null = null;
  let fromDb = false;

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as Partial<NavAppearanceConfig>;
        fromDb = true;
      }
    }
  } catch (err) {
    console.warn('getNavAppearanceConfigServer DB fetch error:', err);
  }

  if (!result) {
    if (!process.env.VERCEL) {
      try {
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
          const data = JSON.parse(raw);
          if (data.nav_appearance) {
            result = data.nav_appearance;
          }
        }
      } catch (err) {
        console.error('getNavAppearanceConfigServer storage error:', err);
      }
    }
    if (!result && (bundledCmsStorage as any).nav_appearance) {
      result = (bundledCmsStorage as any).nav_appearance as Partial<NavAppearanceConfig>;
    }
  }

  const finalConfig: NavAppearanceConfig = {
    ...defaultNavAppearanceConfig,
    ...(result || {}),
  };

  cmsMemoryCache.set(cacheKey, { value: finalConfig, expiresAt: Date.now() + CMS_CACHE_TTL });
  if (!fromDb) {
    ensureDbCmsKey(cacheKey, finalConfig);
  }
  return finalConfig;
}

/**
 * Direct server-side read of Storefront Footer Configuration with DB sync.
 */
export async function getFooterConfigServer(): Promise<FooterConfig> {
  const cacheKey = 'footer_config';
  const now = Date.now();
  const cached = cmsMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value as FooterConfig;
  }

  let result: Partial<FooterConfig> | null = null;
  let fromDb = false;

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as Partial<FooterConfig>;
        fromDb = true;
      }
    }
  } catch (err) {
    console.warn('getFooterConfigServer DB fetch error:', err);
  }

  if (!result) {
    if (!process.env.VERCEL) {
      try {
        if (fs.existsSync(CMS_STORAGE_PATH)) {
          const raw = fs.readFileSync(CMS_STORAGE_PATH, 'utf-8');
          const data = JSON.parse(raw);
          if (data.footer_config) {
            result = data.footer_config;
          }
        }
      } catch (err) {
        console.error('getFooterConfigServer storage error:', err);
      }
    }
    if (!result && (bundledCmsStorage as any).footer_config) {
      result = (bundledCmsStorage as any).footer_config as Partial<FooterConfig>;
    }
  }

  const finalConfig: FooterConfig = {
    ...defaultFooterConfig,
    ...(result || {}),
  };

  cmsMemoryCache.set(cacheKey, { value: finalConfig, expiresAt: Date.now() + CMS_CACHE_TTL });
  if (!fromDb) {
    ensureDbCmsKey(cacheKey, finalConfig);
  }
  return finalConfig;
}
