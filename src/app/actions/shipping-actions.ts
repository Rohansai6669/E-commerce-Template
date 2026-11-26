'use server';

import {
  calculateShippingQuote,
  getLogisticsConfig,
  saveLogisticsConfig,
  type LogisticsConfig,
  type ShippingQuoteResult,
} from '@/lib/shipping/logistics-manager';
import { getCurrentProfile } from '@/core/auth/session';
import { revalidatePath } from 'next/cache';

/**
 * Calculates live dynamic shipping quote for storefront checkout.
 */
export async function getShippingRateAction(params: {
  deliveryPincode: string;
  subtotal: number;
  weightKg?: number;
  isCod?: boolean;
}): Promise<{ success: boolean; quote?: ShippingQuoteResult; error?: string }> {
  try {
    const cleanPin = String(params.deliveryPincode || '').replace(/\D/g, '');
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return { success: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
    }

    const quote = await calculateShippingQuote({
      deliveryPincode: cleanPin,
      subtotal: params.subtotal,
      weightKg: params.weightKg,
      isCod: params.isCod,
    });

    return { success: true, quote };
  } catch (err: any) {
    console.error('getShippingRateAction error:', err);
    return { success: false, error: err.message || 'Failed to calculate shipping rate.' };
  }
}

/**
 * Admin action: retrieves logistics configuration and provider settings.
 */
export async function getLogisticsSettingsAction(): Promise<{
  success: boolean;
  config: LogisticsConfig;
}> {
  try {
    const config = await getLogisticsConfig();
    return { success: true, config };
  } catch (err) {
    return {
      success: false,
      config: {
        enabled: true,
        activeProvider: 'shiprocket',
        dynamicPricing: true,
        defaultPickupPincode: '400001',
        fallbackFlatRate: 99,
        freeShippingThreshold: 2000,
        enableCod: true,
        enableGpsPreciseAddress: true,
      },
    };
  }
}

/**
 * Admin action: toggles logistics providers, dynamic pricing, and warehouse settings.
 */
export async function updateLogisticsSettingsAction(
  config: Partial<LogisticsConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
      if (process.env.NODE_ENV === 'production') {
        return { success: false, error: 'Unauthorized: Admin role required.' };
      }
    }

    const res = await saveLogisticsConfig(config);
    if (res.success) {
      revalidatePath('/admin/shipping');
      revalidatePath('/admin/settings');
      revalidatePath('/checkout');
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update logistics settings.' };
  }
}
