'use client';

const RECENTLY_VIEWED_KEY = 'storefront:recently-viewed';

/**
 * Client-side helper service for tracking customer recently viewed product slug histories.
 */
export class RecentlyViewedService {
  /**
   * Appends a product slug to history, keeping unique entries capped at 5.
   */
  static add(slug: string): void {
    if (typeof window === 'undefined') return;

    try {
      const slugs = this.get();
      const filtered = slugs.filter((s) => s !== slug);
      const updated = [slug, ...filtered].slice(0, 5);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update recently viewed history:', err);
    }
  }

  /**
   * Retrieves array of recently viewed product slugs.
   */
  static get(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
    } catch {
      return [];
    }
    return [];
  }

  /**
   * Removes a product slug from history.
   */
  static remove(slug: string): void {
    if (typeof window === 'undefined') return;

    try {
      const slugs = this.get();
      const updated = slugs.filter((s) => s !== slug);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to remove from recently viewed:', err);
    }
  }

  /**
   * Clears all history entries.
   */
  static clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch {
      // Ignored
    }
  }
}
export default RecentlyViewedService;
