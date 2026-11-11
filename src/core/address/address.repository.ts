import { db } from '@/lib/db';
import { customerAddresses } from '@/lib/db/schema/address';
import { eq, and } from 'drizzle-orm';
import { type CustomerAddress, type NewCustomerAddress } from './address.types';

/**
 * AddressRepository manages database CRUD operations for the customer_addresses table.
 */
export class AddressRepository {
  /**
   * Fetches all saved shipping addresses for a specific customer profile.
   */
  async getAddresses(profileId: string): Promise<CustomerAddress[]> {
    const rows = await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.profileId, profileId));
    return rows;
  }

  /**
   * Fetches a single saved address by id.
   */
  async getAddressById(id: string): Promise<CustomerAddress | null> {
    const [row] = await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.id, id));
    return row ?? null;
  }

  /**
   * Creates a new saved shipping address record.
   * If isDefault is true, unsets any other default address first in a transaction.
   */
  async create(profileId: string, address: NewCustomerAddress): Promise<CustomerAddress> {
    const isDefault = address.isDefault ?? false;

    const result = await db.transaction(async (tx) => {
      if (isDefault) {
        // Reset existing default addresses
        await tx
          .update(customerAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(customerAddresses.profileId, profileId));
      }

      const [newRow] = await tx
        .insert(customerAddresses)
        .values({
          profileId,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? null,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          isDefault,
        })
        .returning();

      return newRow;
    });

    return result;
  }

  /**
   * Updates an existing address.
   * Handles default addresses swap within a transaction.
   */
  async update(id: string, profileId: string, address: Partial<NewCustomerAddress>): Promise<CustomerAddress | null> {
    const isDefault = address.isDefault ?? false;

    const result = await db.transaction(async (tx) => {
      if (isDefault) {
        // Reset existing default addresses
        await tx
          .update(customerAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(customerAddresses.profileId, profileId));
      }

      const [updated] = await tx
        .update(customerAddresses)
        .set({
          ...address,
          updatedAt: new Date(),
        })
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.profileId, profileId)))
        .returning();

      return updated ?? null;
    });

    return result;
  }

  /**
   * Deletes a saved address record by id.
   */
  async delete(id: string, profileId: string): Promise<boolean> {
    const [deleted] = await db
      .delete(customerAddresses)
      .where(and(eq(customerAddresses.id, id), eq(customerAddresses.profileId, profileId)))
      .returning();
    return !!deleted;
  }

  /**
   * Sets a specific saved address as default.
   */
  async setDefault(id: string, profileId: string): Promise<boolean> {
    const result = await db.transaction(async (tx) => {
      // 1. Reset all to false
      await tx
        .update(customerAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(customerAddresses.profileId, profileId));

      // 2. Set this one to true
      const [updated] = await tx
        .update(customerAddresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.profileId, profileId)))
        .returning();

      return !!updated;
    });

    return result;
  }
}

export const addressRepository = new AddressRepository();
export default addressRepository;
