'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

/**
 * Meta Pixel (facebook.com/business pixel) loader.
 *
 * Env-gated: nothing loads unless NEXT_PUBLIC_META_PIXEL_ID is set, so the
 * site is safe to deploy before the pixel exists — add the ID and it starts.
 *
 * Fires fbq PageView on every route change. Conversion events (Lead,
 * InitiateCheckout) are fired from the pages that own them (see /fb-quote).
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export function MetaPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firedRef = useRef<string>('')

  // Track PageView whenever the route changes
  useEffect(() => {
    if (!PIXEL_ID || typeof window === 'undefined' || typeof window.fbq !== 'function') {
      return
    }
    const key = pathname + '?' + searchParams.toString()
    if (firedRef.current === key) return
    firedRef.current = key
    window.fbq?.('track', 'PageView')
  }, [pathname, searchParams])

  if (!PIXEL_ID) {
    return null
  }

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
