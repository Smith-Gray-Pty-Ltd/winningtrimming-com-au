'use client'
import Link from 'next/link'
import React from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  header: Header
}

// Solid white sticky header bar — matches the Squarespace source (full-width
// light header, dark text, hero sits below rather than behind it).
export const HeaderClient: React.FC<HeaderClientProps> = ({ header }) => {
  return (
    <header className="bg-background text-foreground border-b border-border sticky top-0 z-30">
      <div className="container py-3 md:py-4 flex justify-between items-center gap-4">
        <Link href="/" className="shrink-0">
          <Logo loading="eager" priority="high" />
        </Link>
        <HeaderNav header={header} />
      </div>
    </header>
  )
}
