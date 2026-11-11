import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { siteConfig } from '@/core/config/site';

export default function ContactPage() {
  return (
    <InfoLayout
      title="Contact Us"
      subtitle="We are here to support your shopping experience."
    >
      <p>
        Have questions about product availability, order fulfillment, or returns? Get in touch with our customer care division.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 flex gap-3">
            <div className="text-primary mt-1">
              <Icon name="Mail" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Email Support</h4>
              <p className="text-xs text-slate-400 mt-1">{siteConfig.support.email}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Average response time: &lt; 24 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 flex gap-3">
            <div className="text-primary mt-1">
              <Icon name="Phone" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Phone Care</h4>
              <p className="text-xs text-slate-400 mt-1">{siteConfig.support.phone}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{siteConfig.support.hours}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-slate-200 mt-8 mb-2">Corporate Headquarters</h3>
      <p className="text-slate-400 text-sm">
        {siteConfig.support.address}
      </p>
    </InfoLayout>
  );
}
