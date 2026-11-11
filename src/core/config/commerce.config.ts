/**
 * Centralized settings for shipping parameters and tax calculations.
 */
export const commerceConfig = {
  shipping: {
    freeThreshold: 999, // Subtotal in INR to qualify for free shipping
    flatRate: 99,       // Shipping price in INR if subtotal < freeThreshold
  },
  tax: {
    defaultRate: 0.18,  // Default GST rate (18%)
    inclusive: true,    // Tax is included in product price (MRP / Tax Inclusive)
    cgstRate: 0.09,     // Central GST rate (9%)
    sgstRate: 0.09,     // State GST rate (9%)
    label: 'GST',
  },
};
export default commerceConfig;
