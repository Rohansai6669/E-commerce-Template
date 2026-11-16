import * as React from 'react';
import { HelpLayout } from '@/components/storefront/help-layout';
import { Eye, Keyboard, Monitor, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Accessibility Statement | Lexido',
  description: 'Our commitment to digital accessibility conforming to WCAG 2.1 Level AA standards.',
};

export default function AccessibilityPage() {
  return (
    <HelpLayout
      title="Digital Accessibility"
      subtitle="Ensuring an inclusive, barrier-free luxury shopping experience for everyone."
      badge="WCAG 2.1 AA COMPLIANT"
    >
      <div className="flex flex-col gap-10">
        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <Keyboard className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              Keyboard Navigation
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Full focus trapping, logical tab indices, and zero mouse dependency across all stores.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <Eye className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              Contrast &amp; Legibility
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              High contrast ratios (4.5:1 minimum) and scalable typography up to 200% without breakage.
            </p>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-950 flex flex-col gap-2">
            <Monitor className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              Screen Readers
            </h4>
            <p className="text-xs text-neutral-500 font-light">
              Semantic HTML5 landmark regions, ARIA live states for cart updates, and descriptive alt text.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="flex flex-col gap-8 text-neutral-700 dark:text-neutral-300">
          <div className="space-y-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              01. Our Standard
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Lexido is committed to facilitating the accessibility and usability of its digital storefront for all individuals, including those with disabilities. We continually review and improve our user interface to align with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA specifications.
            </p>
          </div>

          <div className="space-y-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              02. Assistive Technology Compatibility
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Our website is developed to be compatible with popular screen readers (including NVDA, JAWS, VoiceOver, and TalkBack), speech recognition software, and operating system accessibility features across Chrome, Safari, Edge, and Firefox.
            </p>
          </div>

          <div className="space-y-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
              03. Feedback &amp; Assistance
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              If you experience difficulty accessing any element of our website or require assistance placing an order, our accessibility team is available to help. Please reach out to <a href="mailto:support@lexido.com" className="text-foreground underline font-semibold">support@lexido.com</a> with the URL and nature of your request.
            </p>
          </div>
        </div>
      </div>
    </HelpLayout>
  );
}

