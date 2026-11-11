import * as React from 'react';
import { cn } from '@/core/utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function Section({ as: Component = 'section', className, ...props }: SectionProps) {
  return (
    <Component
      className={cn(
        'py-8 md:py-12 lg:py-16',
        className
      )}
      {...props}
    />
  );
}
export default Section;
