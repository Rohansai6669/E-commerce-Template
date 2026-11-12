'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SiteDesignTokens } from '@/types/cms';
import { defaultSiteDesignTokens } from '@/lib/cms/defaults';
import { getSiteDesignTokens } from '@/lib/cms/service';

interface ThemeVariableContextValue {
  tokens: SiteDesignTokens;
  updateTokens: (newTokens: SiteDesignTokens) => void;
}

const ThemeVariableContext = createContext<ThemeVariableContextValue | null>(null);

export function ThemeVariableProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<SiteDesignTokens>(defaultSiteDesignTokens);

  const applyCssVariables = useCallback((t: SiteDesignTokens) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply Global Typography Tokens
    if (t.headingFont) {
      root.style.setProperty('--font-heading', t.headingFont);
      root.style.setProperty('--heading-font', t.headingFont);
    }
    if (t.primaryFont) {
      root.style.setProperty('--font-body', t.primaryFont);
      root.style.setProperty('--font-sans', t.primaryFont);
      root.style.setProperty('--primary-font', t.primaryFont);
    }
    const trackingMap: Record<string, string> = {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.05em',
      widest: '0.1em',
    };
    root.style.setProperty('--heading-tracking', trackingMap[t.headingTracking || 'tighter'] || '-0.04em');
    root.style.setProperty('--heading-transform', t.headingTransform || 'uppercase');
    root.style.setProperty('--heading-weight', t.headingWeight || '800');

    const scaleMap: Record<string, string> = {
      compact: '0.9',
      normal: '1.0',
      editorial: '1.1',
      grand: '1.25',
    };
    const scaleVal = scaleMap[t.typographyScale || 'normal'] || '1.0';
    root.style.setProperty('--typography-scale', scaleVal);
    root.setAttribute('data-typography-scale', t.typographyScale || 'normal');

    // Apply Root Color Variables (Mutates Tailwind Semantic Theme Tokens globally)
    if (t.primaryColor) {
      root.style.setProperty('--primary', t.primaryColor);
      root.style.setProperty('--ring', t.primaryColor);
      root.style.setProperty('--cms-primary', t.primaryColor);
    }
    if (t.secondaryColor) {
      root.style.setProperty('--secondary', t.secondaryColor);
      root.style.setProperty('--cms-secondary', t.secondaryColor);
    }
    if (t.accentColor) {
      root.style.setProperty('--accent', t.accentColor);
      root.style.setProperty('--cms-accent', t.accentColor);
    }
    if (t.backgroundColor) {
      root.style.setProperty('--background', t.backgroundColor);
      root.style.setProperty('--cms-bg', t.backgroundColor);
    }
    if (t.surfaceColor) {
      root.style.setProperty('--card', t.surfaceColor);
      root.style.setProperty('--popover', t.surfaceColor);
      root.style.setProperty('--cms-surface', t.surfaceColor);
    }
    if (t.textColor) {
      root.style.setProperty('--foreground', t.textColor);
      root.style.setProperty('--card-foreground', t.textColor);
      root.style.setProperty('--popover-foreground', t.textColor);
      root.style.setProperty('--cms-text', t.textColor);
    }
    if (t.mutedTextColor) {
      root.style.setProperty('--muted-foreground', t.mutedTextColor);
      root.style.setProperty('--cms-muted-text', t.mutedTextColor);
    }
    // Apply Global Border Line Tokens
    const borderWidthMap: Record<string, string> = {
      none: '0px',
      thin: '1px',
      medium: '2px',
      thick: '3px',
    };
    const bWidth = borderWidthMap[t.borderWidth || 'thin'] || '1px';
    const bColor = t.borderWidth === 'none' ? 'transparent' : (t.borderColor || '#e2e8f0');
    const bStyle = t.borderStyle || 'solid';

    root.style.setProperty('--border-width', bWidth);
    root.style.setProperty('--border-style', bStyle);
    root.style.setProperty('--border', bColor);
    root.style.setProperty('--input', bColor);
    root.style.setProperty('--cms-border', bColor);

    // Apply document attributes for site-wide borders, dividers & cards
    root.setAttribute('data-border-width', t.borderWidth || 'thin');
    root.setAttribute('data-section-dividers', t.sectionDividers || 'none');
    root.setAttribute('data-card-borders', t.cardBorders || 'bordered');

    if (t.destructiveColor) {
      root.style.setProperty('--destructive', t.destructiveColor);
      root.style.setProperty('--cms-destructive', t.destructiveColor);
    }

    // Apply Global Border Radius Tokens (Overriding Tailwind's --radius-* scale)
    const radiusScales: Record<string, Record<string, string>> = {
      none: {
        xs: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        xxl: '0px',
        full: '0px',
        base: '0px',
      },
      sm: {
        xs: '1px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '6px',
        xxl: '8px',
        full: '9999px',
        base: '4px',
      },
      md: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        xxl: '16px',
        full: '9999px',
        base: '8px',
      },
      lg: {
        xs: '3px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '24px',
        full: '9999px',
        base: '12px',
      },
      xl: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        xxl: '36px',
        full: '9999px',
        base: '20px',
      },
      full: {
        xs: '9999px',
        sm: '9999px',
        md: '9999px',
        lg: '9999px',
        xl: '9999px',
        xxl: '9999px',
        full: '9999px',
        base: '9999px',
      },
    };

    const selectedRadius = radiusScales[t.borderRadius] || radiusScales.lg;
    root.style.setProperty('--radius-xs', selectedRadius.xs);
    root.style.setProperty('--radius-sm', selectedRadius.sm);
    root.style.setProperty('--radius-md', selectedRadius.md);
    root.style.setProperty('--radius-lg', selectedRadius.lg);
    root.style.setProperty('--radius-xl', selectedRadius.xl);
    root.style.setProperty('--radius-xxl', selectedRadius.xxl);
    root.style.setProperty('--radius-full', selectedRadius.full);
    root.style.setProperty('--radius', selectedRadius.base);
    root.style.setProperty('--cms-radius', selectedRadius.base);

    // Apply Elevation / Shadow Styles (Overriding Tailwind's --shadow-* scale)
    const shadowScales: Record<string, Record<string, string>> = {
      none: {
        xs: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        base: 'none',
      },
      sm: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        md: '0 2px 4px -1px rgb(0 0 0 / 0.06)',
        lg: '0 4px 6px -2px rgb(0 0 0 / 0.05)',
        xl: '0 8px 10px -3px rgb(0 0 0 / 0.05)',
        base: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      md: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        base: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      lg: {
        xs: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        sm: '0 2px 5px 0 rgb(0 0 0 / 0.1)',
        md: '0 8px 12px -2px rgb(0 0 0 / 0.12)',
        lg: '0 16px 24px -4px rgb(0 0 0 / 0.15)',
        xl: '0 28px 36px -8px rgb(0 0 0 / 0.18)',
        base: '0 16px 24px -4px rgb(0 0 0 / 0.15)',
      },
      glass: {
        xs: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
        md: '0 8px 24px 0 rgba(0, 0, 0, 0.09)',
        lg: '0 12px 36px 0 rgba(0, 0, 0, 0.12)',
        xl: '0 20px 48px 0 rgba(0, 0, 0, 0.16)',
        base: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
      },
    };

    const selectedShadow = shadowScales[t.shadowStyle] || shadowScales.md;
    root.style.setProperty('--shadow-xs', selectedShadow.xs);
    root.style.setProperty('--shadow-sm', selectedShadow.sm);
    root.style.setProperty('--shadow-md', selectedShadow.md);
    root.style.setProperty('--shadow-lg', selectedShadow.lg);
    root.style.setProperty('--shadow-xl', selectedShadow.xl);
    root.style.setProperty('--shadow', selectedShadow.base);
    root.style.setProperty('--cms-shadow', selectedShadow.base);
  }, []);

  const loadTokens = useCallback(async () => {
    const loaded = await getSiteDesignTokens();
    setTokens(loaded);
    applyCssVariables(loaded);
  }, [applyCssVariables]);

  useEffect(() => {
    loadTokens();

    const handleUpdate = () => {
      loadTokens();
    };

    window.addEventListener('cms-tokens-updated', handleUpdate);
    return () => window.removeEventListener('cms-tokens-updated', handleUpdate);
  }, [loadTokens]);

  const updateTokens = (newTokens: SiteDesignTokens) => {
    setTokens(newTokens);
    applyCssVariables(newTokens);
  };

  return (
    <ThemeVariableContext.Provider value={{ tokens, updateTokens }}>
      {children}
    </ThemeVariableContext.Provider>
  );
}

export function useThemeVariables() {
  const context = useContext(ThemeVariableContext);
  if (!context) {
    throw new Error('useThemeVariables must be used within ThemeVariableProvider');
  }
  return context;
}
