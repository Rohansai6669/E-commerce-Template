import * as React from 'react';
import { customerRepository } from '@/core/customer/customer.repository';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { CustomersList } from '@/components/admin/customers-list';
import { AddCustomerForm } from '@/components/admin/add-customer-form';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { connection } from 'next/server';
import { UserPlus } from 'lucide-react';

import Link from 'next/link';

interface CustomerItem {
  id: string;
  fullName: string | null;
  email: string | null;
  phone?: string | null;
  role: string;
  avatarUrl?: string | null;
  createdAt: Date;
  isActive: boolean;
}

/**
 * Admin Customer Management Directory.
 */
export default async function AdminCustomersPage() {
  await connection();

  const customers = (await customerRepository.getAllCustomers()) as CustomerItem[];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      {/* Header and Add Customer Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Customer Directory & Management
          </Heading>
          <Text className="text-sm text-slate-500 font-sans">
            Manage storefront buyer accounts, authorize staff/admin roles, and inspect customer profiles.
          </Text>
        </div>

        <Link href="/admin/customers/new">
          <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5 self-start">
            <UserPlus className="h-4 w-4" /> Add Customer
          </Button>
        </Link>
      </div>

      {/* Main Customers List View */}
      <CustomersList initialCustomers={customers} />
    </div>
  );
}
