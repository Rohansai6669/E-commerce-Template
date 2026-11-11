export const metaConfig = {
  default: {
    title: 'Premium Ecommerce Starter',
    description: 'A production-grade reusable Next.js + Supabase starter template.',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://example.com',
      siteName: 'Ecommerce Starter',
      images: [
        {
          url: 'https://example.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Premium Ecommerce Starter Layout',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@example',
      creator: '@example',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  },
} as const;
