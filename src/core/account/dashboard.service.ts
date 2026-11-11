import { orderRepository } from '../order/order.repository';
import { addressRepository } from '../address/address.repository';
import { type CustomerAddress } from '../address/address.types';

export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  recentOrdersCount: number;
  defaultAddress: CustomerAddress | null;
}

/**
 * DashboardService aggregates customer account summary statistics and default profiles info.
 */
export class DashboardService {
  /**
   * Loads profile summary statistics: orders count, total spent, default address card.
   */
  async getDashboardStats(profileId: string): Promise<DashboardStats> {
    const orders = await orderRepository.getOrdersByProfileId(profileId);
    
    // Calculate total spent based on orders that aren't cancelled
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalSpent = validOrders.reduce((acc, order) => {
      const val = parseFloat(order.totalAmount);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const addresses = await addressRepository.getAddresses(profileId);
    const defaultAddress = addresses.find((a) => a.isDefault) ?? (addresses.length > 0 ? addresses[0] : null);

    return {
      totalOrders: orders.length,
      totalSpent,
      recentOrdersCount: orders.slice(0, 3).length,
      defaultAddress,
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
