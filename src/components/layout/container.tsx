import * as React from 'react';
import { cn } from '@/core/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Container({ as: Component = 'div', className, ...props }: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full max-w-[var(--container-max-width)] px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    />
  );
}
export default Container;
