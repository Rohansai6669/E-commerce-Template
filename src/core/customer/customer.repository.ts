import { db } from '@/lib/db';
import { profiles, type Profile } from '@/lib/db/schema/auth';
import { eq } from 'drizzle-orm';

/**
 * CustomerRepository manages database queries and updates for customer profile details.
 */
export class CustomerRepository {
  /**
   * Fetches a customer profile by profile ID.
   */
  async findById(id: string): Promise<Profile | null> {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));
    return row ?? null;
  }

  /**
   * Updates an existing customer profile.
   */
  async update(id: string, data: Partial<Omit<Profile, 'id' | 'role' | 'createdAt'>>): Promise<Profile | null> {
    const [updated] = await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id))
      .returning();
    return updated ?? null;
  }

  /**
   * Fetches all registered customer profiles, sorted by registration date.
   */
  async getAllCustomers(): Promise<Profile[]> {
    return await db
      .select()
      .from(profiles)
      .orderBy(profiles.createdAt);
  }
}

export const customerRepository = new CustomerRepository();
export default customerRepository;
