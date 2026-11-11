'use client';

import React, { useState } from 'react';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';

export interface NavigationBannerImageFieldProps {
  defaultValue?: string;
  name?: string;
  label?: string;
}

export function NavigationBannerImageField({
  defaultValue = '',
  name = 'imageUrl',
  label = 'Promotional Banner Image',
}: NavigationBannerImageFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-1">
      <ImagePreviewInput
        name={name}
        value={value}
        onChange={setValue}
        label={label}
        folder="banners"
        aspectRatio="banner"
        description="Displayed as the right-hand editorial card when hovering this category in the mega menu."
      />
    </div>
  );
}

export default NavigationBannerImageField;

