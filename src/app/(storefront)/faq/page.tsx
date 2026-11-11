import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';

export default function FaqPage() {
  const faqItems = [
    {
      q: 'How long will standard shipping take?',
      a: 'Standard shipping takes 3–5 business days within the continental United States. Express shipping options are available at checkout.',
    },
    {
      q: 'What is your return window policy?',
      a: 'We accept returns on all unused items in their original packaging within 30 days of delivery. Refer to our Returns & Refunds page for full details.',
    },
    {
      q: 'Are my payment details secure?',
      a: 'Yes, all transaction processing is handled securely through encrypted payment gateways. We never save raw payment credentials on our servers.',
    },
    {
      q: 'How can I track guest orders?',
      a: 'You can check tracking states by visiting our Order Tracking tool and inputting your Order ID and billing/shipping email address.',
    },
  ];

  return (
    <InfoLayout
      title="Frequently Asked Questions"
      subtitle="Find answers to common questions about shopping, shipping, and returns."
    >
      <div className="space-y-6 mt-4">
        {faqItems.map((item, idx) => (
          <div key={idx} className="pb-4 border-b border-slate-850">
            <h4 className="font-bold text-slate-200 text-base mb-1">{item.q}</h4>
            <p className="text-slate-400 text-sm">{item.a}</p>
          </div>
        ))}
      </div>
    </InfoLayout>
  );
}
