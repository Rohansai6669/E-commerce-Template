import * as React from 'react';
import { connection } from 'next/server';
import { SettingsForm } from '@/components/admin/settings-form';

/**
 * Server Component displaying the Admin Settings Manager.
 */
export default async function AdminSettingsManager() {
  await connection();

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 uppercase font-heading">Storefront Settings</h2>
        <p className="text-sm text-slate-505 font-sans">
          Manage dynamic e-commerce settings, metadata variables, and thresholds.
        </p>
      </div>

      <div className="p-8 rounded border border-slate-200 bg-white shadow-xs">
        <SettingsForm />
      </div>
    </div>
  );
}
