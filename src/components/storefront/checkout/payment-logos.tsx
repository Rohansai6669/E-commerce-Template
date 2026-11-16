'use client';

import * as React from 'react';

export function RazorpayIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M3.5 20.8L12.2 3.8C12.6 3 13.6 2.8 14.3 3.4L18.2 6.5C18.9 7.1 18.7 8.2 17.8 8.6L9.6 11.5L16.8 14.8C17.7 15.2 17.9 16.3 17.3 17.1L14.5 20.3C13.9 21 12.9 20.9 12.4 20.1L3.5 20.8Z"
        fill="#0284C7"
      />
      <path
        d="M9.6 11.5L3.5 20.8L12.4 20.1C12.9 20.9 13.9 21 14.5 20.3L17.3 17.1C17.9 16.3 17.7 15.2 16.8 14.8L9.6 11.5Z"
        fill="#0369A1"
      />
    </svg>
  );
}

export function RazorpayWordmark({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <RazorpayIcon className="w-5 h-5" />
      <span className="font-extrabold text-sm tracking-tight text-foreground font-heading">
        Razorpay
      </span>
    </div>
  );
}

export function UpiLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 76 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Green Chevron */}
      <path d="M12.4 1.5L21.8 13L12.4 24.5H3.2L12.6 13L3.2 1.5H12.4Z" fill="#097939" />
      {/* Orange Chevron */}
      <path d="M24.8 1.5L34.2 13L24.8 24.5H15.6L25 13L15.6 1.5H24.8Z" fill="#ED7524" />
      {/* U */}
      <path
        d="M42 4.5V14.8C42 17.2 43.6 19 46.2 19C48.8 19 50.4 17.2 50.4 14.8V4.5H47.4V14.6C47.4 15.8 46.8 16.5 46.2 16.5C45.6 16.5 45 15.8 45 14.6V4.5H42Z"
        fill="currentColor"
      />
      {/* P */}
      <path
        d="M53.5 4.5V19H56.5V14.2H60.2C63 14.2 65.2 12.3 65.2 9.4C65.2 6.4 63 4.5 60.2 4.5H53.5ZM56.5 7H59.9C61.3 7 62.2 7.9 62.2 9.4C62.2 10.9 61.3 11.7 59.9 11.7H56.5V7Z"
        fill="currentColor"
      />
      {/* I */}
      <path d="M68.5 4.5V19H71.5V4.5H68.5Z" fill="currentColor" />
    </svg>
  );
}

export function GooglePayLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Multi-color Google G */}
      <path
        d="M10.8 11.2V9H18.2C18.3 9.5 18.4 10 18.4 10.6C18.4 12.8 17.8 15 16.2 16.6C14.7 18.2 12.7 19.1 10 19.1C5.1 19.1 1.2 15.1 1.2 10.2C1.2 5.3 5.1 1.3 10 1.3C12.6 1.3 14.5 2.3 15.8 3.6L14.2 5.2C13.2 4.2 11.8 3.5 10 3.5C6.3 3.5 3.3 6.5 3.3 10.2C3.3 13.9 6.3 16.9 10 16.9C12.2 16.9 13.5 16 14.3 15.2C15 14.5 15.5 13.3 15.7 11.7H10.8V11.2Z"
        fill="#4285F4"
      />
      {/* Pay text */}
      <path
        d="M23 4.9H27.1C29 4.9 30.6 5.5 31.6 6.6C32.6 7.6 33.1 9 33.1 10.6C33.1 12.2 32.6 13.5 31.6 14.6C30.6 15.7 29 16.3 27.1 16.3H25V20.9H23V4.9ZM27.1 14.4C28.4 14.4 29.5 14 30.2 13.3C30.9 12.6 31.3 11.7 31.3 10.6C31.3 9.5 30.9 8.6 30.2 7.9C29.5 7.2 28.4 6.8 27.1 6.8H25V14.4H27.1Z"
        fill="currentColor"
      />
      <path
        d="M37.2 9.6C38.4 9.6 39.4 9.9 40.1 10.5C40.8 11.1 41.2 12 41.2 13.2V19.1H39.4V17.7H39.3C38.6 18.8 37.5 19.4 36.3 19.4C35.1 19.4 34.2 19 33.5 18.4C32.8 17.8 32.4 17 32.4 16C32.4 14.9 32.8 14.1 33.6 13.6C34.4 13.1 35.4 12.8 36.6 12.8C37.7 12.8 38.6 13 39.3 13.4V13C39.3 12.4 39 11.8 38.5 11.4C38 11 37.4 10.7 36.6 10.7C35.6 10.7 34.8 11.1 34.2 12L32.8 10.9C33.7 10 35.2 9.6 37.2 9.6ZM34.3 16C34.3 16.5 34.5 17 34.9 17.3C35.4 17.6 35.9 17.7 36.5 17.7C37.3 17.7 38 17.4 38.6 16.8C39.1 16.3 39.4 15.6 39.4 14.9C38.8 14.4 38.1 14.2 37.1 14.2C36.3 14.2 35.6 14.4 35.1 14.7C34.6 15 34.3 15.5 34.3 16Z"
        fill="currentColor"
      />
      <path
        d="M50.8 9.9L45.3 22.8H43.3L45.4 18.5L41.7 9.9H43.8L46.3 16.1H46.4L48.8 9.9H50.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PhonePeLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* PhonePe Purple Circle */}
      <rect width="22" height="22" rx="11" fill="#5F259F" />
      <path
        d="M11.5 5H7.8V17H10.5V13.3H11.9C14.2 13.3 15.8 12.1 15.8 9.9C15.8 7.7 14.2 5 11.5 5ZM11.2 11H10.5V7.8H11.2C12.7 7.8 13.4 8.6 13.4 9.4C13.4 10.3 12.7 11 11.2 11Z"
        fill="white"
      />
      <path d="M9.9 11.5L14.8 17.5H17.8L12.6 11.5H9.9Z" fill="white" />
      <text
        x="26"
        y="15.5"
        fill="#5F259F"
        className="dark:fill-[#9d5cdb]"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="11"
        letterSpacing="-0.2"
      >
        PhonePe
      </text>
    </svg>
  );
}

export function PaytmLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text
        x="1"
        y="15"
        fill="#002E6E"
        className="dark:fill-[#4d86db]"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="14"
        letterSpacing="-0.5"
      >
        Pay
      </text>
      <text
        x="27"
        y="15"
        fill="#00BAF2"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="14"
        letterSpacing="-0.5"
      >
        tm
      </text>
    </svg>
  );
}

export function VisaLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M16.5 1L11 13.3H7.3L4.5 3.8C4.3 3.1 4.1 2.8 3.6 2.5C2.7 2.1 1.3 1.7 0 1.4L0.1 1H6.1C6.9 1 7.5 1.6 7.7 2.4L9.2 10.1L12.8 1H16.5ZM31 9.3C31 5.8 25.9 5.5 26 4C26 3.5 26.5 3 27.6 2.8C28.1 2.7 29.6 2.7 31.1 3.3L31.7 0.6C30.8 0.3 29.7 0 28.3 0C24.8 0 22.4 1.8 22.4 4.5C22.3 6.4 24.2 7.5 25.5 8.1C26.9 8.9 27.3 9.3 27.3 9.9C27.3 10.9 26.1 11.3 24.9 11.3C23.2 11.3 22.1 11 21 10.5L20.3 13.3C21.4 13.8 23.4 14.2 25.3 14.2C28.9 14.2 31 12.4 31 9.3ZM40 13.3H43.3L40.4 1H37.4C36.7 1 36.1 1.4 35.8 2.1L30.6 13.3H34.3L35.1 11.2H39.6L40 13.3ZM36.1 8.6L37.9 3.6L39.1 8.6H36.1ZM21.6 1L18.7 13.3H15.2L18.1 1H21.6Z"
        fill="#1A1F71"
        className="dark:fill-[#4d70ec]"
      />
    </svg>
  );
}

export function MastercardLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="10" cy="10" r="10" fill="#EB001B" />
      <circle cx="22" cy="10" r="10" fill="#F79E1B" />
      <path
        d="M16 3.2C17.6 4.8 18.6 7.3 18.6 10C18.6 12.7 17.6 15.2 16 16.8C14.4 15.2 13.4 12.7 13.4 10C13.4 7.3 14.4 4.8 16 3.2Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function RuPayLogo({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text
        x="0"
        y="12"
        fill="#092E6B"
        className="dark:fill-[#4d70ec]"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="12.5"
        fontStyle="italic"
        letterSpacing="-0.4"
      >
        RuPay
      </text>
      <path d="M43 2L47 7.5L43 13H46.5L50.5 7.5L46.5 2H43Z" fill="#F47820" />
      <path d="M46.5 2L50.5 7.5L46.5 13H50L54 7.5L50 2H46.5Z" fill="#00A5DF" />
    </svg>
  );
}

