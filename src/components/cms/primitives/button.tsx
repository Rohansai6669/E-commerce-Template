import React from 'react';
import Link from 'next/link';

interface ThemeButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function ThemeButton({
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: ThemeButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] select-none';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-[var(--radius-sm,4px)]',
    md: 'px-5 py-2.5 text-sm rounded-[var(--radius,8px)]',
    lg: 'px-7 py-3.5 text-base rounded-[var(--radius-lg,12px)]',
  };

  const variantClasses = {
    primary:
      'bg-[var(--primary,#0f172a)] text-white hover:opacity-90 shadow-sm focus:ring-[var(--primary,#0f172a)]',
    secondary:
      'bg-[var(--surface,#f8fafc)] text-[var(--foreground,#0f172a)] border border-[var(--border,#e2e8f0)] hover:bg-[var(--border,#e2e8f0)] focus:ring-[var(--primary,#0f172a)]',
    outline:
      'border-2 border-[var(--primary,#0f172a)] text-[var(--primary,#0f172a)] hover:bg-[var(--primary,#0f172a)] hover:text-white focus:ring-[var(--primary,#0f172a)]',
    accent:
      'bg-[var(--accent,#6366f1)] text-white hover:opacity-90 shadow-md focus:ring-[var(--accent,#6366f1)]',
    ghost:
      'bg-transparent text-[var(--foreground,#0f172a)] hover:bg-black/5 dark:hover:bg-white/10',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClasses}>
      {children}
    </button>
  );
}
