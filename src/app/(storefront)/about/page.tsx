import * as React from 'react';
import InfoLayout from '@/components/storefront/info-layout';

export default function AboutPage() {
  return (
    <InfoLayout
      title="About Us"
      subtitle="Crafting premium custom storefronts since 2026."
    >
      <p>
        Welcome to Antigravity Storefront, a production-ready model for modern e-commerce engineering. 
        Our system is designed with state of the art performance budgets, responsive user modules, 
        and robust administrative controls.
      </p>
      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Our Vision</h3>
      <p>
        We believe that buying and selling products online should be instantaneous, secure, and beautiful. 
        By utilizing Next.js, Supabase, and Drizzle ORM, we achieve optimal rendering scores and secure customer profile isolation.
      </p>
      <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Technical Foundations</h3>
      <ul className="list-disc pl-5 space-y-1 text-slate-400">
        <li>**Framework**: Next.js (App Router with Partial Prerendering)</li>
        <li>**Database**: PostgreSQL managed via Drizzle ORM</li>
        <li>**Auth**: Secure session cookies via Supabase Auth</li>
        <li>**Styling**: Pure CSS combined with Tailwind UI primitives</li>
      </ul>
    </InfoLayout>
  );
}
