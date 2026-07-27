'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ header: HeaderType }> = ({ header }) => {
  const navItems = header?.navItems || []
  const [open, setOpen] = useState(false)

  // Close the mobile menu on route changes (viewport nav back button etc.)
  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-6 items-center">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
        <Link href="/search" className="inline-flex" aria-label="Search">
          <Search className="w-5 h-5 text-primary" />
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-current"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-background text-foreground shadow-lg border-t border-border">
          <nav className="container flex flex-col py-4">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  key={i}
                  {...link}
                  className="min-h-[48px] flex items-center py-3 border-b border-border/60 last:border-0 text-base"
                />
              )
            })}
            <Link
              href="/search"
              className="min-h-[48px] flex items-center gap-2 py-3 text-base"
              onClick={() => setOpen(false)}
            >
              <Search className="w-5 h-5 text-primary" /> Search
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
