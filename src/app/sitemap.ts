import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const host = getServerSideURL()

  const [pages, posts, assets, suburbs] = await Promise.all([
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
    payload.find({
      collection: 'asset-types',
      depth: 2,
      limit: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'suburbs',
      depth: 0,
      limit: 0,
      overrideAccess: false,
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

  // SEO matrix entries: vessel → product → suburb
  const matrixEntries: MetadataRoute.Sitemap = []
  for (const asset of assets.docs) {
    if (!asset.slug || !asset.pillar) continue
    // Depth 1: vessel type
    matrixEntries.push({
      url: `${host}/${asset.pillar}/${asset.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
    const products = (asset.applicableProducts ?? []).filter(
      (p): p is NonNullable<typeof p> => typeof p === 'object' && p !== null && 'slug' in p,
    )
    for (const product of products) {
      // Depth 2: vessel + product
      matrixEntries.push({
        url: `${host}/${asset.pillar}/${asset.slug}/${product.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
      // Depth 3: + suburb
      for (const suburb of suburbs.docs) {
        if (suburb.slug) {
          matrixEntries.push({
            url: `${host}/${asset.pillar}/${asset.slug}/${product.slug}/${suburb.slug}`,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
          })
        }
      }
    }
  }

  return [
    { url: `${host}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${host}/posts`, changeFrequency: 'weekly', priority: 0.6 },
    ...pageEntries,
    ...postEntries,
    ...matrixEntries,
  ]
}
