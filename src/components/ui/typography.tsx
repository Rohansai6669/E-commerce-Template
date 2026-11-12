
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      display:
        'text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold sm:font-extrabold lg:font-black tracking-tight font-heading leading-[1.05] sm:leading-[0.98]',
      h1:
        'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold sm:font-extrabold tracking-tight font-heading leading-tight',
      h2:
        'text-xl sm:text-2xl md:text-3xl font-semibold sm:font-bold tracking-tight font-heading leading-snug',
      h3:
        'text-lg sm:text-xl md:text-2xl font-semibold sm:font-bold tracking-tight font-heading leading-snug',
      h4:
        'text-base sm:text-lg md:text-xl font-medium sm:font-semibold tracking-tight font-heading leading-snug',
      lead:
        'text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed',
      body:
        'text-xs sm:text-sm md:text-base leading-relaxed font-sans',
      small:
        'text-xs sm:text-sm font-medium leading-normal',
      caption:
        'text-[10px] sm:text-xs text-muted-foreground leading-tight',
      muted:
        'text-xs sm:text-sm text-muted-foreground leading-normal',
      overline:
        'text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-muted-foreground',
      code:
        'relative rounded bg-muted/60 px-[0.3rem] py-[0.2rem] font-mono text-xs sm:text-sm font-semibold',
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
