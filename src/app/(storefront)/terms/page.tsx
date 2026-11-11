import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';

export default function TermsPage() {
  return (
    <InfoLayout
      title="Terms & Conditions"
      subtitle="The agreements governing your use of our storefront."
    >
      <p>
        By accessing or purchasing from Antigravity Storefront, you agree to comply with the terms and conditions outlined below.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">1. Purchases & Pricing</h3>
      <p>
        All prices are listed in USD. We reserve the right to correct pricing errors, modify item availability, or cancel suspicious orders.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">2. User Accounts</h3>
      <p>
        You are responsible for safeguarding your login credentials. We reserve the right to suspend accounts displaying fraudulent activity.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">3. Limitation of Liability</h3>
      <p>
        This storefront is provided on an "as-is" and "as-available" basis without warranties of any kind.
      </p>
    </InfoLayout>
  );
}
