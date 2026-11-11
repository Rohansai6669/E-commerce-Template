import * as React from 'react';
import { cn } from '@/core/utils/cn';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string | null;
}

export function ErrorMessage({ message, children, className, ...props }: ErrorMessageProps) {
  const content = message || children;
  if (!content) return null;

  return (
    <p
      className={cn('text-xs font-medium text-destructive', className)}
      role="alert"
      {...props}
    >
      {content}
    </p>
  );
}
export default ErrorMessage;
