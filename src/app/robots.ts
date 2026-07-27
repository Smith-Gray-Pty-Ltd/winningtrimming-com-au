import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const host = getServerSideURL()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/next/'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  }
}
