'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, X, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { type SearchProductResult, type SearchCategoryResult, type QuickSearchResponse } from '@/app/api/search/route';

const POPULAR_SUGGESTIONS = [
  'Denim',
  'Hoodies',
  'Cargo Pants',
  'Oversized Tees',
  'Outerwear',
  'Gym Wear',
  'Accessories',
];

/**
 * Minimalist Luxury Storefront Search Bar
 * Refined streetwear aesthetic: quiet luxury, subtle monochrome typography,
 * instant 0ms cached typeahead, and no clumsy block buttons or borders.
 */
export function Search({ className }: { className?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(searchParams.get('q') || '');
  const [results, setResults] = React.useState<QuickSearchResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const cacheRef = React.useRef<Map<string, QuickSearchResponse>>(new Map());

  // Auto-focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setResults(null);
    }
  }, [isOpen]);

  // Global Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Low-latency typeahead search with 150ms debounce & in-memory cache
  React.useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    // 0ms Cache Hit: Serve immediately from memory if previously fetched
    const cacheKey = trimmed.toLowerCase();
    if (cacheRef.current.has(cacheKey)) {
      setResults(cacheRef.current.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data: QuickSearchResponse = await res.json();
          cacheRef.current.set(cacheKey, data);
          setResults(data);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

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

  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return isNaN(num) ? `₹${price}` : `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <>
      {/* Search Icon Trigger in Header */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center h-9 w-9 text-current transition-opacity hover:opacity-70 cursor-pointer",
          className || "rounded-full border border-border bg-background"
        )}
        aria-label="Open search"
      >
        <SearchIcon className="h-[18px] w-[18px] stroke-[1.6]" />
      </button>

      {/* Minimalist Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[1050] select-none">
          {/* Subtle Dark Frosted Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Search Dropdown Panel (Centered & Contained) */}
          <div className="relative z-10 w-full bg-white border-b border-neutral-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 border-b border-neutral-100"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <SearchIcon className="h-5 w-5 text-neutral-400 shrink-0 stroke-[1.6]" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search denim, hoodies, cargo..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base font-normal tracking-wide text-neutral-900 placeholder:text-neutral-400 border-none outline-none ring-0 focus:ring-0 focus:outline-none"
                />
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-neutral-400 animate-spin shrink-0" />
                )}
              </div>

              {/* Close & Clear Action */}
              <div className="flex items-center gap-2 shrink-0">
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setResults(null);
                    }}
                    className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer mr-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center h-8 w-8 text-neutral-500 hover:text-neutral-950 transition-opacity cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 stroke-[1.6]" />
                </button>
              </div>
            </form>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 max-h-[70vh] overflow-y-auto">
              {query.trim().length >= 2 && results ? (
                <div className="space-y-4">
                  {/* Category Matching Tags */}
                  {results.categories && results.categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-100">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                        In Categories:
                      </span>
                      {results.categories.map((cat: SearchCategoryResult) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-medium text-neutral-700 hover:text-black uppercase tracking-wider transition-colors hover:underline underline-offset-4"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Matching Products Minimal List */}
                  {results.products && results.products.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                          Products ({results.products.length})
                        </span>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>View all</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="divide-y divide-neutral-100">
                        {results.products.map((product: SearchProductResult) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-neutral-50/80 transition-colors"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-14 bg-neutral-100 overflow-hidden shrink-0 rounded-xs">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px]">
                                    NO IMG
                                  </div>
                                )}
                              </div>
                              <div className="truncate">
                                {product.categoryName && (
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-semibold block mb-0.5">
                                    {product.categoryName}
                                  </span>
                                )}
                                <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-900 uppercase group-hover:text-neutral-600 transition-colors block truncate">
                                  {product.name}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-4">
                              <span className="text-xs font-semibold text-neutral-900 font-mono">
                                {formatPrice(product.price)}
                              </span>
                              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                                <span className="block text-[10px] text-neutral-400 line-through font-mono">
                                  {formatPrice(product.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Footer Link */}
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full pt-4 mt-2 border-t border-neutral-100 text-center text-xs font-bold uppercase tracking-widest text-neutral-900 hover:text-neutral-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View all results for &ldquo;{query}&rdquo;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : !isLoading ? (
                    <div className="py-8 text-center space-y-1.5">
                      <p className="text-xs uppercase tracking-wider font-semibold text-neutral-700">
                        No results for &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Try searching by category or another keyword.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                /* Default Popular Searches (Minimal) */
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 block">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {POPULAR_SUGGESTIONS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSuggestionClick(term)}
                        className="text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100/70 hover:bg-neutral-200/80 px-3 py-1 rounded-full transition-all cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Search;
