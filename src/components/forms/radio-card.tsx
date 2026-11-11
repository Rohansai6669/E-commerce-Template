'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { Icon, type IconName } from '@/components/ui/icon';

export interface RadioCardOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  detail?: string;        // e.g. price or ETA
  icon?: IconName;
  disabled?: boolean;
}

export interface RadioCardProps<T extends string = string> {
  name: string;
  options: RadioCardOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Card-style radio selector for shipping method, payment type, etc.
 */
export function RadioCard<T extends string = string>({
  name,
  options,
  value,
  onChange,
  className,
}: RadioCardProps<T>) {
  return (
    <fieldset className={cn('flex flex-col gap-3', className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              'relative flex items-start gap-4 rounded-lg border-2 px-4 py-3.5 cursor-pointer transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-muted-foreground/30',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => !option.disabled && onChange(option.value)}
              disabled={option.disabled}
              className="sr-only"
            />

            {/* Radio dot */}
            <div
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/40 bg-background'
              )}
            >
              {isSelected && (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                </div>
              )}
            </div>

            {/* Option content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground">
                  {option.icon && (
                    <Icon name={option.icon} className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                  )}
                  {option.label}
                </span>
                {option.detail && (
                  <span className="text-sm font-extrabold text-foreground shrink-0">
                    {option.detail}
                  </span>
                )}
              </div>
              {option.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        );
      })}
    </fieldset>
  );
}
export default RadioCard;
