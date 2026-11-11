import * as React from 'react';
import Link from 'next/link';
import { AddCustomerForm } from '@/components/admin/add-customer-form';
import { connection } from 'next/server';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';

export default async function AdminNewCustomerPage() {
  await connection();

  return (
    <div className="w-full text-slate-900 pb-12 font-sans max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/customers"
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-bold uppercase transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2.5 mt-1">
            <Users className="w-6 h-6 text-slate-900" />
            Register New User Account
          </h1>
          <p className="text-xs text-slate-500">
            Create a new customer, staff, or administrator account, assign permissions, and upload profile details.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <AddCustomerForm redirectOnSuccess="/admin/customers" />
      </div>
    </div>
  );
}
