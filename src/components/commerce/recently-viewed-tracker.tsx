'use client';

import * as React from 'react';
import { RecentlyViewedService } from '@/core/product/recently-viewed.service';

/**
 * Invisible tracking mount that appends current page slug to localStorage history.
 */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    RecentlyViewedService.add(slug);
  }, [slug]);

  return null;
}
export default RecentlyViewedTracker;
