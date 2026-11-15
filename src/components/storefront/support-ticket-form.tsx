'use client';

import * as React from 'react';
import { submitCustomerSupportTicketAction } from '@/app/actions/help-cms-actions';
import { SupportTicketConfig } from '@/types/help-pages';
import { CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicketFormProps {
  config: SupportTicketConfig;
}

export function SupportTicketForm({ config }: SupportTicketFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [submittedTicketId, setSubmittedTicketId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    orderNumber: '',
    category: config.categories[0] || 'Order Delivery & Delay',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitCustomerSupportTicketAction(formData);
      if (res.success && res.ticketId) {
        setSubmittedTicketId(res.ticketId);
        toast.success(`Support ticket ${res.ticketId} created successfully.`);
      } else {
        toast.error(res.error || 'Failed to submit support ticket.');
      }
    });
  };

  if (submittedTicketId) {
    return (
      <div className="border border-black dark:border-white p-8 sm:p-12 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center text-center gap-4">
        <CheckCircle2 className="w-12 h-12 text-black dark:text-white" />
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          TICKET DISPATCH CONFIRMED
        </span>
        <h3 className="text-2xl font-black uppercase tracking-tight font-heading">
          Ticket #{submittedTicketId} Registered
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md font-light leading-relaxed">
          Our atelier concierge team has received your inquiry. An intake confirmation has been dispatched to{' '}
          <strong className="text-neutral-900 dark:text-white">{formData.email}</strong>. We will respond within 4 business hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmittedTicketId(null);
            setFormData({
              name: '',
              email: '',
              orderNumber: '',
              category: config.categories[0] || 'Order Delivery & Delay',
              subject: '',
              message: '',
            });
          }}
          className="mt-4 px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 bg-white dark:bg-black flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h3 className="text-base font-black uppercase tracking-widest font-heading text-neutral-900 dark:text-white">
          CONCIERGE INQUIRY FORM
        </h3>
        <p className="text-xs text-neutral-500 font-light">
          {config.slaNotice}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Alex Morgan"
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. alex@example.com"
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Order Reference (Optional)
          </label>
          <input
            type="text"
            value={formData.orderNumber}
            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            placeholder="e.g. ORD-2608-ABCDE"
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Inquiry Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
          >
            {config.categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Subject *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Brief summary of your request"
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Detailed Message *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Provide as much detail as possible to help us expedite resolution..."
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:outline-none resize-none font-sans"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start px-8 py-3 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
        {isPending ? 'Transmitting Request...' : 'Dispatch Ticket →'}
      </button>
    </form>
  );
}

