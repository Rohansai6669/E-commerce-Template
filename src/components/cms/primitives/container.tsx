import React from 'react';

export interface ContainerProps {
  width?: 'narrow' | 'default' | 'wide' | 'full';
  paddingX?: 'none' | 'small' | 'standard' | 'spacious' | string;
  paddingLeft?: 'none' | 'small' | 'medium' | 'large' | string;
  paddingRight?: 'none' | 'small' | 'medium' | 'large' | string;
  paddingLeftPx?: number;
  paddingRightPx?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function Container({
  width = 'default',
  paddingX = 'standard',
  paddingLeft,
  paddingRight,
  paddingLeftPx,
  paddingRightPx,
  className = '',
  style = {},
  children,
}: ContainerProps) {
  const widthClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1536px]',
    full: 'w-full',
  };

  const paddingClasses: Record<string, string> = {
    none: 'px-0',
    small: 'px-2 sm:px-4',
    standard: 'px-4 sm:px-6 lg:px-8',
    spacious: 'px-6 sm:px-8 lg:px-12',
  };

  const sidePadMap: Record<string, string> = {
    none: '0px',
    '0': '0px',
    small: '16px',
    medium: '24px',
    standard: '32px',
    large: '48px',
    spacious: '48px',
  };

  const hasSpecificSidePad =
    paddingLeft !== undefined ||
    paddingRight !== undefined ||
    paddingLeftPx !== undefined ||
    paddingRightPx !== undefined;

  const horizontalPadding = hasSpecificSidePad
    ? ''
    : (paddingClasses[paddingX] || paddingClasses.standard);

  const computedStyle: React.CSSProperties = {
    ...style,
    ...(paddingLeftPx !== undefined
      ? { paddingLeft: `${paddingLeftPx}px` }
      : paddingLeft && sidePadMap[paddingLeft] !== undefined
      ? { paddingLeft: sidePadMap[paddingLeft] }
      : {}),
    ...(paddingRightPx !== undefined
      ? { paddingRight: `${paddingRightPx}px` }
      : paddingRight && sidePadMap[paddingRight] !== undefined
      ? { paddingRight: sidePadMap[paddingRight] }
      : {}),
  };

  return (
    <div
      className={`mx-auto ${horizontalPadding} ${widthClasses[width] || widthClasses.default} ${className}`}
      style={computedStyle}
    >
      {children}
    </div>
  );
}
