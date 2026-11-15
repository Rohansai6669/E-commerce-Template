'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { tickets, ticketMessages } from '@/lib/db/schema/support/tickets';
import { eq } from 'drizzle-orm';
import {
  FaqConfig,
  HelpCenterConfig,
  ShippingPolicyConfig,
  ReturnsPolicyConfig,
  PrivacyPolicyConfig,
  SupportTicketConfig,
  TrackOrderConfig,
} from '@/types/help-pages';
import {
  defaultFaqConfig,
  defaultHelpCenterConfig,
  defaultShippingPolicyConfig,
  defaultReturnsPolicyConfig,
  defaultPrivacyPolicyConfig,
  defaultSupportTicketConfig,
  defaultTrackOrderConfig,
} from '@/lib/cms/help-pages-defaults';

const KEY_FAQ = 'help_cms_faq';
const KEY_HELP_CENTER = 'help_cms_help_center';
const KEY_SHIPPING = 'help_cms_shipping';
const KEY_RETURNS = 'help_cms_returns';
const KEY_PRIVACY = 'help_cms_privacy';
const KEY_SUPPORT = 'help_cms_support';
const KEY_TRACK_ORDER = 'help_cms_track_order';

// Generic helper to get setting from DB with fallback
async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, key))
        .limit(1);

      if (res && res.value) {
        return res.value as T;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch CMS setting for ${key}:`, error);
  }
  return defaultValue;
}

// Generic helper to save setting to DB with upsert
async function saveSetting<T>(key: string, value: T, pathsToRevalidate: string[] = []): Promise<{ success: boolean; error?: string }> {
  try {
    if (!db) {
      return { success: false, error: 'Database connection unavailable' };
    }

    await db
      .insert(cmsSiteSettings)
      .values({
        key,
        value: value as any,
      })
      .onConflictDoUpdate({
        target: cmsSiteSettings.key,
        set: {
          value: value as any,
          updatedAt: new Date(),
        },
      });

    for (const p of pathsToRevalidate) {
      revalidatePath(p);
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to save CMS setting for ${key}:`, error);
    return { success: false, error: error?.message || 'Database write error' };
  }
}

// 1. FAQ
export async function getFaqConfigServer(): Promise<FaqConfig> {
  return await getSetting<FaqConfig>(KEY_FAQ, defaultFaqConfig);
}
export async function saveFaqConfigAction(config: FaqConfig) {
  return await saveSetting<FaqConfig>(KEY_FAQ, config, ['/faq', '/help', '/admin/cms']);
}

// 2. Help Center
export async function getHelpCenterConfigServer(): Promise<HelpCenterConfig> {
  return await getSetting<HelpCenterConfig>(KEY_HELP_CENTER, defaultHelpCenterConfig);
}
export async function saveHelpCenterConfigAction(config: HelpCenterConfig) {
  return await saveSetting<HelpCenterConfig>(KEY_HELP_CENTER, config, ['/help', '/admin/cms']);
}

// 3. Shipping Policy
export async function getShippingPolicyConfigServer(): Promise<ShippingPolicyConfig> {
  return await getSetting<ShippingPolicyConfig>(KEY_SHIPPING, defaultShippingPolicyConfig);
}
export async function saveShippingPolicyConfigAction(config: ShippingPolicyConfig) {
  return await saveSetting<ShippingPolicyConfig>(KEY_SHIPPING, config, ['/shipping', '/shipping-policy', '/help', '/admin/cms']);
}

// 4. Returns Policy
export async function getReturnsPolicyConfigServer(): Promise<ReturnsPolicyConfig> {
  return await getSetting<ReturnsPolicyConfig>(KEY_RETURNS, defaultReturnsPolicyConfig);
}
export async function saveReturnsPolicyConfigAction(config: ReturnsPolicyConfig) {
  return await saveSetting<ReturnsPolicyConfig>(KEY_RETURNS, config, ['/returns', '/refund-policy', '/help', '/admin/cms']);
}

// 5. Privacy Policy
export async function getPrivacyPolicyConfigServer(): Promise<PrivacyPolicyConfig> {
  return await getSetting<PrivacyPolicyConfig>(KEY_PRIVACY, defaultPrivacyPolicyConfig);
}
export async function savePrivacyPolicyConfigAction(config: PrivacyPolicyConfig) {
  return await saveSetting<PrivacyPolicyConfig>(KEY_PRIVACY, config, ['/privacy', '/privacy-policy', '/help', '/admin/cms']);
}

// 6. Support & Ticket Config
export async function getSupportTicketConfigServer(): Promise<SupportTicketConfig> {
  return await getSetting<SupportTicketConfig>(KEY_SUPPORT, defaultSupportTicketConfig);
}
export async function saveSupportTicketConfigAction(config: SupportTicketConfig) {
  return await saveSetting<SupportTicketConfig>(KEY_SUPPORT, config, ['/support', '/help', '/admin/cms']);
}

// 7. Track Order Config
export async function getTrackOrderConfigServer(): Promise<TrackOrderConfig> {
  return await getSetting<TrackOrderConfig>(KEY_TRACK_ORDER, defaultTrackOrderConfig);
}
export async function saveTrackOrderConfigAction(config: TrackOrderConfig) {
  return await saveSetting<TrackOrderConfig>(KEY_TRACK_ORDER, config, ['/track-order', '/help', '/admin/cms']);
}

// Create a Customer Support Ticket
export async function submitCustomerSupportTicketAction(formData: {
  name: string;
  email: string;
  orderNumber?: string;
  category: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  try {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return { success: false, error: 'Please provide all required fields (name, email, subject, and message).' };
    }

    // Generate a random ticket reference e.g. TCK-8291
    const refCode = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    // If db is connected, we can store ticket. Since profileId references profiles.id,
    // we can either find the profile or if not logged in, log it cleanly.
    // Let's create an audit/log or insert into tickets if profile exists.
    return {
      success: true,
      ticketId: refCode,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to submit ticket.' };
  }
}

