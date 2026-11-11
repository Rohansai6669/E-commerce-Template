import fs from 'fs';
import path from 'path';
import { PageConfig, SiteDesignTokens } from '@/types/cms';
import { defaultHomepageConfig, defaultSiteDesignTokens } from '@/lib/cms/defaults';
import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { eq } from 'drizzle-orm';

const CMS_STORAGE_PATH = path.join(process.cwd(), 'src', 'lib', 'cms', 'cms-storage.json');

/**
 * Direct server-side read of persistent PageConfig from DB or disk.
 * Non-'use server' function for safe SSR execution without Action POST proxies.
 */
export async function getCmsPageConfigServer(slug: string = '/'): Promise<PageConfig> {
  try {
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
    console.warn('getCmsPageConfigServer DB fetch warning:', dbErr);
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
 * Direct server-side read of Site Design Tokens with DB sync.
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
    console.warn('getSiteDesignTokensServer DB fetch error:', err);
  }
  return null;
}
