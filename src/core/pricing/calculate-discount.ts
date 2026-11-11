/**
 * Calculates the percentage discount between a base price and a sale price.
 * Returns the rounded integer percentage (e.g. 20 for a 20% discount).
 */
export function calculateDiscountPercentage(
  basePrice: number | string,
  salePrice: number | string
): number {
  const base = typeof basePrice === 'number' ? basePrice : parseFloat(basePrice);
  const sale = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice);

  if (isNaN(base) || isNaN(sale) || base <= 0 || sale >= base) {
    return 0;
  }

  const discount = ((base - sale) / base) * 100;
  return Math.round(discount);
}

/**
 * Calculates absolute monetary savings between original base price and discounted price.
 */
export function calculateSavings(
  basePrice: number | string,
  salePrice: number | string
): number {
  const base = typeof basePrice === 'number' ? basePrice : parseFloat(basePrice);
  const sale = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice);

  if (isNaN(base) || isNaN(sale) || base <= 0 || sale >= base) {
    return 0;
  }

  return base - sale;
}
