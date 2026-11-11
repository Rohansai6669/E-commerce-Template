import { type IconName } from '@/components/ui/icon';

export interface AccountNavigationItem {
  name: string;
  href: string;
  icon: IconName;
  description: string;
}

/**
 * Sidebar links schema configuration for the Customer Accounts module.
 */
export const ACCOUNT_NAVIGATION: AccountNavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/account',
    icon: 'LayoutDashboard' as const,
    description: 'Overview of your account status and recent orders',
  },
  {
    name: 'Order History',
    href: '/account/orders',
    icon: 'Package' as const,
    description: 'View and track all prior orders placed',
  },
  {
    name: 'Wishlist',
    href: '/account/wishlist',
    icon: 'Heart' as const,
    description: 'Manage your saved products lists',
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: 'MapPin' as const,
    description: 'Manage your saved shipping and billing addresses',
  },
  {
    name: 'Profile Settings',
    href: '/account/settings',
    icon: 'User' as const,
    description: 'Update your personal profile details',
  },
];
