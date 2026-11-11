import { profileSchema } from './profile.validation';

/**
 * AccountService coordinates profile changes.
 */
export class AccountService {
  /**
   * Validates profile update form values.
   */
  validateProfile(data: unknown): { success: boolean; errors: Record<string, string> } {
    const result = profileSchema.safeParse(data);
    if (result.success) {
      return { success: true, errors: {} };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string') {
        errors[field] = issue.message;
      }
    });

    return { success: false, errors };
  }
}

export const accountService = new AccountService();
export default accountService;
