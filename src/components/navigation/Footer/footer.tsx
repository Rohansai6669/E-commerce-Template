'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };
  return (
    <footer className="w-full bg-[#000000] text-white border-t border-neutral-900 mt-auto select-none font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
        {/* Top Block: Brand Info + 4 Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-14">
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-heading text-white">
              LEXIDO
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed font-light">
              Crafted for those who move different. Premium streetwear made in India, designed for the world.
            </p>
          </div>

          {/* 4 Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: SHOP */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-heading">
                SHOP
              </h4>
              <ul className="flex flex-col gap-2 text-sm text-neutral-300">
                <li><Link href="/products?category=men" className="hover:text-white transition-colors">Men</Link></li>
                <li><Link href="/products?category=women" className="hover:text-white transition-colors">Women</Link></li>
                <li><Link href="/products?category=denim" className="hover:text-white transition-colors">Denim</Link></li>
                <li><Link href="/products?category=hoodies" className="hover:text-white transition-colors">Hoodies</Link></li>
              </ul>
            </div>

            {/* Column 2: EXPLORE */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-heading">
                EXPLORE
              </h4>
              <ul className="flex flex-col gap-2 text-sm text-neutral-300">
                <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
                <li><Link href="/products?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>

            {/* Column 3: HELP */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-heading">
                HELP
              </h4>
              <ul className="flex flex-col gap-2 text-sm text-neutral-300">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Raise Ticket</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>

            {/* Column 4: REACH US */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-heading">
                REACH US
              </h4>
              <div className="flex flex-col gap-2 text-sm text-neutral-300">
                <a href="mailto:hello@lexido.in" className="hover:text-white transition-colors">hello@lexido.in</a>
                <span className="text-xs text-neutral-400">Mon–Sat, 10am–7pm IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-neutral-900" />

        {/* Middle Block: Newsletter (Left) & Social Channels (Right) */}
        <div className="py-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Newsletter Box */}
          <div className="flex flex-col gap-3">
            <h5 className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 font-heading">
              BECOME PART OF LEXIDO
            </h5>
            {isSubscribed ? (
              <div className="text-xs font-semibold tracking-wider text-emerald-400 py-2">
                ✓ THANK YOU FOR SUBSCRIBING TO THE LEXIDO INNER CIRCLE.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="bg-transparent border-b border-neutral-700 py-1.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-white focus:outline-none transition-colors w-full sm:w-80"
                />
                <button
                  type="submit"
                  className="text-xs font-bold tracking-widest uppercase text-white hover:text-neutral-300 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>SUBSCRIBE</span>
                  <span>→</span>
                </button>
              </form>
            )}
          </div>

          {/* Social Channels with Square Outlined Borders */}
          <div className="flex flex-col gap-3 md:items-end">
            <h5 className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 font-heading">
              FOLLOW
            </h5>
            <div className="flex items-center gap-2">
              {[
                {
                  label: 'Instagram',
                  href: 'https://instagram.com/lexido',
                  svg: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  label: 'Facebook',
                  href: 'https://facebook.com',
                  svg: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  label: 'X (Twitter)',
                  href: 'https://x.com',
                  svg: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: 'Pinterest',
                  href: 'https://pinterest.com',
                  svg: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                    </svg>
                  ),
                },
                {
                  label: 'TikTok',
                  href: 'https://tiktok.com',
                  svg: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.55c-.01 1.7-.55 3.42-1.62 4.75-1.34 1.67-3.41 2.67-5.55 2.67-2.14 0-4.21-1-5.55-2.67-1.07-1.33-1.61-3.05-1.62-4.75 0-1.7.54-3.42 1.62-4.75 1.34-1.67 3.41-2.67 5.55-2.67.38 0 .76.03 1.14.09v4.1c-.36-.11-.74-.17-1.14-.17-.98 0-1.92.46-2.53 1.23-.61.77-.85 1.79-.85 2.75 0 .96.24 1.98.85 2.75.61.77 1.55 1.23 2.53 1.23.98 0 1.92-.46 2.53-1.23.61-.77.85-1.79.85-2.75V.02z" />
                    </svg>
                  ),
                },
                {
                  label: 'YouTube',
                  href: 'https://youtube.com',
                  svg: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-neutral-500 rounded-none transition-colors cursor-pointer"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-neutral-900" />

        {/* Bottom Block: Copyright (Left) & Community Tagline (Right) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div>
            &copy; 2026 LEXIDO. All rights reserved. Made in India.
          </div>
          <div className="tracking-widest uppercase text-[11px]">
            TAG <span className="text-white font-bold">@LEXIDO</span> — FEATURED IN OUR NEXT DROP
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
