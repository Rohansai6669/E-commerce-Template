export const siteConfig = {
  name: 'Antigravity Storefront',
  description: 'Premium modern custom storefront built on Next.js, Supabase and Drizzle.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  support: {
    email: 'support@antigravity-store.com',
    phone: '+1 (555) 0199',
    hours: 'Mon - Fri, 9AM - 6PM EST',
    address: '100 Innovation Way, Suite 400, Boston, MA 02110',
  },
} as const;

export default siteConfig;
