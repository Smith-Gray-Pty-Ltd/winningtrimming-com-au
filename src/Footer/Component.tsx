import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/Logo/Logo'

/**
 * Curated footer links — kept in code (not the Footer global) so they stay
 * in sync with actual routes.
 */
const FOOTER_LINKS = [
  { label: 'About Us', url: '/about' },
  { label: 'Our Work', url: '/our-work' },
  { label: 'Request a Quote', url: '/quote' },
  { label: 'Blog', url: '/posts' },
  { label: 'My Account', url: '/account' },
  { label: 'Privacy Policy', url: '/privacy-policy' },
]

const PHONE = '1300 799 882'
const PHONE_TEL = 'tel:1300799882'

export async function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        {/* Col 1 — Brand */}
        <div className="md:col-span-1">
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>
          <p className="mt-4 text-sm text-white/70">
            Winning Trimming is a trading name of Smith &amp; Gray Pty Ltd
            <br />
            ABN: 92 655 426 707
          </p>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Marine, automotive &amp; general trimming serving Lake Macquarie,
            Newcastle, Central Coast and Hunter Valley.
          </p>
        </div>

        {/* Col 2 — Visit & Contact (with phone CTA) */}
        <div className="text-sm">
          <h4 className="font-medium mb-3 text-white">Visit &amp; Contact</h4>
          <address className="not-italic text-white/70 leading-relaxed">
            Shop 2, 25 Sara Street,
            <br />
            Toronto, NSW 2283
          </address>
          <a
            className="mt-4 block text-white text-lg font-medium hover:text-white/80 transition-colors"
            href={PHONE_TEL}
          >
            {PHONE}
          </a>
          <p className="mt-3 text-xs text-white/50">
            Same-day quotes over the phone
          </p>
        </div>

        {/* Col 3 — Hours */}
        <div className="text-sm">
          <h4 className="font-medium mb-3 text-white">Hours</h4>
          <p className="text-white/70">Monday – Friday</p>
          <p className="text-white/90">7am – 3pm</p>
          <p className="mt-2 text-white/70">Saturday</p>
          <p className="text-white/90">By appointment</p>
          <p className="mt-2 text-white/70">Sunday</p>
          <p className="text-white/90">Closed</p>
        </div>

        {/* Col 4 — Quick Links */}
        <div className="text-sm">
          <h4 className="font-medium mb-3 text-white">Quick Links</h4>
          <nav className="flex flex-col gap-2">
            {FOOTER_LINKS.map(({ label, url }) => (
              <Link
                className="text-white/80 transition-colors hover:text-white"
                href={url}
                key={url}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
