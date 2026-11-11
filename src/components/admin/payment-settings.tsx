'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Zap, ShieldCheck, CheckCircle2, Lock, ArrowUpRight, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function RazorpaySettingsPanel() {
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T0J0SQvJdfn0aG';
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/webhooks/razorpay`;

  const copyToClipboard = (text: string, type: 'key' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.success('Razorpay Key ID copied to clipboard');
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
      toast.success('Webhook URL copied to clipboard');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl py-2">
      {/* Gateway Status Header */}
      <div className="p-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-background dark:to-background shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-950 font-heading">
                Razorpay Payment Gateway
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured via environment variables. Real-time UPI, Cards, Netbanking & Wallets enabled.
            </p>
          </div>
        </div>

        <a
          href="https://dashboard.razorpay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Razorpay Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* API Key Credentials */}
      <Card className="border-slate-200 bg-white shadow-2xs">
        <CardHeader className="p-4 border-b border-slate-100">
          <Heading level={3} className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
            API Credentials & Environment
          </Heading>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
              Razorpay Key ID (Public Client Key)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={keyId}
                className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(keyId, 'key')}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Loaded securely from <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">RAZORPAY_KEY</code> in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code>.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
              Razorpay Key Secret (Server Secret)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value="●●●●●●●●●●●●●●●●●●●●"
                className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
              />
              <span className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-500 flex items-center gap-1 select-none">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Encrypted in .env</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Used strictly server-side for cryptographic HMAC SHA-256 signature verification and order creation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration Card */}
      <Card className="border-slate-200 bg-white shadow-2xs">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <Heading level={3} className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
            Webhook Event Endpoint
          </Heading>
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Automated Sync</span>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Register this webhook URL inside your Razorpay Dashboard (Settings &gt; Webhooks) to receive automated notifications for asynchronous payment captures, failures, and reconciliations.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 select-all"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(webhookUrl, 'webhook')}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="pt-2">
            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight mb-1.5">
              Subscribed Events:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {['payment.captured', 'order.paid', 'payment.failed'].map((ev) => (
                <span
                  key={ev}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {ev}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Payment Channels */}
      <Card className="border-slate-200 bg-white shadow-2xs">
        <CardHeader className="p-4 border-b border-slate-100">
          <Heading level={3} className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
            Active Payment Channels
          </Heading>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-extrabold text-slate-950 block">UPI (Instant & QR)</span>
              <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-extrabold text-slate-950 block">Credit & Debit Cards</span>
              <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay, Maestro, Diners, American Express</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-extrabold text-slate-950 block">Netbanking</span>
              <p className="text-[11px] text-slate-500">SBI, HDFC, ICICI, Axis, Kotak and 50+ Indian Banks</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-extrabold text-slate-950 block">Cash on Delivery (COD)</span>
              <p className="text-[11px] text-slate-500">Doorstep cash or delivery partner QR collection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RazorpaySettingsPanel;

