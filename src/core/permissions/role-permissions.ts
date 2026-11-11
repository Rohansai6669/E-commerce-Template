export type UserRole = 'admin' | 'supplier' | 'customer' | 'guest';

export type PermissionAction =
  | 'products:create'
  | 'products:read'
  | 'products:update'
  | 'products:delete'
  | 'products:approve'
  | 'orders:read_all'
  | 'orders:read_assigned'
  | 'orders:fulfill'
  | 'orders:cancel'
  | 'promotions:manage_global'
  | 'promotions:manage_supplier'
  | 'coupons:manage'
  | 'categories:manage'
  | 'collections:manage'
  | 'audiences:manage'
  | 'suppliers:manage';

export interface AuthorizationContext {
  userId?: string;
  supplierId?: string;
  resourceOwnerId?: string;
}

export class RolePermissionsService {
  /**
   * Evaluates if a given role with context is allowed to execute a permission action.
   */
  static can(role: UserRole, action: PermissionAction, ctx?: AuthorizationContext): boolean {
    // Admin has full systemic rights across all modules
    if (role === 'admin') {
      return true;
    }

    // Supplier rights (scoped to supplier's owned resources)
    if (role === 'supplier') {
      switch (action) {
        case 'products:create':
        case 'products:read':
          return true;
        case 'products:update':
        case 'products:delete':
          return !ctx?.resourceOwnerId || ctx.resourceOwnerId === ctx?.supplierId || ctx.resourceOwnerId === ctx?.userId;
        case 'products:approve':
          return false; // Only Admin can approve supplier products
        case 'orders:read_assigned':
        case 'orders:fulfill':
          return true; // Suppliers can view and update fulfillment for their line items
        case 'orders:read_all':
          return false;
        case 'promotions:manage_supplier':
          return true; // Suppliers can manage supplier-specific offers for their items
        case 'promotions:manage_global':
        case 'coupons:manage':
        case 'categories:manage':
        case 'collections:manage':
        case 'audiences:manage':
        case 'suppliers:manage':
          return false;
        default:
          return false;
      }
    }

    // Customer / Guest rights
    if (role === 'customer' || role === 'guest') {
      if (action === 'products:read') return true;
      return false;
    }

    return false;
  }
}
