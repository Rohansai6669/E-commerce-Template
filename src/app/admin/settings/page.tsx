import * as React from 'react';
import { connection } from 'next/server';
import { SettingsForm } from '@/components/admin/settings-form';
import { Sliders, ShieldCheck } from 'lucide-react';

/**
 * Server Component displaying the Admin Settings Manager.
 */
export default async function AdminSettingsManager() {
  await connection();

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-slate-950 text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase font-heading">
              Storefront &amp; System Settings
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            Configure platform architecture, shipping charges, free delivery thresholds, COD controls, and payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Administrative Access
          </span>
        </div>
      </div>

      {/* Main Settings Canvas */}
      <div className="w-full">
        <SettingsForm />
      </div>
    </div>
  );
}
