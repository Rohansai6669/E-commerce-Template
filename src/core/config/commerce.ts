export const commerceConfig = {
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
  tax: {
    defaultRate: 0.18, // 18% default tax (GST)
  },
  shipping: {
    freeThreshold: 999.0, // Free shipping above ₹999
    standardRate: 99.0,
    expressRate: 199.0,
  },
} as const;

export default commerceConfig;
