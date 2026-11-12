'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/core/utils/cn';

const POPULAR_SUGGESTIONS = [
  'Denim',
  'Hoodies',
  'Cargo Pants',
  'Oversized Tees',
  'Gym Wear',
  'Outerwear',
  'Accessories',
];

/**
 * Full-Width Header Search Bar Overlay matching Lexido design spec.
 */
export function Search({ className }: { className?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(searchParams.get('q') || '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus input when search bar opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Submit search query
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Search Icon Trigger in Header */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center h-9 w-9 text-foreground transition-colors cursor-pointer",
          className || "rounded-full border border-border bg-background hover:bg-accent"
        )}
        aria-label="Open search bar"
      >
        <SearchIcon className="h-[18px] w-[18px] stroke-[1.8]" />
      </button>

      {/* Full-Width Header Search Bar Overlay */}
      {isOpen && (
        <div className="fixed inset-x-0 top-0 z-[1050] bg-white text-slate-900 border-b border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <form
            onSubmit={handleSubmit}
            className="max-w-[1600px] mx-auto px-6 lg:px-12 h-[var(--header-height,4.5rem)] flex items-center justify-between gap-4"
          >
            {/* Magnifying Glass Icon & Full Width Input */}
            <div className="flex items-center gap-4 flex-1">
              <SearchIcon className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search denim, hoodies, cargo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 border-none outline-none ring-0 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Right: Close X Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Quick Suggestions & Popular Searches Dropdown */}
          <div className="border-t border-slate-100 bg-slate-50/90 backdrop-blur-md py-3 px-6 lg:px-12 max-w-[1600px] mx-auto flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mr-2">
              POPULAR SEARCHES:
            </span>
            {POPULAR_SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSuggestionClick(term)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:border-slate-400 px-3 py-1 rounded-full transition-all cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
export default Search;
