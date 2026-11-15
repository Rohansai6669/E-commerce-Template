'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { FooterConfig, defaultFooterConfig, FooterSocialLink } from '@/types/footer-config';
import { useFooterConfig } from '@/hooks/use-footer-config';

export interface FooterProps {
  initialConfig?: FooterConfig;
  previewConfig?: FooterConfig;
  className?: string;
  onClick?: () => void;
}

const WIDTH_CLASS_MAP: Record<string, string> = {
  boxed: 'max-w-7xl mx-auto px-6 sm:px-8 lg:px-12',
  wide: 'max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-14',
  full: 'w-full px-6 sm:px-8 lg:px-12',
};

const BORDER_WIDTH_MAP: Record<string, string> = {
  none: 'border-t-0',
  thin: 'border-t',
  medium: 'border-t-2',
  thick: 'border-t-4',
};

const BORDER_STYLE_MAP: Record<string, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  none: 'border-none',
};

function getSocialSvg(platform: string) {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.55c-.01 1.7-.55 3.42-1.62 4.75-1.34 1.67-3.41 2.67-5.55 2.67-2.14 0-4.21-1-5.55-2.67-1.07-1.33-1.61-3.05-1.62-4.75 0-1.7.54-3.42 1.62-4.75 1.34-1.67 3.41-2.67 5.55-2.67.38 0 .76.03 1.14.09v4.1c-.36-.11-.74-.17-1.14-.17-.98 0-1.92.46-2.53 1.23-.61.77-.85 1.79-.85 2.75 0 .96.24 1.98.85 2.75.61.77 1.55 1.23 2.53 1.23.98 0 1.92-.46 2.53-1.23.61-.77.85-1.79.85-2.75V.02z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </svg>
      );
  }
}

export function Footer({ initialConfig, previewConfig, className = '', onClick }: FooterProps) {
  const { footerConfig } = useFooterConfig(previewConfig, initialConfig);
  const cfg = previewConfig || footerConfig || initialConfig || defaultFooterConfig;

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  const containerClass = WIDTH_CLASS_MAP[cfg.containerWidth || 'boxed'] || WIDTH_CLASS_MAP.boxed;
  const borderWidthClass = BORDER_WIDTH_MAP[cfg.borderTopWidth || 'thin'] || BORDER_WIDTH_MAP.thin;
  const borderStyleClass = BORDER_STYLE_MAP[cfg.borderStyle || 'solid'] || BORDER_STYLE_MAP.solid;

  const footerStyles: React.CSSProperties = {
    backgroundColor: cfg.backgroundColor || '#000000',
    color: cfg.textColor || '#ffffff',
    borderColor: cfg.borderColor || '#171717',
  };

  const mutedColorStyle: React.CSSProperties = {
    color: cfg.mutedTextColor || '#a3a3a3',
  };

  const borderDividerStyle: React.CSSProperties = {
    borderColor: cfg.borderColor || '#171717',
  };

  return (
    <footer
      onClick={onClick}
      style={footerStyles}
      className={`w-full ${borderWidthClass} ${borderStyleClass} mt-auto select-none font-sans transition-colors duration-200 ${className}`}
    >
      <div className={`${containerClass} pt-16 pb-12`}>
        {/* Top Block: Brand Info + Dynamic Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-14">
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {cfg.logoType === 'image' && cfg.logoImageUrl ? (
              <div className="relative h-12 max-w-[200px] flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cfg.logoImageUrl}
                  alt={cfg.brandName || 'Brand Logo'}
                  className="max-h-full object-contain"
                />
              </div>
            ) : (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-heading">
                {cfg.brandName || 'LEXIDO'}
              </h2>
            )}

            {cfg.brandTagline && (
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 font-heading">
                {cfg.brandTagline}
              </span>
            )}

            <p style={mutedColorStyle} className="text-xs sm:text-sm max-w-sm leading-relaxed font-light">
              {cfg.brandDescription ||
                'Crafted for those who move different. Premium streetwear made in India, designed for the world.'}
            </p>
          </div>

          {/* Navigation Columns Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {cfg.columns && cfg.columns.length > 0
              ? cfg.columns.map((col) => (
                  <div key={col.id} className="flex flex-col gap-3">
                    <h4
                      style={mutedColorStyle}
                      className="text-xs font-bold uppercase tracking-widest font-heading"
                    >
                      {col.title}
                    </h4>
                    <ul className="flex flex-col gap-2 text-sm opacity-90">
                      {col.links && col.links.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.url || '#'}
                            target={link.openInNewTab ? '_blank' : undefined}
                            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="hover:opacity-100 hover:underline transition-opacity"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              : null}

            {/* Reach Us / Contact Column */}
            {(cfg.contactEmail || cfg.contactTitle) && (
              <div className="flex flex-col gap-3">
                <h4
                  style={mutedColorStyle}
                  className="text-xs font-bold uppercase tracking-widest font-heading"
                >
                  {cfg.contactTitle || 'REACH US'}
                </h4>
                <div className="flex flex-col gap-2 text-sm opacity-90">
                  {cfg.contactEmail && (
                    <a
                      href={`mailto:${cfg.contactEmail}`}
                      className="hover:opacity-100 hover:underline transition-opacity break-all"
                    >
                      {cfg.contactEmail}
                    </a>
                  )}
                  {cfg.contactPhone && (
                    <a
                      href={`tel:${cfg.contactPhone}`}
                      className="text-xs hover:opacity-100 transition-opacity"
                    >
                      {cfg.contactPhone}
                    </a>
                  )}
                  {cfg.contactHours && (
                    <span style={mutedColorStyle} className="text-xs leading-relaxed">
                      {cfg.contactHours}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr style={borderDividerStyle} className="border-t" />

        {/* Middle Block: Newsletter (Left) & Social Channels (Right) */}
        {(cfg.showNewsletter || cfg.showSocialLinks) && (
          <div className="py-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Newsletter Box */}
            {cfg.showNewsletter && (
              <div className="flex flex-col gap-3">
                <h5
                  style={mutedColorStyle}
                  className="text-[11px] font-bold tracking-[0.2em] uppercase font-heading"
                >
                  {cfg.newsletterHeading || 'BECOME PART OF LEXIDO'}
                </h5>

                {cfg.newsletterDescription && (
                  <p style={mutedColorStyle} className="text-xs max-w-md font-light">
                    {cfg.newsletterDescription}
                  </p>
                )}

                {isSubscribed ? (
                  <div className="text-xs font-semibold tracking-wider text-emerald-400 py-2">
                    {cfg.newsletterSuccessMessage || '✓ THANK YOU FOR SUBSCRIBING.'}
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    suppressHydrationWarning
                    className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 w-full"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={cfg.newsletterPlaceholder || 'your@email.com'}
                      suppressHydrationWarning
                      style={{
                        borderColor: cfg.borderColor || '#333333',
                        color: cfg.textColor || '#ffffff',
                      }}
                      className="bg-transparent border-b py-1.5 text-xs sm:text-sm placeholder:opacity-50 focus:outline-none transition-colors w-full sm:w-80"
                    />
                    <button
                      type="submit"
                      suppressHydrationWarning
                      className="text-xs font-bold tracking-widest uppercase hover:opacity-80 transition-opacity inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>{cfg.newsletterButtonText || 'SUBSCRIBE'}</span>
                      <span>&rarr;</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Social Channels */}
            {cfg.showSocialLinks && cfg.socialLinks && (
              <div className="flex flex-col gap-3 md:items-end">
                <h5
                  style={mutedColorStyle}
                  className="text-[11px] font-bold tracking-[0.2em] uppercase font-heading"
                >
                  {cfg.socialHeading || 'FOLLOW'}
                </h5>
                <div className="flex items-center gap-2 flex-wrap">
                  {cfg.socialLinks
                    .filter((s) => s.enabled)
                    .map((s) => (
                      <a
                        key={s.id || s.label}
                        href={s.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        style={{
                          borderColor: cfg.borderColor || '#262626',
                        }}
                        className="w-9 h-9 border flex items-center justify-center opacity-80 hover:opacity-100 hover:border-white transition-all cursor-pointer"
                      >
                        {getSocialSvg(s.platform)}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <hr style={borderDividerStyle} className="border-t" />

        {/* Bottom Block: Copyright (Left) & Community Tagline (Right) */}
        <div
          style={mutedColorStyle}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono"
        >
          <div>{cfg.copyrightText || '© 2026 LEXIDO. All rights reserved. Made in India.'}</div>
          {cfg.taglineText && (
            <div className="tracking-widest uppercase text-[11px]">
              {cfg.taglineText}{' '}
              {cfg.taglineHighlight && (
                <span style={{ color: cfg.textColor || '#ffffff' }} className="font-bold">
                  {cfg.taglineHighlight}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
