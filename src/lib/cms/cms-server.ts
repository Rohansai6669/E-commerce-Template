import fs from 'fs';
import path from 'path';
import { PageConfig, SiteDesignTokens, NavAppearanceConfig } from '@/types/cms';
import { defaultHomepageConfig, defaultSiteDesignTokens, defaultNavAppearanceConfig } from '@/lib/cms/defaults';
import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { eq } from 'drizzle-orm';

const CMS_STORAGE_PATH = path.join(process.cwd(), 'src', 'lib', 'cms', 'cms-storage.json');

// In-memory microsecond cache for CMS settings to prevent roundtrips to remote DB on every page view
const cmsMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const CMS_CACHE_TTL = 60 * 1000; // 60 seconds

export function invalidateCmsCache(key?: string) {
  if (key) {
    cmsMemoryCache.delete(key);
    cmsMemoryCache.delete(`page_config_${key}`);
  } else {
    cmsMemoryCache.clear();
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

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as PageConfig;
      }
    }
  } catch (dbErr) {
    console.warn('getCmsPageConfigServer DB fetch warning:', dbErr);
  }

  if (!result) {
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

  const finalConfig = result || defaultHomepageConfig;
  cmsMemoryCache.set(cacheKey, { value: finalConfig, expiresAt: Date.now() + CMS_CACHE_TTL });
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

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as SiteDesignTokens;
      }
    }
  } catch (err) {
    console.warn('getSiteDesignTokensServer DB fetch error:', err);
  }

  if (!result) {
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

  const finalTokens: SiteDesignTokens = {
    ...defaultSiteDesignTokens,
    ...(result || {}),
  };

  cmsMemoryCache.set(cacheKey, { value: finalTokens, expiresAt: Date.now() + CMS_CACHE_TTL });
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

  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, cacheKey))
        .limit(1);

      if (res && res.value) {
        result = res.value as Partial<NavAppearanceConfig>;
      }
    }
  } catch (err) {
    console.warn('getNavAppearanceConfigServer DB fetch error:', err);
  }

  if (!result) {
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

  const finalConfig: NavAppearanceConfig = {
    ...defaultNavAppearanceConfig,
    ...(result || {}),
  };

  cmsMemoryCache.set(cacheKey, { value: finalConfig, expiresAt: Date.now() + CMS_CACHE_TTL });
  return finalConfig;
}
