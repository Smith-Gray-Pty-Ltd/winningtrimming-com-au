import type { Metadata, Viewport } from 'next'

import { cn } from 'src/utilities/cn'
import { Poppins } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
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

// LocalBusiness structured data for local SEO (Google rich results).
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoWasher', // closest generic LocalBusiness type for this trade
  name: 'Winning Trimming',
  description:
    'Marine, recreational and trade trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  url: getServerSideURL(),
  telephone: '+61 1300 799 882',
  image: `${getServerSideURL()}/winning-trimming-hero.webp`,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop 2, 25 Sara Street',
    addressLocality: 'Toronto',
    addressRegion: 'NSW',
    postalCode: '2280',
    addressCountry: 'AU',
  },
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
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '16:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '12:00',
    },
  ],
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

          <Header />
          {children}
          <Footer />
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
    template: '%s | Winning Trimming',
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
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    title: 'Winning Trimming | Marine, Recreational & Trade Upholstery',
    description:
      'Where quality meets craftsmanship and customer service shines. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  },
}
