import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';

export default function RefundPolicyPage() {
  return (
    <InfoLayout
      title="Returns & Refunds"
      subtitle="Our 30-day money-back guarantee policy."
    >
      <p>
        If you are not completely satisfied with your storefront purchase, we accept return claims for up to 30 days following order delivery.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Return Conditions</h3>
      <p>
        To be eligible for a refund, products must be unused, in their original packaging, and in the same condition as received.
      </p>

      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">How to Request a Refund</h3>
      <ol className="list-decimal pl-5 space-y-1 text-slate-400">
        <li>Contact support care using our email channels to request a shipping slip.</li>
        <li>Package the item securely and drop it at a local courier center.</li>
        <li>We will inspect the item on arrival and process your refund within 3–5 days.</li>
      </ol>
    </InfoLayout>
  );
}
