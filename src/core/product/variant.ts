import { type StorefrontVariant } from './product.types';

/**
 * Matches user-selected options (e.g., { Size: 'L', Color: 'Blue' }) to a storefront variant.
 * Supports case-insensitive matching on keys and values, ignoring product-level attributes
 * not modeled as variant dimensions (such as Department or Audience).
 */
export function findSelectedVariant(
  variants: StorefrontVariant[],
  selectedOptions: Record<string, string>
): StorefrontVariant | null {
  if (!variants || variants.length === 0) return null;

  return (
    variants.find((variant) => {
      const variantOptionEntries = Object.entries(variant.options || {});
      if (variantOptionEntries.length === 0) return false;

      // Ensure every variant dimension matches the user selection (case-insensitive)
      return variantOptionEntries.every(([vKey, vVal]) => {
        const matchingEntry = Object.entries(selectedOptions).find(
          ([sKey]) => sKey.trim().toLowerCase() === vKey.trim().toLowerCase()
        );
        if (!matchingEntry) return false;
        return matchingEntry[1].trim().toLowerCase() === vVal.trim().toLowerCase();
      });
    }) || null
  );
}

/**
 * Checks if a specific option value combination is available (quantity > 0)
 * given other active selections. Used to visually indicate availability without blocking selection.
 */
export function isOptionCombinationAvailable(
  variants: StorefrontVariant[],
  optionName: string,
  optionValue: string,
  selectedOptions: Record<string, string>
): boolean {
  if (!variants || variants.length === 0) return true;

  return variants.some((v) => {
    // Check candidate option match (case-insensitive)
    const matchingOptionEntry = Object.entries(v.options || {}).find(
      ([key]) => key.trim().toLowerCase() === optionName.trim().toLowerCase()
    );
    // If variant does not have this option dimension, don't disqualify it
    if (matchingOptionEntry && matchingOptionEntry[1].trim().toLowerCase() !== optionValue.trim().toLowerCase()) {
      return false;
    }

    // Must be in stock
    if (v.quantity <= 0) return false;

    // Must match other relevant currently selected options
    return Object.entries(selectedOptions).every(([sKey, sVal]) => {
      if (sKey.trim().toLowerCase() === optionName.trim().toLowerCase()) return true;
      const vEntry = Object.entries(v.options || {}).find(
        ([k]) => k.trim().toLowerCase() === sKey.trim().toLowerCase()
      );
      if (!vEntry) return true;
      return vEntry[1].trim().toLowerCase() === sVal.trim().toLowerCase();
    });
  });
}

