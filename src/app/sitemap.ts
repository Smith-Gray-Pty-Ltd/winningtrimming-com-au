import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const host = getServerSideURL()

  const [pages, posts] = await Promise.all([
    payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      limit: 0,
      draft: false,
    }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit: 0,
      draft: false,
    }),
  ])

  const pageEntries: MetadataRoute.Sitemap = pages.docs
    .filter((p) => p.slug !== 'home')
    .map((p) => ({
      url: p.slug ? `${host}/${p.slug}` : host,
      lastModified: p.updatedAt ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: p.slug === 'home' ? 1 : 0.7,
    }))

  const postEntries: MetadataRoute.Sitemap = posts.docs.map((p) => ({
    url: p.slug ? `${host}/posts/${p.slug}` : host,
    lastModified: p.updatedAt ?? undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: `${host}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${host}/posts`, changeFrequency: 'weekly', priority: 0.6 },
    ...pageEntries,
    ...postEntries,
  ]
}
