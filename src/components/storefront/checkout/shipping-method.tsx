'use client';

import * as React from 'react';
import { RadioCard } from '@/components/forms/radio-card';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type ShippingMethod } from '@/core/checkout/checkout.types';
import { CheckoutPresenter } from '@/core/checkout/checkout.presenter';
import { SHIPPING_METHODS } from '@/core/checkout/checkout.constants';

export interface ShippingMethodSelectorProps {
  defaultValue?: ShippingMethod | null;
  onSubmit: (method: ShippingMethod) => void;
  onBack: () => void;
}

/**
 * Shipping method selection step with radio card selector.
 */
export function ShippingMethodSelector({ defaultValue, onSubmit, onBack }: ShippingMethodSelectorProps) {
  const [selected, setSelected] = React.useState<string>(defaultValue?.id ?? SHIPPING_METHODS[0].id);

  const handleContinue = () => {
    const method = SHIPPING_METHODS.find((m) => m.id === selected);
    if (method) {
      onSubmit(method);
    }
  };

  const options = SHIPPING_METHODS.map((method) => ({
    value: method.id,
    label: `${method.name}`,
    description: `${method.carrier} · ${CheckoutPresenter.formatShippingEstimate(method)}`,
    detail: CheckoutPresenter.formatShippingPrice(method),
    icon: 'Truck' as const,
  }));

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="p-5 border-b border-border bg-muted/10">
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          Shipping Method
        </Heading>
      </CardHeader>

      <CardContent className="p-5">
        <Stack gap="5">
          <RadioCard
            name="shipping-method"
            options={options}
            value={selected}
            onChange={setSelected}
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="font-bold text-xs uppercase cursor-pointer"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              className="font-bold text-xs uppercase cursor-pointer"
            >
              Continue to Review
            </Button>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
export default ShippingMethodSelector;
