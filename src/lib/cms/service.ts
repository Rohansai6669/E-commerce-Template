import {
  PageConfig,
  TableConfig,
  AnnouncementBarConfig,
  SiteDesignTokens,
  InstagramSettingsConfig,
  NavAppearanceConfig,
  FooterConfig,
} from '@/types/cms';
import {
  defaultHomepageConfig,
  defaultOrdersTableConfig,
  defaultAnnouncementBar,
  defaultSiteDesignTokens,
  defaultInstagramSettings,
  defaultNavAppearanceConfig,
  defaultFooterConfig,
} from './defaults';
import {
  saveCmsPageConfigAction,
  saveSiteDesignTokensAction,
  saveNavAppearanceConfigAction,
  getNavAppearanceConfigServer,
  saveFooterConfigAction,
  getFooterConfigServer,
} from '@/app/actions/cms-actions';

// In-memory / client storage state keys
const STORAGE_KEY_PAGE_PREFIX = 'cms_page_config_';
const STORAGE_KEY_TABLE_PREFIX = 'cms_table_config_';
const STORAGE_KEY_ANNOUNCEMENT = 'cms_announcement_bar';
const STORAGE_KEY_DESIGN_TOKENS = 'cms_design_tokens';
const STORAGE_KEY_INSTAGRAM = 'cms_instagram_settings';
const STORAGE_KEY_NAV_APPEARANCE = 'cms_nav_appearance';
const STORAGE_KEY_FOOTER = 'cms_footer_config';

export async function getCmsPageConfig(slug: string = '/'): Promise<PageConfig> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PAGE_PREFIX}${slug}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read CMS page config from client storage:', e);
    }
  }
  return defaultHomepageConfig;
}

export async function saveCmsPageConfig(slug: string, config: PageConfig): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_PAGE_PREFIX}${slug}`, JSON.stringify(config));
      window.dispatchEvent(new Event('cms-config-updated'));
    } catch (e) {
      console.error('Failed to save CMS page config to localStorage:', e);
    }
  }
  return await saveCmsPageConfigAction(slug, config);
}

export async function getTableConfig(tableId: string): Promise<TableConfig> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_TABLE_PREFIX}${tableId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read table config from storage:', e);
    }
  }
  return defaultOrdersTableConfig;
}

export async function saveTableConfig(config: TableConfig): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_TABLE_PREFIX}${config.id}`, JSON.stringify(config));
      window.dispatchEvent(new Event('cms-table-config-updated'));
      return true;
    } catch (e) {
      console.error('Failed to save table config:', e);
    }
  }
  return false;
}

export async function getAnnouncementBar(): Promise<AnnouncementBarConfig> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read announcement bar config:', e);
    }
  }
  return defaultAnnouncementBar;
}

export async function saveAnnouncementBar(config: AnnouncementBarConfig): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(config));
      window.dispatchEvent(new Event('cms-announcement-updated'));
      return true;
    } catch (e) {
      console.error('Failed to save announcement bar:', e);
    }
  }
  return false;
}

export async function getSiteDesignTokens(): Promise<SiteDesignTokens> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DESIGN_TOKENS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read design tokens config:', e);
    }
  }
  return defaultSiteDesignTokens;
}

export async function saveSiteDesignTokens(tokens: SiteDesignTokens): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_DESIGN_TOKENS, JSON.stringify(tokens));
      window.dispatchEvent(new Event('cms-tokens-updated'));
    } catch (e) {
      console.error('Failed to save design tokens to localStorage:', e);
    }
  }
  return await saveSiteDesignTokensAction(tokens);
}

export async function getInstagramSettings(): Promise<InstagramSettingsConfig> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INSTAGRAM);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read Instagram settings:', e);
    }
  }
  return defaultInstagramSettings;
}

export async function saveInstagramSettings(config: InstagramSettingsConfig): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_INSTAGRAM, JSON.stringify(config));
      window.dispatchEvent(new Event('cms-instagram-updated'));
      return true;
    } catch (e) {
      console.error('Failed to save Instagram settings:', e);
    }
  }
  return false;
}

export async function getNavAppearanceConfig(): Promise<NavAppearanceConfig> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NAV_APPEARANCE);
      if (stored) {
        return {
          ...defaultNavAppearanceConfig,
          ...JSON.parse(stored),
        };
      }
    } catch (e) {
      console.warn('Failed to read nav appearance config from storage:', e);
    }
  }

  try {
    const serverConfig = await getNavAppearanceConfigServer();
    if (serverConfig) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_NAV_APPEARANCE, JSON.stringify(serverConfig));
        } catch (_) {}
      }
      return serverConfig;
    }
  } catch (err) {
    console.warn('Failed to fetch nav appearance from server action:', err);
  }

  return defaultNavAppearanceConfig;
}

export async function saveNavAppearanceConfig(config: NavAppearanceConfig): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_NAV_APPEARANCE, JSON.stringify(config));
      window.dispatchEvent(new Event('cms-nav-appearance-updated'));
    } catch (e) {
      console.error('Failed to save nav appearance to localStorage:', e);
    }
  }
  return await saveNavAppearanceConfigAction(config);
}

export async function getFooterConfig(): Promise<FooterConfig> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOOTER);
      if (stored) {
        return {
          ...defaultFooterConfig,
          ...JSON.parse(stored),
        };
      }
    } catch (e) {
      console.warn('Failed to read footer config from storage:', e);
    }
  }

  try {
    const serverConfig = await getFooterConfigServer();
    if (serverConfig) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_FOOTER, JSON.stringify(serverConfig));
        } catch (_) {}
      }
      return serverConfig;
    }
  } catch (err) {
    console.warn('Failed to fetch footer config from server action:', err);
  }

  return defaultFooterConfig;
}

export async function saveFooterConfig(config: FooterConfig): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_FOOTER, JSON.stringify(config));
      window.dispatchEvent(new Event('cms-footer-updated'));
    } catch (e) {
      console.error('Failed to save footer config to localStorage:', e);
    }
  }
  return await saveFooterConfigAction(config);
}
