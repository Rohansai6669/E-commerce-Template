'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { Icon } from '@/components/ui/icon';
import { CHECKOUT_STEPS, getStepIndex } from '@/core/checkout/checkout.constants';
import { type CheckoutStep } from '@/core/checkout/checkout.types';

export interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

/**
 * Horizontal step progress indicator for checkout flow.
 */
export function CheckoutProgress({ currentStep, onStepClick }: CheckoutProgressProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-between gap-0">
        {CHECKOUT_STEPS.map((stepInfo, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isClickable = isCompleted && onStepClick;

          return (
            <li key={stepInfo.step} className="flex-1 flex items-center">
              {/* Step circle + label */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(stepInfo.step)}
                className={cn(
                  'flex flex-col items-center gap-1.5 w-full group transition-colors',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center h-9 w-9 rounded-full border-2 text-xs font-bold transition-all duration-300',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isActive && 'border-primary bg-primary/10 text-primary scale-110',
                    !isCompleted && !isActive && 'border-muted-foreground/30 bg-muted/50 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Icon name="Check" className="h-4 w-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-semibold tracking-wide text-center leading-tight',
                    isActive && 'text-primary',
                    isCompleted && 'text-foreground',
                    !isCompleted && !isActive && 'text-muted-foreground'
                  )}
                >
                  {stepInfo.label}
                </span>
              </button>

              {/* Connecting line (not after last step) */}
              {idx < CHECKOUT_STEPS.length - 1 && (
                <div
                  className={cn(
                    'hidden sm:block flex-1 h-0.5 mx-1 -mt-5 transition-colors duration-300',
                    idx < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
export default CheckoutProgress;
