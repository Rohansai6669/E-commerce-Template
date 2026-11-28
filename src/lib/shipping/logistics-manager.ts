import { db } from '@/lib/db';
import { cmsSiteSettings } from '@/lib/db/schema/cms';
import { eq } from 'drizzle-orm';
import { shiprocketClient, type ShiprocketCourierServiceability } from './shiprocket';

export type LogisticsProviderType = 'shiprocket' | 'nimbuspost' | 'delhivery' | 'manual';

export interface LogisticsConfig {
  enabled: boolean;
  activeProvider: LogisticsProviderType;
  dynamicPricing: boolean;
  defaultPickupPincode: string;
  fallbackFlatRate: number;
  freeShippingThreshold: number;
  enableCod: boolean;
  enableGpsPreciseAddress: boolean;
}

export const defaultLogisticsConfig: LogisticsConfig = {
  enabled: true,
  activeProvider: 'shiprocket',
  dynamicPricing: true,
  defaultPickupPincode: '500060',
  fallbackFlatRate: 99,
  freeShippingThreshold: 2000,
  enableCod: true,
  enableGpsPreciseAddress: true,
};

const LOGISTICS_STORAGE_KEY = 'logistics_config';

/**
 * Fetches authoritative logistics configuration from PostgreSQL database.
 */
export async function getLogisticsConfig(): Promise<LogisticsConfig> {
  try {
    if (db) {
      const [res] = await db
        .select()
        .from(cmsSiteSettings)
        .where(eq(cmsSiteSettings.key, LOGISTICS_STORAGE_KEY))
        .limit(1);

      if (res && res.value) {
        const val = res.value as Partial<LogisticsConfig>;
        return {
          ...defaultLogisticsConfig,
          ...val,
          fallbackFlatRate:
            val.fallbackFlatRate !== undefined
              ? Number(val.fallbackFlatRate)
              : defaultLogisticsConfig.fallbackFlatRate,
          freeShippingThreshold:
            val.freeShippingThreshold !== undefined
              ? Number(val.freeShippingThreshold)
              : defaultLogisticsConfig.freeShippingThreshold,
          enableCod:
            val.enableCod !== undefined
              ? Boolean(val.enableCod)
              : defaultLogisticsConfig.enableCod,
        };
      }
    }
  } catch (err) {
    console.warn('[LogisticsManager] Database fetch warning:', err);
  }
  return defaultLogisticsConfig;
}

/**
 * Saves logistics configuration from admin panel.
 */
export async function saveLogisticsConfig(
  config: Partial<LogisticsConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!db) {
      return { success: false, error: 'Database connection unavailable.' };
    }

    const current = await getLogisticsConfig();
    const updated: LogisticsConfig = {
      ...current,
      ...config,
      fallbackFlatRate:
        config.fallbackFlatRate !== undefined
          ? Math.max(0, Number(config.fallbackFlatRate))
          : current.fallbackFlatRate,
      freeShippingThreshold:
        config.freeShippingThreshold !== undefined
          ? Math.max(0, Number(config.freeShippingThreshold))
          : current.freeShippingThreshold,
      enableCod:
        config.enableCod !== undefined ? Boolean(config.enableCod) : current.enableCod,
    };

    await db
      .insert(cmsSiteSettings)
      .values({
        key: LOGISTICS_STORAGE_KEY,
        value: updated as any,
      })
      .onConflictDoUpdate({
        target: cmsSiteSettings.key,
        set: {
          value: updated as any,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (err: any) {
    console.error('[LogisticsManager] Save config failure:', err);
    return { success: false, error: err.message || 'Failed to update logistics settings.' };
  }
}

export interface ShippingQuoteResult {
  provider: LogisticsProviderType;
  isDynamic: boolean;
  shippingCharge: number;
  isFreeShipping: boolean;
  carrierName: string;
  estimatedDelivery: string;
  courierDetails?: ShiprocketCourierServiceability;
  availableOptions?: Array<{
    carrierName: string;
    rate: number;
    etd: string;
    id: string | number;
  }>;
}

/**
 * Calculates authoritative shipping fee and courier assignment based on admin toggle rules,
 * order value, delivery pin code, and real-time logistics provider rates.
 */
export async function calculateShippingQuote(params: {
  deliveryPincode: string;
  subtotal: number;
  weightKg?: number;
  isCod?: boolean;
}): Promise<ShippingQuoteResult> {
  const config = await getLogisticsConfig();
  const subtotal = params.subtotal || 0;

  // 1. Check Free Shipping Threshold
  if (config.freeShippingThreshold > 0 && subtotal >= config.freeShippingThreshold) {
    return {
      provider: config.activeProvider,
      isDynamic: false,
      shippingCharge: 0,
      isFreeShipping: true,
      carrierName: 'Complimentary Express Shipping',
      estimatedDelivery: '3 - 5 business days',
    };
  }

  // 2. Check if logistics provider integration is enabled
  if (!config.enabled || !config.dynamicPricing) {
    return {
      provider: 'manual',
      isDynamic: false,
      shippingCharge: config.fallbackFlatRate,
      isFreeShipping: false,
      carrierName: 'Standard Courier Shipping',
      estimatedDelivery: '3 - 6 business days',
    };
  }

  // 3. Dynamic Rate Query via Active Provider (Shiprocket)
  if (config.activeProvider === 'shiprocket') {
    try {
      const liveRate = await shiprocketClient.checkServiceabilityAndRates({
        deliveryPincode: params.deliveryPincode,
        pickupPincode: config.defaultPickupPincode,
        weightKg: params.weightKg || 0.5,
        isCod: params.isCod,
        orderValue: subtotal,
      });

      if (liveRate.success && liveRate.recommendedCourier) {
        const courier = liveRate.recommendedCourier;
        const availableOptions = (liveRate.availableCouriers || []).map((c) => ({
          carrierName: c.courierName,
          rate: c.rate,
          etd: c.etd,
          id: c.courierCompanyId,
        }));

        return {
          provider: 'shiprocket',
          isDynamic: true,
          shippingCharge: courier.rate,
          isFreeShipping: false,
          carrierName: courier.courierName,
          estimatedDelivery: courier.etd,
          courierDetails: courier,
          availableOptions,
        };
      }
    } catch (apiErr) {
      console.warn('[LogisticsManager] Live provider rate check fell back to flat rate:', apiErr);
    }
  }

  // 4. Default safe fallback
  return {
    provider: config.activeProvider,
    isDynamic: false,
    shippingCharge: config.fallbackFlatRate,
    isFreeShipping: false,
    carrierName: 'Express Delivery',
    estimatedDelivery: '3 - 5 business days',
  };
}
