import { type StorefrontVariant } from './product.types';

/**
 * Matches user-selected options (e.g., { Size: 'L', Color: 'Blue' }) to a storefront variant.
 */
export function findSelectedVariant(
  variants: StorefrontVariant[],
  selectedOptions: Record<string, string>
): StorefrontVariant | null {
  if (variants.length === 0) return null;

  return (
    variants.find((variant) => {
      const variantOptionEntries = Object.entries(variant.options);
      // Ensure all variant options match the user selection
      return (
        variantOptionEntries.length > 0 &&
        variantOptionEntries.every(([key, val]) => selectedOptions[key] === val)
      );
    }) || null
  );
}

/**
 * Checks if a specific option value combination is available (quantity > 0)
 * given other active selections. Used to grey out options.
 */
export function isOptionCombinationAvailable(
  variants: StorefrontVariant[],
  optionName: string,
  optionValue: string,
  selectedOptions: Record<string, string>
): boolean {
  return variants.some((v) => {
    // Must match the candidate option value
    if (v.options[optionName] !== optionValue) return false;
    // Must be in stock
    if (v.quantity <= 0) return false;

    // Must match all OTHER currently selected options
    return Object.entries(selectedOptions).every(([key, val]) => {
      if (key === optionName) return true;
      return v.options[key] === val;
    });
  });
}
