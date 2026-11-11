import { type StoreMode } from './store-mode';

/**
 * CommerceConfigService
 * 
 * Central Policy Authority for Store Operating Modes (Standalone vs Marketplace).
 * Every domain service, component, and server action queries this service to determine
 * active commercial capabilities, preventing scattered hardcoded checks.
 */
export class CommerceConfigService {
  /**
   * Returns true if the store is operating in Standalone Mode.
   */
  static isStandalone(mode: StoreMode): boolean {
    return mode === 'standalone';
  }

  /**
   * Returns true if the store is operating in Multi-Vendor Marketplace Mode.
   */
  static isMarketplace(mode: StoreMode): boolean {
    return mode === 'marketplace';
  }

  /**
   * Determines whether supplier product approval state machines are required.
   * Standalone mode bypasses supplier approvals (auto-active).
   */
  static requiresSupplierApproval(mode: StoreMode): boolean {
    return this.isMarketplace(mode);
  }

  /**
   * Determines whether platform commission calculations are active.
   */
  static requiresCommission(mode: StoreMode): boolean {
    return this.isMarketplace(mode);
  }

  /**
   * Determines whether order routing to specific vendor accounts is required.
   */
  static requiresVendorRouting(mode: StoreMode): boolean {
    return this.isMarketplace(mode);
  }

  /**
   * Determines whether supplier ownership, portals, and supplier directories are visible.
   */
  static requiresSupplier(mode: StoreMode): boolean {
    return this.isMarketplace(mode);
  }

  /**
   * Determines whether vendor-owned offers are allowed in addition to platform campaigns.
   */
  static allowsVendorOffers(mode: StoreMode): boolean {
    return this.isMarketplace(mode);
  }

  /**
   * Determines whether a product listing is storefront-visible based on store mode,
   * catalog status, supplier approval status, and inventory stock.
   */
  static isStorefrontVisible(params: {
    storeMode: StoreMode;
    productStatus: string;
    supplierApprovalStatus?: string | null;
    availableStock: number;
  }): boolean {
    const { storeMode, productStatus, supplierApprovalStatus, availableStock } = params;

    if (productStatus !== 'active' || availableStock <= 0) {
      return false;
    }

    if (this.isStandalone(storeMode)) {
      return true;
    }

    // In Marketplace mode, supplier product approval status must be active
    return supplierApprovalStatus === 'active';
  }
}
