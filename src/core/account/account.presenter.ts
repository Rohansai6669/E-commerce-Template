/**
 * Formats profile membership details.
 */
export class AccountPresenter {
  /**
   * Formats a dynamic membership registration relative time string (e.g. "Joined March 2026").
   */
  static formatMembershipDate(isoDate: string | Date): string {
    const date = new Date(isoDate);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `Member since ${month} ${year}`;
  }

  /**
   * Formats profile display avatars initials from user name (e.g. "John Doe" -> "JD").
   */
  static formatInitials(fullName: string | null): string {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
  }
}
export default AccountPresenter;
