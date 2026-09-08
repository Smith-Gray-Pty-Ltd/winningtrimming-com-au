import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const host = getServerSideURL()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/media', '/next/'],
      },
      // Explicitly allow common AI crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/api/media', '/next/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/api/media', '/next/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin', '/api/media', '/next/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/api/media', '/next/'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  }
}
