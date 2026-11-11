'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupplierInviteDetailsAction, acceptSupplierInviteAction } from '@/app/actions/supplier-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { toast } from 'sonner';
import { Building2, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function SupplierInviteAcceptancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [isPending, startTransition] = React.useTransition();
  const [loadingInvite, setLoadingInvite] = React.useState(true);
  const [inviteDetails, setInviteDetails] = React.useState<{
    email: string;
    supplierName: string;
    commissionRate: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  React.useEffect(() => {
    if (!token) {
      setErrorMsg('No invitation token provided.');
      setLoadingInvite(false);
      return;
    }

    startTransition(async () => {
      const res = await getSupplierInviteDetailsAction(token);
      if (res.success && res.invite) {
        setInviteDetails(res.invite);
        setFullName(res.invite.supplierName);
      } else {
        setErrorMsg(res.error || 'Failed to validate supplier invitation link.');
      }
      setLoadingInvite(false);
    });
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !inviteDetails) return;

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);

    startTransition(async () => {
      const res = await acceptSupplierInviteAction(token, formData);
      if (res.success) {
        toast.success('Supplier boutique account activated successfully!');
        router.push('/supplier');
      } else {
        toast.error(res.error || 'Failed to accept invitation.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span className="font-heading font-extrabold text-lg tracking-wide uppercase">Boutique Partner Onboarding</span>
          </div>
        </div>

        {loadingInvite ? (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Validating invitation token...</span>
          </div>
        ) : errorMsg ? (
          <div className="py-8 text-center flex flex-col gap-4">
            <div className="text-rose-400 font-bold text-sm bg-rose-950/50 p-4 rounded border border-rose-900">
              {errorMsg}
            </div>
            <Button
              type="button"
              onClick={() => router.push('/')}
              className="bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold uppercase h-10 cursor-pointer"
            >
              Return to Storefront
            </Button>
          </div>
        ) : inviteDetails ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-medium">Boutique Label:</span>
              <span className="text-lg font-bold text-white tracking-wide font-heading uppercase">{inviteDetails.supplierName}</span>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1 border-t border-slate-850 pt-2 font-mono">
                <span>Account Email: {inviteDetails.email}</span>
                <span className="text-amber-400 font-semibold">{inviteDetails.commissionRate}% Commission</span>
              </div>
            </div>

            <FormField label="Full Contact Name">
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isPending}
                className="bg-slate-950 border-slate-800 text-white h-10 text-sm font-semibold"
                suppressHydrationWarning
              />
            </FormField>

            <FormField label="Contact Phone Number">
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={isPending}
                className="bg-slate-950 border-slate-800 text-white h-10 text-sm"
                suppressHydrationWarning
              />
            </FormField>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full mt-3 h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Activating Boutique...
                </>
              ) : (
                <>
                  Accept Invitation & Launch Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
