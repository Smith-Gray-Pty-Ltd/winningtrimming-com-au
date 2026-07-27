import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'en_AU',
  description:
    'Marine, recreational and trade trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
  images: [
    {
      url: `${getServerSideURL()}/winning-trimming-hero.webp`,
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
