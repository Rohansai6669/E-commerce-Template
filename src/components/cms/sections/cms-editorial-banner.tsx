'use client';

import React from 'react';
import { EditorialBannerConfig } from '@/types/cms';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { EditorialBannerSection } from './trust-sections';

export function CmsEditorialBanner({ config }: { config: EditorialBannerConfig }) {
  if (!config.enabled) return null;
  return <EditorialBannerSection config={config} />;
}
