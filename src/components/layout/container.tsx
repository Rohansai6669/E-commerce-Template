import * as React from 'react';
import { cn } from '@/core/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Container({ as: Component = 'div', className, ...props }: ContainerProps) {
  return (
    <Component
      className={cn(
        'w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16',
        className
      )}
      {...props}
    />
  );
}
export default Container;
