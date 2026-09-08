'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

/**
 * Google Analytics 4 (gtag.js) loader.
 *
 * Env-gated: nothing loads unless NEXT_PUBLIC_GA_ID is set (G-XXXXXXXXXX),
 * so the site is safe to deploy before the property exists.
 *
 * Fires a page_view on every route change (SPA-safe).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firedRef = useRef<string>('')

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return
    }
    const key = pathname + '?' + searchParams.toString()
    if (firedRef.current === key) return
    firedRef.current = key
    window.gtag?.('event', 'page_view', {
      page_path: pathname + searchParams.toString(),
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  if (!GA_ID) {
    return null
  }

  return (
    <>
      <Script id="ga4-base" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
