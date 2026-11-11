import React from 'react';
import { BaseSectionConfig } from '@/types/cms';
import { Container } from './container';

interface SectionShellProps {
  config: BaseSectionConfig & Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function SectionShell({ config, className = '', style = {}, children }: SectionShellProps) {
  if (!config.enabled) return null;

  // Margin Maps (4-Sided: Top, Bottom, Left, Right)
  const marginTopMap: Record<string, string> = {
    none: 'mt-0',
    '0': 'mt-0',
    small: 'mt-4 sm:mt-6 lg:mt-8',
    medium: 'mt-8 sm:mt-12 lg:mt-16',
    large: 'mt-16 sm:mt-20 lg:mt-24',
    xlarge: 'mt-24 sm:mt-32 lg:mt-40',
  };

  const marginBottomMap: Record<string, string> = {
    none: 'mb-0',
    '0': 'mb-0',
    small: 'mb-4 sm:mb-6 lg:mb-8',
    medium: 'mb-8 sm:mb-12 lg:mb-16',
    large: 'mb-16 sm:mb-20 lg:mb-24',
    xlarge: 'mb-24 sm:mb-32 lg:mb-40',
  };

  const marginLeftMap: Record<string, string> = {
    none: 'ml-0',
    '0': 'ml-0',
    small: 'ml-4 sm:ml-6',
    medium: 'ml-8 sm:ml-12',
    large: 'ml-16 sm:ml-20',
    auto: 'ml-auto',
  };

  const marginRightMap: Record<string, string> = {
    none: 'mr-0',
    '0': 'mr-0',
    small: 'mr-4 sm:mr-6',
    medium: 'mr-8 sm:mr-12',
    large: 'mr-16 sm:mr-20',
    auto: 'mr-auto',
  };

  // Padding Maps (4-Sided: Top, Bottom, Left, Right)
  const topSpacingMap: Record<string, string> = {
    none: 'pt-0',
    '0': 'pt-0',
    small: 'pt-4 sm:pt-6 lg:pt-8',
    medium: 'pt-8 sm:pt-12 lg:pt-16',
    large: 'pt-16 sm:pt-20 lg:pt-24',
    xlarge: 'pt-24 sm:pt-32 lg:pt-40',
  };

  const bottomSpacingMap: Record<string, string> = {
    none: 'pb-0',
    '0': 'pb-0',
    small: 'pb-4 sm:pb-6 lg:pb-8',
    medium: 'pb-8 sm:pb-12 lg:pb-16',
    large: 'pb-16 sm:pb-20 lg:pb-24',
    xlarge: 'pb-24 sm:pb-32 lg:pb-40',
  };

  const paddingLeftMap: Record<string, string> = {
    none: 'pl-0',
    '0': 'pl-0',
    small: 'pl-4 sm:pl-6',
    medium: 'pl-8 sm:pl-12',
    large: 'pl-16 sm:pl-20',
  };

  const paddingRightMap: Record<string, string> = {
    none: 'pr-0',
    '0': 'pr-0',
    small: 'pr-4 sm:pr-6',
    medium: 'pr-8 sm:pr-12',
    large: 'pr-16 sm:pr-20',
  };

  const heightClasses: Record<string, string> = {
    auto: 'min-h-0',
    small: 'min-h-[360px] flex flex-col justify-center',
    medium: 'min-h-[520px] flex flex-col justify-center',
    large: 'min-h-[700px] flex flex-col justify-center',
    screen: 'min-h-[85vh] sm:min-h-screen flex flex-col justify-center',
  };

  const marginTopClass = config.marginTop ? (marginTopMap[config.marginTop] || '') : 'mt-0';
  const marginBottomClass = config.marginBottom ? (marginBottomMap[config.marginBottom] || '') : 'mb-0';
  const marginLeftClass = config.marginLeft ? (marginLeftMap[config.marginLeft] || '') : '';
  const marginRightClass = config.marginRight ? (marginRightMap[config.marginRight] || '') : '';

  const topClass = config.topSpacing ? (topSpacingMap[config.topSpacing] || '') : topSpacingMap.small;
  const bottomClass = config.bottomSpacing ? (bottomSpacingMap[config.bottomSpacing] || '') : bottomSpacingMap.small;
  const leftClass = config.paddingLeft ? (paddingLeftMap[config.paddingLeft] || '') : '';
  const rightClass = config.paddingRight ? (paddingRightMap[config.paddingRight] || '') : '';
  const heightClass = heightClasses[config.sectionHeight || config.heroHeight || 'auto'] || 'min-h-0';

  const customStyle: React.CSSProperties = {
    ...style,
    backgroundColor: config.backgroundColor || undefined,
    color: config.textColor || undefined,
    ...(config.minHeightPx ? { minHeight: `${config.minHeightPx}px` } : {}),
    ...(config.marginTopPx !== undefined ? { marginTop: `${config.marginTopPx}px` } : {}),
    ...(config.marginBottomPx !== undefined ? { marginBottom: `${config.marginBottomPx}px` } : {}),
    ...(config.marginLeftPx !== undefined ? { marginLeft: `${config.marginLeftPx}px` } : {}),
    ...(config.marginRightPx !== undefined ? { marginRight: `${config.marginRightPx}px` } : {}),
    ...(config.paddingTopPx !== undefined ? { paddingTop: `${config.paddingTopPx}px` } : {}),
    ...(config.paddingBottomPx !== undefined ? { paddingBottom: `${config.paddingBottomPx}px` } : {}),
    ...(config.paddingLeftPx !== undefined ? { paddingLeft: `${config.paddingLeftPx}px` } : {}),
    ...(config.paddingRightPx !== undefined ? { paddingRight: `${config.paddingRightPx}px` } : {}),
  };

  // Device visibility classes
  const visibilityClasses = [
    config.mobileVisible === false ? 'hidden sm:block' : '',
    config.desktopVisible === false ? 'lg:hidden' : '',
  ].filter(Boolean).join(' ');

  const containerPaddingX = config.paddingX || (config.containerWidth === 'full' && config.contentPadding === 'none' ? 'none' : 'standard');

  return (
    <section
      id={config.id}
      data-section-id={config.id}
      className={`w-full relative overflow-hidden transition-all duration-300 ${heightClass} ${marginTopClass} ${marginBottomClass} ${marginLeftClass} ${marginRightClass} ${topClass} ${bottomClass} ${leftClass} ${rightClass} ${visibilityClasses} ${className}`}
      style={customStyle}
    >
      {config.backgroundImageUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={config.backgroundImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          {config.backgroundOverlayOpacity !== undefined && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: config.backgroundOverlayOpacity }}
            />
          )}
        </div>
      )}
      <div className="relative z-10 w-full">
        <Container
          width={config.containerWidth || 'default'}
          paddingX={containerPaddingX}
          paddingLeft={config.paddingLeft}
          paddingRight={config.paddingRight}
          paddingLeftPx={config.paddingLeftPx}
          paddingRightPx={config.paddingRightPx}
        >
          {children}
        </Container>
      </div>
    </section>
  );
}

export default SectionShell;
