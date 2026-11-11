'use client';

import React, { useState, useEffect } from 'react';

interface CountdownPrimitiveProps {
  targetDate?: string;
  className?: string;
}

export function CountdownPrimitive({ targetDate, className = '' }: CountdownPrimitiveProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`flex items-center gap-2 font-mono font-bold ${className}`}>
      <div className="flex flex-col items-center bg-[var(--surface,#f8fafc)] border border-[var(--border,#e2e8f0)] rounded-lg px-2.5 py-1 min-w-[48px]">
        <span className="text-lg text-[var(--primary,#0f172a)]">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] text-[var(--muted-foreground,#64748b)] font-sans uppercase font-normal">HRS</span>
      </div>
      <span className="text-lg text-[var(--muted-foreground,#64748b)]">:</span>
      <div className="flex flex-col items-center bg-[var(--surface,#f8fafc)] border border-[var(--border,#e2e8f0)] rounded-lg px-2.5 py-1 min-w-[48px]">
        <span className="text-lg text-[var(--primary,#0f172a)]">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] text-[var(--muted-foreground,#64748b)] font-sans uppercase font-normal">MIN</span>
      </div>
      <span className="text-lg text-[var(--muted-foreground,#64748b)]">:</span>
      <div className="flex flex-col items-center bg-[var(--surface,#f8fafc)] border border-[var(--border,#e2e8f0)] rounded-lg px-2.5 py-1 min-w-[48px]">
        <span className="text-lg text-[var(--accent,#6366f1)]">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] text-[var(--muted-foreground,#64748b)] font-sans uppercase font-normal">SEC</span>
      </div>
    </div>
  );
}
