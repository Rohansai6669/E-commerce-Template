import * as React from 'react';
import { Header } from '@/components/navigation/Header/header';
import { Footer } from '@/components/navigation/Footer/footer';
import { WebVitalsReporter } from '@/components/monitoring/web-vitals';
import { getOrganizationSchema, getWebsiteSchema } from '@/core/seo/jsonld';

export interface StorefrontLayoutProps {
  children: React.ReactNode;
}

/**
 * Public storefront route group layout.
 */
export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const orgJsonLd = getOrganizationSchema();
  const websiteJsonLd = getWebsiteSchema();

  return (
    <>
      {/* Telemetry metrics monitor */}
      <WebVitalsReporter />

      {/* Global JSON-LD Schema markups */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <main className="flex-1 w-full flex flex-col bg-background">
          <React.Suspense fallback={null}>
            {children}
          </React.Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
