import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';
import { commerceConfig } from '@/core/config/commerce';

export default function ShippingPolicyPage() {
  return (
    <InfoLayout
      title="Shipping Policy"
      subtitle="Delivery rates, timelines, and shipping zones."
    >
      <p>
        We aim to pack and ship all orders within 24 hours of purchase. Refer to rates and zones guidelines below.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Domestic Shipping Rates</h3>
      <ul className="list-disc pl-5 space-y-1 text-slate-400">
        <li>**Standard Shipping**: ${commerceConfig.shipping.standardRate} (Free on orders above ${commerceConfig.shipping.freeThreshold})</li>
        <li>**Express Shipping**: ${commerceConfig.shipping.expressRate}</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Delivery Timelines</h3>
      <ul className="list-disc pl-5 space-y-1 text-slate-400">
        <li>**Standard Shipping**: 3–5 business days</li>
        <li>**Express Shipping**: 1–2 business days</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Holiday Season Shipping</h3>
      <p>
        During periods of high order volumes, dispatch timelines may experience slight delays. Thank you for your patience.
      </p>
    </InfoLayout>
  );
}
