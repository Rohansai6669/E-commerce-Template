import { redirect } from 'next/navigation';

/**
 * Legacy Coupons Page.
 * Redirects to unified Promotions & Sales Campaigns Manager at /admin/promotions.
 */
export default async function AdminCouponsPage() {
  redirect('/admin/promotions');
}
