import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { getTrackOrderConfigServer } from '@/app/actions/help-cms-actions';
import { TrackOrderClient } from './track-order-client';

export const revalidate = 60;

export default async function TrackOrderPage() {
  const config = await getTrackOrderConfigServer();

  return (
    <HelpLayout
      title={config.title}
      subtitle={config.subtitle}
      badge="LIVE TRANSIT"
    >
      <TrackOrderClient config={config} />
    </HelpLayout>
  );
}
