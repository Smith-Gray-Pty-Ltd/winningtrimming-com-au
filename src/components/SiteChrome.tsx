'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

/**
 * Route-aware site chrome.
 *
 * The full site header (nav) + footer are rendered on normal pages, but are
 * intentionally omitted on the Facebook ad landing page (/fb-quote): paid
 * clicks should submit the quote, not wander off to Our Work / About / Blog.
 * The quote form itself carries the trust elements (badges, privacy link).
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const minimal = pathname === '/fb-quote' || pathname?.startsWith('/fb-quote/')

  if (minimal) {
    return <>{children}</>
  }

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  )
}
