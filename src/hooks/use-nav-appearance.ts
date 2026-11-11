'use client';

import { useState, useEffect, useCallback } from 'react';
import { NavAppearanceConfig, defaultNavAppearanceConfig } from '@/types/navigation-appearance';
import { getNavAppearanceConfig, saveNavAppearanceConfig } from '@/lib/cms/service';

export function useNavAppearance(overrideConfig?: NavAppearanceConfig) {
  const [config, setConfig] = useState<NavAppearanceConfig>(
    overrideConfig || defaultNavAppearanceConfig
  );

  useEffect(() => {
    if (overrideConfig) {
      setConfig(overrideConfig);
      return;
    }

    let isMounted = true;
    async function load() {
      const stored = await getNavAppearanceConfig();
      if (isMounted && stored) {
        setConfig(stored);
      }
    }

    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('cms-nav-appearance-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('cms-nav-appearance-updated', handleUpdate);
    };
  }, [overrideConfig]);

  const updateConfig = useCallback(async (newConfig: NavAppearanceConfig) => {
    setConfig(newConfig);
    await saveNavAppearanceConfig(newConfig);
  }, []);

  return {
    navConfig: overrideConfig || config,
    updateNavConfig: updateConfig,
  };
}

