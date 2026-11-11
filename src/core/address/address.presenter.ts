import { type CustomerAddress } from './address.types';

/**
 * Presenter formatting functions for saved address cards.
 */
export class AddressPresenter {
  /**
   * Formats a saved address into a short one-line text descriptor.
   */
  static formatSummary(address: CustomerAddress): string {
    return `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;
  }

  /**
   * Formats a saved address into a block for visual card displays.
   */
  static formatAddressBlock(address: CustomerAddress): string {
    const lines = [
      `${address.firstName} ${address.lastName}`,
      address.addressLine1,
      address.addressLine2 || null,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ].filter(Boolean);

    return lines.join('\n');
  }
}
export default AddressPresenter;
