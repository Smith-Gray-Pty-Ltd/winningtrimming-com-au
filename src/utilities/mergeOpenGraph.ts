import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

/**
 * Cache-bust query param appended to the default OG image URL so social
 * scrapers (Facebook, X, LinkedIn) re-fetch the image instead of serving a
 * stale cached copy. Increment when the default image changes.
 */
const OG_CACHE_BUST = 'v2'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'en_AU',
  description:
    'Marine, recreational and trade trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  images: [
    {
      url: `${getServerSideURL()}/winning-trimming-hero.webp?cb=${OG_CACHE_BUST}`,
      width: 1200,
      height: 630,
      alt: 'Winning Trimming — marine upholstery and covers',
    },
  ],
  siteName: 'Winning Trimming',
  title: 'Winning Trimming | Marine, Recreational & Trade Upholstery',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
