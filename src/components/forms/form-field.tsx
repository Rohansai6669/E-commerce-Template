import * as React from 'react';
import { Label } from './label';
import { ErrorMessage } from './error-message';
import { Stack } from '@/components/layout/stack';
import { cn } from '@/core/utils/cn';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string | null;
  description?: string;
  id?: string;
}

export function FormField({
  label,
  error,
  description,
  id,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <Stack gap="1" className={cn('w-full', className)} {...props}>
      {label && (
        <Label htmlFor={id} className={error ? 'text-destructive' : ''}>
          {label}
        </Label>
      )}
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <ErrorMessage message={error} />
    </Stack>
  );
}
export default FormField;
