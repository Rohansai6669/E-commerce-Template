import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';

export default function PrivacyPolicyPage() {
  return (
    <InfoLayout
      title="Privacy Policy"
      subtitle="How we collect, utilize, and protect your personal information."
    >
      <p>
        At Antigravity Storefront, we prioritize your data privacy. This disclosure document outlines how we collect, store, and manage user profile details.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">1. Data Collection</h3>
      <p>
        We collect account information (email, name, phone, saved shipping addresses) when you create a profile, place an order, or subscribe to store updates.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">2. How We Use Data</h3>
      <p>
        Collected details are used exclusively to process orders, manage accounts, and verify user sessions via Supabase. We do not sell or lease details to third-party advertisers.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">3. Cookies & Local Storage</h3>
      <p>
        We utilize necessary cookies to maintain session states and store cart selections. You can disable cookies inside your browser preferences, but some storefront functions may become disabled.
      </p>
    </InfoLayout>
  );
}
