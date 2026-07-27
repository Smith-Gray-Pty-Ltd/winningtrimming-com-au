'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

// Info links shown in the utility strip on desktop and inside the mobile drawer.
const INFO_LINKS = [
  { href: '/our-work', label: 'Our Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const HeaderNav: React.FC<{ header: HeaderType }> = ({ header }) => {
  const navItems = header?.navItems || []
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [])

  return (
    <>
      {/* Desktop service-pillar nav */}
      <nav className="hidden lg:flex items-center gap-5 text-sm">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-current"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-background text-foreground shadow-lg border-t border-border">
          <nav className="container flex flex-col py-4">
            <Link
              href="/contact"
              className="min-h-[48px] mb-2 flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Request a Quote
            </Link>
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  key={i}
                  {...link}
                  className="min-h-[48px] flex items-center py-3 border-b border-border/60 text-base"
                />
              )
            })}
            <div className="mt-2 pt-2">
              {INFO_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="min-h-[48px] flex items-center py-3 text-base text-muted-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <a
                href="tel:1300799882"
                className="min-h-[48px] flex items-center py-3 text-base text-muted-foreground"
              >
                Call 1300 799 882
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
