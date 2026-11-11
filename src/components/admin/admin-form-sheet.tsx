'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sparkles } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface AdminFormSheetProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  triggerAsChild?: boolean;
}

export function AdminFormSheet({
  trigger,
  title,
  description,
  open,
  onOpenChange,
  children,
  className,
  triggerAsChild = true,
}: AdminFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <SheetTrigger asChild={triggerAsChild}>
          {trigger}
        </SheetTrigger>
      )}
      <SheetContent
        className={cn(
          "w-[95vw] max-w-[540px] sm:w-[540px] border-r border-slate-200 bg-white p-0 flex flex-col h-full",
          className
        )}
      >
        {/* Sticky Header Layout */}
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <SheetHeader className="mb-0">
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> {title}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500 font-sans">
              {description}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
