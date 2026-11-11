'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getStorefrontNavigationAction } from '@/app/actions/navigation-actions';

export interface MegamenuSubitem {
  label: string;
  href: string;
  columnNumber?: number;
}

export interface MegamenuCollection {
  id: string;
  name: string;
  href: string;
  subitems: MegamenuSubitem[];
  featured: {
    title: string;
    imageUrl: string;
    href: string;
    actionLabel?: string;
  };
}

export const FALLBACK_MEGAMENU_DATA: Record<string, MegamenuCollection[]> = {
  MEN: [
    {
      id: 'streetwear',
      name: 'STREETWEAR',
      href: '/products?category=streetwear',
      subitems: [
        { label: 'Oversized T-Shirts', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Graphic T-Shirts', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Oversized Hoodies', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Zip Hoodies', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Wide-Leg Jeans', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Utility Pants', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Denim Jackets', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Varsity Jackets', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Shorts', href: '/products?category=streetwear', columnNumber: 1 },
        { label: 'Heavyweight T-Shirts', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Long Sleeve T-Shirts', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Sweatshirts', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Baggy Jeans', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Cargo Pants', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Joggers', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Bomber Jackets', href: '/products?category=streetwear', columnNumber: 2 },
        { label: 'Overshirts', href: '/products?category=streetwear', columnNumber: 2 },
      ],
      featured: {
        title: 'STREETWEAR',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=streetwear',
        actionLabel: 'SHOP THE EDIT',
      },
    },
    {
      id: 'gymwear',
      name: 'GYM WEAR',
      href: '/products?category=gymwear',
      subitems: [
        { label: 'Signature Gym Set', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Surge Training Joggers', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Iron Stringer Tank', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Apex Dry-Fit Tee', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Drop Armhole Tanks', href: '/products?category=gymwear', columnNumber: 1 },
        { label: 'Velocity Compression Top', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Heavyweight Fleece Shorts', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Seamless Base Layers', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Lifting Straps & Wraps', href: '/products?category=gymwear', columnNumber: 2 },
        { label: 'Performance Zip Jackets', href: '/products?category=gymwear', columnNumber: 2 },
      ],
      featured: {
        title: 'GYM WEAR',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=gymwear',
        actionLabel: 'EXPLORE ATHLETICS',
      },
    },
    {
      id: 'oldmoney',
      name: 'OLD MONEY',
      href: '/products?category=old-money',
      subitems: [
        { label: 'Oxford Cotton Shirts', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Cashmere Crewnecks', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Cable Knit Sweaters', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'French Linen Trousers', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Double-Breasted Blazers', href: '/products?category=old-money', columnNumber: 1 },
        { label: 'Tailored Pleated Chinos', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Italian Suede Loafers', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Classic Trench Coats', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Mulberry Silk Ties', href: '/products?category=old-money', columnNumber: 2 },
        { label: 'Leather Driving Gloves', href: '/products?category=old-money', columnNumber: 2 },
      ],
      featured: {
        title: 'OLD MONEY',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=old-money',
        actionLabel: 'DISCOVER SARTORIAL',
      },
    },
    {
      id: 'casual',
      name: 'CASUAL',
      href: '/products?category=casual',
      subitems: [
        { label: 'Everyday Crewneck Tees', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Pique Polo Shirts', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Washed Denim Overshirts', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Waffle Long Sleeve Tops', href: '/products?category=casual', columnNumber: 1 },
        { label: 'Relaxed Fit Chinos', href: '/products?category=casual', columnNumber: 2 },
        { label: 'Straight Leg Denim Jeans', href: '/products?category=casual', columnNumber: 2 },
        { label: 'Casual Field Jackets', href: '/products?category=casual', columnNumber: 2 },
        { label: 'Minimalist Canvas Sneakers', href: '/products?category=casual', columnNumber: 2 },
      ],
      featured: {
        title: 'CASUAL',
        imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=casual',
        actionLabel: 'EXPLORE DAILY',
      },
    },
    {
      id: 'formal',
      name: 'FORMAL',
      href: '/products?category=formal',
      subitems: [
        { label: 'Structured Two-Piece Suits', href: '/products?category=formal', columnNumber: 1 },
        { label: 'French Cuff Dress Shirts', href: '/products?category=formal', columnNumber: 1 },
        { label: 'Sartorial Tuxedo Jackets', href: '/products?category=formal', columnNumber: 1 },
        { label: 'Slim Fit Tuxedo Trousers', href: '/products?category=formal', columnNumber: 1 },
        { label: 'Pure Wool Dress Trousers', href: '/products?category=formal', columnNumber: 2 },
        { label: 'Handcrafted Oxford Shoes', href: '/products?category=formal', columnNumber: 2 },
        { label: 'Silk Bow Ties & Cummerbunds', href: '/products?category=formal', columnNumber: 2 },
        { label: 'Engraved Silver Cufflinks', href: '/products?category=formal', columnNumber: 2 },
      ],
      featured: {
        title: 'FORMAL',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=formal',
        actionLabel: 'SHOP TAILORING',
      },
    },
    {
      id: 'winter',
      name: 'WINTER COLLECTION',
      href: '/products?category=winter',
      subitems: [
        { label: 'Heavy Down Puffer Jackets', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Cashmere Wool Overcoats', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Thermal Merino Base Layers', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Sherpa-Lined Corduroy Jackets', href: '/products?category=winter', columnNumber: 1 },
        { label: 'Fleece Lined Joggers', href: '/products?category=winter', columnNumber: 2 },
        { label: 'Ribbed Cashmere Beanies', href: '/products?category=winter', columnNumber: 2 },
        { label: 'Heavyweight Wool Scarves', href: '/products?category=winter', columnNumber: 2 },
        { label: 'Insulated Arctic Parkas', href: '/products?category=winter', columnNumber: 2 },
      ],
      featured: {
        title: 'WINTER COLLECTION',
        imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=winter',
        actionLabel: 'EXPLORE WINTER',
      },
    },
    {
      id: 'accessories',
      name: "MEN'S ACCESSORIES",
      href: '/products?category=accessories',
      subitems: [
        { label: 'Full-Grain Leather Duffle Bags', href: '/products?category=accessories', columnNumber: 1 },
        { label: 'Minimalist Automatic Watches', href: '/products?category=accessories', columnNumber: 1 },
        { label: '925 Sterling Silver Chains', href: '/products?category=accessories', columnNumber: 1 },
        { label: 'Polarized Aviator Sunglasses', href: '/products?category=accessories', columnNumber: 1 },
        { label: 'Structured Wool Snapbacks', href: '/products?category=accessories', columnNumber: 2 },
        { label: 'Full Grain Italian Belts', href: '/products?category=accessories', columnNumber: 2 },
        { label: 'RFID Blocking Cardholders', href: '/products?category=accessories', columnNumber: 2 },
        { label: 'Atelier Leather Wallets', href: '/products?category=accessories', columnNumber: 2 },
      ],
      featured: {
        title: "MEN'S ACCESSORIES",
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        href: '/products?category=accessories',
        actionLabel: 'SHOP ACCESSORIES',
      },
    },
  ],
};

interface MegamenuPanelProps {
  category: string;
  onClose: () => void;
}

export function MegamenuPanel({ category, onClose }: MegamenuPanelProps) {
  const fallback = FALLBACK_MEGAMENU_DATA[category.toUpperCase()] || FALLBACK_MEGAMENU_DATA.MEN;
  const [collections, setCollections] = useState<MegamenuCollection[]>(fallback);
  const [activeCollectionId, setActiveCollectionId] = useState<string>(fallback[0]?.id || '');

  useEffect(() => {
    let isMounted = true;
    async function loadDbNavigation() {
      try {
        const dbNav = await getStorefrontNavigationAction(category);
        if (isMounted && dbNav && dbNav.length > 0) {
          setCollections(dbNav as MegamenuCollection[]);
          setActiveCollectionId(dbNav[0].id);
        }
      } catch (err) {
        console.warn('Failed to load navigation from DB, using fallback:', err);
      }
    }
    loadDbNavigation();
    return () => {
      isMounted = false;
    };
  }, [category]);

  const activeCollection =
    collections.find((c) => c.id === activeCollectionId) || collections[0];

  const col1Items = activeCollection?.subitems?.filter((s) => s.columnNumber === 1) || [];
  const col2Items = activeCollection?.subitems?.filter((s) => s.columnNumber === 2) || [];
  const hasSplitColumns = col1Items.length > 0 && col2Items.length > 0;

  return (
    <div className="w-full bg-white text-slate-900 shadow-2xl border-b border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-14 py-8 grid grid-cols-12 gap-8 min-h-[460px]">
        {/* Left Column: Vertical Category List */}
        <div className="col-span-3 flex flex-col space-y-4 pr-6 border-r border-slate-100">
          {collections.map((col) => {
            const isActive = col.id === activeCollection?.id;
            return (
              <button
                key={col.id}
                onMouseEnter={() => setActiveCollectionId(col.id)}
                onClick={() => setActiveCollectionId(col.id)}
                className={`text-left text-lg lg:text-xl tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'font-black text-slate-950 border-l-2 border-slate-950 pl-3 uppercase'
                    : 'font-semibold text-slate-400 hover:text-slate-800 pl-0 uppercase'
                }`}
              >
                {col.name}
              </button>
            );
          })}
        </div>

        {/* Middle Column: 2-Column Subitem Grid */}
        <div className="col-span-5 px-6">
          <p className="text-[11px] font-extrabold tracking-[0.25em] text-slate-400 uppercase mb-6">
            {activeCollection?.name}
          </p>

          {hasSplitColumns ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
              <div className="flex flex-col space-y-3">
                {col1Items.map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-950 hover:underline transition-colors line-clamp-1 block"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col space-y-3">
                {col2Items.map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-950 hover:underline transition-colors line-clamp-1 block"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              {(activeCollection?.subitems || []).map((sub, idx) => (
                <Link
                  key={idx}
                  href={sub.href}
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950 hover:underline transition-colors line-clamp-1 block"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Featured Editorial Promotional Card */}
        <div className="col-span-4 pl-4">
          {activeCollection?.featured && (
            <Link
              href={activeCollection.featured.href}
              onClick={onClose}
              className="group relative block w-full h-[390px] rounded-xl overflow-hidden shadow-xl border border-slate-200/80"
            >
              <Image
                src={activeCollection.featured.imageUrl}
                alt={activeCollection.featured.title}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1200px) 35vw, 28vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-300 uppercase mb-1">
                  DISCOVER
                </span>
                <h4 className="text-2xl lg:text-3xl font-black font-heading uppercase tracking-tight text-white mb-2 leading-none">
                  {activeCollection.featured.title}
                </h4>
                <div className="flex items-center text-xs font-bold text-white group-hover:translate-x-1.5 transition-transform">
                  {activeCollection.featured.actionLabel || 'SHOP THE EDIT'}{' '}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default MegamenuPanel;
