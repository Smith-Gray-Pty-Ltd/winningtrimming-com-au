'use client'
import Link from 'next/link'
import React from 'react'

import type { Header } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  header: Header
}

// Two-tier sticky header:
//   • utility strip (brand teal): click-to-call phone + info links
//     (Our Work / About / Contact)
//   • main bar (white): logo + service-pillar nav + "Request a Quote"
export const HeaderClient: React.FC<HeaderClientProps> = ({ header }) => {
  return (
    <header className="sticky top-0 z-30">
      {/* Utility strip — phone + info links, all aligned right */}
      <div className="bg-accent text-white text-sm">
        <div className="container py-1.5 flex items-center justify-end gap-6">
          <nav className="hidden md:flex items-center gap-5">
            <Link href="/our-work" className="hover:underline">
              Our Work
            </Link>
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/quote" className="hover:underline">
              Request a Quote
            </Link>
          </nav>
          <a href="tel:1300799882" className="font-medium hover:underline">
            1300 799 882
          </a>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="bg-background text-foreground border-b border-border">
        <div className="container py-3 md:py-4 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label="Winning Trimming home">
            <Logo loading="eager" priority="high" />
          </Link>
          <div className="flex items-center gap-4">
            <HeaderNav header={header} />
            {/* Primary CTA — prominent on desktop, lives in the mobile drawer on small screens */}
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/quote">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
