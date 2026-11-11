'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';

export type NineAlignment =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface AlignmentDetail {
  value: NineAlignment;
  horizontal: 'left' | 'center' | 'right';
  vertical: 'top' | 'middle' | 'bottom';
  label: string;
}

export const NINE_ALIGNMENTS: AlignmentDetail[] = [
  { value: 'top-left', horizontal: 'left', vertical: 'top', label: 'Top Left' },
  { value: 'top-center', horizontal: 'center', vertical: 'top', label: 'Top Center' },
  { value: 'top-right', horizontal: 'right', vertical: 'top', label: 'Top Right' },
  { value: 'middle-left', horizontal: 'left', vertical: 'middle', label: 'Middle Left' },
  { value: 'center', horizontal: 'center', vertical: 'middle', label: 'Center' },
  { value: 'middle-right', horizontal: 'right', vertical: 'middle', label: 'Middle Right' },
  { value: 'bottom-left', horizontal: 'left', vertical: 'bottom', label: 'Bottom Left' },
  { value: 'bottom-center', horizontal: 'center', vertical: 'bottom', label: 'Bottom Center' },
  { value: 'bottom-right', horizontal: 'right', vertical: 'bottom', label: 'Bottom Right' },
];

/**
 * Normalizes legacy or partial alignment strings into a valid 9-point alignment.
 */
export function normalizeNineAlignment(val?: string | null): NineAlignment {
  if (!val) return 'center';
  const clean = val.toLowerCase().trim();

  // Direct matches
  if (clean === 'top-left' || clean === 'top-start') return 'top-left';
  if (clean === 'top-center' || clean === 'top') return 'top-center';
  if (clean === 'top-right' || clean === 'top-end') return 'top-right';
  if (clean === 'middle-left' || clean === 'center-left' || clean === 'left') return 'middle-left';
  if (clean === 'center' || clean === 'middle-center' || clean === 'middle') return 'center';
  if (clean === 'middle-right' || clean === 'center-right' || clean === 'right') return 'middle-right';
  if (clean === 'bottom-left' || clean === 'bottom-start') return 'bottom-left';
  if (clean === 'bottom-center' || clean === 'bottom') return 'bottom-center';
  if (clean === 'bottom-right' || clean === 'bottom-end') return 'bottom-right';

  return 'center';
}

/**
 * Returns Tailwind flex container & text alignment classes for flex-col layouts.
 */
export function getNineAlignmentClasses(alignment: string = 'center'): {
  container: string;
  horizontal: string;
  vertical: string;
  text: string;
  all: string;
} {
  const norm = normalizeNineAlignment(alignment);

  const map: Record<NineAlignment, { container: string; horizontal: string; vertical: string; text: string }> = {
    'top-left': {
      vertical: 'justify-start',
      horizontal: 'items-start',
      text: 'text-left',
      container: 'justify-start items-start text-left',
    },
    'top-center': {
      vertical: 'justify-start',
      horizontal: 'items-center',
      text: 'text-center',
      container: 'justify-start items-center text-center',
    },
    'top-right': {
      vertical: 'justify-start',
      horizontal: 'items-end',
      text: 'text-right',
      container: 'justify-start items-end text-right',
    },
    'middle-left': {
      vertical: 'justify-center',
      horizontal: 'items-start',
      text: 'text-left',
      container: 'justify-center items-start text-left',
    },
    'center': {
      vertical: 'justify-center',
      horizontal: 'items-center',
      text: 'text-center',
      container: 'justify-center items-center text-center',
    },
    'middle-right': {
      vertical: 'justify-center',
      horizontal: 'items-end',
      text: 'text-right',
      container: 'justify-center items-end text-right',
    },
    'bottom-left': {
      vertical: 'justify-end',
      horizontal: 'items-start',
      text: 'text-left',
      container: 'justify-end items-start text-left',
    },
    'bottom-center': {
      vertical: 'justify-end',
      horizontal: 'items-center',
      text: 'text-center',
      container: 'justify-end items-center text-center',
    },
    'bottom-right': {
      vertical: 'justify-end',
      horizontal: 'items-end',
      text: 'text-right',
      container: 'justify-end items-end text-right',
    },
  };

  const selected = map[norm];
  return {
    ...selected,
    all: `${selected.vertical} ${selected.horizontal} ${selected.text}`,
  };
}

export interface NineAlignmentMatrixProps {
  value?: string | null;
  onChange: (value: NineAlignment, horizontal: 'left' | 'center' | 'right', vertical: 'top' | 'middle' | 'bottom') => void;
  label?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

/**
 * 9-Point Alignment Matrix inspired by Figma & Microsoft Word.
 * Allows choosing exact 2D positioning (Top-Left to Bottom-Right)
 * with visual grid feedback and responsive micro-indicators.
 */
export function NineAlignmentMatrix({
  value = 'center',
  onChange,
  label = 'Content Alignment',
  description,
  className,
  size = 'md',
  showDetails = true,
}: NineAlignmentMatrixProps) {
  const current = normalizeNineAlignment(value);
  const activeDetail = NINE_ALIGNMENTS.find((a) => a.value === current) || NINE_ALIGNMENTS[4];

  const sizeConfigs = {
    sm: {
      grid: 'w-28 gap-1 p-1.5',
      cell: 'h-7 rounded',
      dot: 'w-1.5 h-1.5',
      text: 'text-[10px]',
    },
    md: {
      grid: 'w-36 gap-1.5 p-2',
      cell: 'h-9 rounded-lg',
      dot: 'w-2 h-2',
      text: 'text-xs',
    },
    lg: {
      grid: 'w-44 gap-2 p-2.5',
      cell: 'h-11 rounded-lg',
      dot: 'w-2.5 h-2.5',
      text: 'text-xs',
    },
  }[size];

  return (
    <div className={cn('space-y-2.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-800 dark:text-slate-200">
            {label}
          </label>
          {showDetails && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {activeDetail.label}
            </span>
          )}
        </div>
      )}

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {description}
        </p>
      )}

      {/* Figma-Style 3x3 Grid Box */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid grid-cols-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs select-none',
            sizeConfigs.grid
          )}
          role="radiogroup"
          aria-label={label}
        >
          {NINE_ALIGNMENTS.map((item) => {
            const isSelected = item.value === current;

            // Compute micro dot position inside the mini Figma canvas
            const posClass = {
              'top-left': 'top-1.5 left-1.5',
              'top-center': 'top-1.5 left-1/2 -translate-x-1/2',
              'top-right': 'top-1.5 right-1.5',
              'middle-left': 'top-1/2 -translate-y-1/2 left-1.5',
              'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'middle-right': 'top-1/2 -translate-y-1/2 right-1.5',
              'bottom-left': 'bottom-1.5 left-1.5',
              'bottom-center': 'bottom-1.5 left-1/2 -translate-x-1/2',
              'bottom-right': 'bottom-1.5 right-1.5',
            }[item.value];

            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                title={item.label}
                onClick={() => onChange(item.value, item.horizontal, item.vertical)}
                className={cn(
                  'relative flex items-center justify-center transition-all cursor-pointer border',
                  sizeConfigs.cell,
                  isSelected
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xs scale-102 z-10'
                    : 'bg-white dark:bg-slate-800/90 text-slate-400 hover:text-slate-800 dark:hover:text-white border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {/* Visual Position Canvas Box */}
                <span
                  className={cn(
                    'absolute rounded-full transition-all',
                    posClass,
                    sizeConfigs.dot,
                    isSelected
                      ? 'bg-primary dark:bg-primary'
                      : 'bg-slate-300 dark:bg-slate-600'
                  )}
                />

                {/* Subtle Directional Cross Guide in Center */}
                {item.value === 'center' && (
                  <span
                    className={cn(
                      'w-1 h-1 rounded-full opacity-40',
                      isSelected ? 'bg-white dark:bg-black' : 'bg-slate-400'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend / Coordinate pill */}
        {showDetails && (
          <div className="flex-1 space-y-1 min-w-0">
            <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Position Matrix
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {activeDetail.label}
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>V: {activeDetail.vertical}</span>
                <span>•</span>
                <span>H: {activeDetail.horizontal}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NineAlignmentMatrix;
