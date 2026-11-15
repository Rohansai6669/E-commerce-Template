'use client';

import { useState, useEffect, useCallback } from 'react';
import { FooterConfig, defaultFooterConfig } from '@/types/footer-config';
import { getFooterConfig, saveFooterConfig } from '@/lib/cms/service';

export function useFooterConfig(
  overrideConfig?: FooterConfig,
  initialConfig?: FooterConfig
) {
  const [config, setConfig] = useState<FooterConfig>(
    overrideConfig || initialConfig || defaultFooterConfig
  );

  useEffect(() => {
    if (overrideConfig) {
      setConfig(overrideConfig);
      return;
    }

    let isMounted = true;
    async function load() {
      const stored = await getFooterConfig();
      if (isMounted && stored) {
        setConfig(stored);
      }
    }

    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('cms-footer-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('cms-footer-updated', handleUpdate);
    };
  }, [overrideConfig]);

  const updateConfig = useCallback(async (newConfig: FooterConfig) => {
    setConfig(newConfig);
    await saveFooterConfig(newConfig);
  }, []);

  return {
    footerConfig: overrideConfig || config,
    updateFooterConfig: updateConfig,
  };
}

