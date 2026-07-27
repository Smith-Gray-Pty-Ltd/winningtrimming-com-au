import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footer?.navItems || []

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>
          <p className="mt-4 text-sm text-white/70">
            Winning Trimming is a trading name of Smith &amp; Gray Pty Ltd
            <br />
            ABN: 92 655 426 707
          </p>
        </div>

        {/* Visit */}
        <div className="text-sm">
          <h4 className="font-medium mb-3 text-white">Visit</h4>
          <address className="not-italic text-white/70 leading-relaxed">
            Shop 2, 25 Sara Street,
            <br />
            Toronto, NSW 2280
          </address>
          <a className="mt-2 inline-block text-white/90 hover:text-white" href="tel:1300799882">
            1300 799 882
          </a>
        </div>

        {/* Hours */}
        <div className="text-sm">
          <h4 className="font-medium mb-3 text-white">Hours</h4>
          <p className="text-white/70">Monday – Friday</p>
          <p className="text-white/90">8am – 4pm</p>
          <p className="mt-2 text-white/70">Saturday</p>
          <p className="text-white/90">8am – Midday</p>
        </div>

        {/* Serving + nav */}
        <div className="text-sm">
          <h4 className="font-medium mb-3 text-white">Serving</h4>
          <p className="text-white/70 leading-relaxed">
            Lake Macquarie
            <br />
            Newcastle &amp; Hunter
            <br />
            Central Coast
          </p>
          {navItems.length > 0 && (
            <nav className="mt-4 flex flex-col gap-2">
              {navItems.map(({ link }, i) => {
                return <CMSLink className="text-white/90 hover:text-white" key={i} {...link} />
              })}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
