
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      display: 'text-5xl font-bold tracking-tight font-heading leading-tight',
      h1: 'text-4xl font-bold tracking-tight font-heading leading-tight',
      h2: 'text-3xl font-semibold tracking-tight font-heading leading-snug',
      h3: 'text-2xl font-semibold tracking-tight font-heading leading-snug',
      h4: 'text-xl font-semibold tracking-tight font-heading leading-snug',
      lead: 'text-lg text-muted-foreground leading-normal',
      body: 'text-base leading-normal font-sans',
      small: 'text-sm font-medium leading-none',
      caption: 'text-xs text-muted-foreground leading-none',
      muted: 'text-sm text-muted-foreground leading-normal',
      overline: 'text-xs font-semibold tracking-wider uppercase text-muted-foreground',
      code: 'relative rounded bg-muted/60 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const defaultTags: Record<string, React.ElementType> = {
      display: 'h1',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      lead: 'p',
      body: 'p',
      small: 'small',
      caption: 'span',
      muted: 'p',
      overline: 'span',
      code: 'code',
    };

    const Component = as || (variant ? defaultTags[variant] : 'p') || 'p';

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Typography.displayName = 'Typography';

// Semantic alias exports
export const Display = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="display" {...props} />
));
Display.displayName = 'Display';

export interface HeadingProps extends Omit<TypographyProps, 'variant'> {
  level?: 1 | 2 | 3 | 4;
}
export const Heading = React.forwardRef<HTMLElement, HeadingProps>(({ level = 1, ...props }, ref) => {
  const variantMap = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;
  return <Typography ref={ref} variant={variantMap[level]} as={`h${level}`} {...props} />;
});
Heading.displayName = 'Heading';

export const Lead = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="lead" {...props} />
));
Lead.displayName = 'Lead';

export const Text = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="body" {...props} />
));
Text.displayName = 'Text';

export const Small = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="small" {...props} />
));
Small.displayName = 'Small';

export const Caption = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="caption" {...props} />
));
Caption.displayName = 'Caption';

export const Muted = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="muted" {...props} />
));
Muted.displayName = 'Muted';

export const Overline = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="overline" {...props} />
));
Overline.displayName = 'Overline';

export const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((props, ref) => (
  <Typography ref={ref} variant="code" {...props} />
));
Code.displayName = 'Code';
