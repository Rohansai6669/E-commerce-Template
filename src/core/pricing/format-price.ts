export interface FormatPriceOptions {
  currency?: string;
  locale?: string;
  precision?: number;
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  minimumFractionDigits?: number;
}

/**
 * Robust price formatter using Intl.NumberFormat.
 * Supports multi-currency, custom locales, precision levels, and custom fraction display bounds.
 */
export function formatPrice(
  amount: number | string,
  options: FormatPriceOptions = {}
): string {
  const {
    currency = 'INR',
    locale = 'en-IN',
    precision = 2,
    currencyDisplay = 'narrowSymbol',
    minimumFractionDigits,
  } = options;

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);

  if (isNaN(parsedAmount)) {
    return '';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay,
    minimumFractionDigits: minimumFractionDigits !== undefined ? minimumFractionDigits : precision,
    maximumFractionDigits: precision,
  });

  return formatter.format(parsedAmount);
}
export default formatPrice;
