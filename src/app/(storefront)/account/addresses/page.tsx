import * as React from 'react';
import { getCurrentUser } from '@/core/auth/session';
import { addressRepository } from '@/core/address/address.repository';
import { AddressBook } from '@/components/storefront/account/address-book';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

export const metadata = {
  title: 'My Addresses | Storefront',
  description: 'Manage your saved shipping and billing addresses.',
};

/**
 * Server Component serving the /account/addresses CRUD list page.
 */
export default async function AccountAddressesPage() {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const addresses = await addressRepository.getAddresses(user.id);

  return <AddressBook initialAddresses={addresses} />;
}
