import type { Metadata, Viewport } from 'next'

import { cn } from 'src/utilities/cn'
import { Poppins } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { Header } from '@/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { MetaPixel } from '@/components/MetaPixel'
import { Providers } from '@/providers'
import { SiteChrome } from '@/components/SiteChrome'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

// Winning Trimming brand font: Poppins (body 300, headings 500). Reuses the
// --font-geist-sans CSS variable so Tailwind's fontFamily.sans + the typography
// plugin pick it up without further config changes.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-geist-sans',
  display: 'swap',
})

// LocalBusiness structured data for local SEO (Google rich results, AI assistants).
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${getServerSideURL()}/#localbusiness`,
  name: 'Winning Trimming',
  description:
    'Marine, automotive, caravan & RV, trade and commercial trimming, upholstery and covers. ' +
    'Custom-made and repaired to last. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  url: getServerSideURL(),
  telephone: '+611300799882',
  image: `${getServerSideURL()}/winning-trimming-hero.webp`,
  logo: `${getServerSideURL()}/winning-trimming-hero.webp`,
  priceRange: '$$',
  currenciesAccepted: 'AUD',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop 2, 25 Sara Street',
    addressLocality: 'Toronto',
    addressRegion: 'NSW',
    postalCode: '2283',
    addressCountry: 'AU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -33.0000,
    longitude: 151.5500,
  },
  hasMap: 'https://www.google.com/maps/place/?q=place_id:ChIJu9-FNIklc2sRSxk7hnFqEJE',
  areaServed: [
    { '@type': 'Place', name: 'Lake Macquarie' },
    { '@type': 'Place', name: 'Newcastle' },
    { '@type': 'Place', name: 'Hunter Valley' },
    { '@type': 'Place', name: 'Central Coast' },
  ],
  parentOrganization: {
    '@type': 'Organization',
    name: 'Smith & Gray Pty Ltd',
    legalName: 'Smith & Gray Pty Ltd',
    taxID: '92 655 426 707',
  },
  sameAs: [
    'https://www.google.com/maps/place/?q=place_id:ChIJu9-FNIklc2sRSxk7hnFqEJE',
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '15:00',
    },
  ],
  // Saturday by appointment — not fixed hours, so not in openingHoursSpecification
  // but noted in the description above.
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(poppins.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <LivePreviewListener />

          <MetaPixel />
          <GoogleAnalytics />

          {/* Full header/footer everywhere except the ad landing page (/fb-quote) */}
          <SiteChrome header={<Header />} footer={<Footer />}>
            {children}
          </SiteChrome>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  themeColor: '#108DAF',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'Winning Trimming | Marine, Recreational & Trade Upholstery',
    template: '%s',
  },
  description:
    'Marine, recreational and trade trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  keywords: [
    'marine upholstery',
    'boat covers',
    'trimming',
    'bimini tops',
    'caravan upholstery',
    'tonneau covers',
    'Lake Macquarie',
    'Newcastle',
    'Hunter Valley',
    'Central Coast',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    title: 'Winning Trimming | Marine, Recreational & Trade Upholstery',
    description:
      'Where quality meets craftsmanship and customer service shines. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  },
}
