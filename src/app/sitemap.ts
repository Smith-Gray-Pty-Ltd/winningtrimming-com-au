import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const host = getServerSideURL()

  const [pages, posts, assets, suburbs, regions, serviceTypes] = await Promise.all([
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
    payload.find({
      collection: 'regions',
      depth: 0,
      limit: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'service-types',
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

  // Region landing pages: /{pillar}/{region-slug}
  const allPillars = ['marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial']
  for (const region of regions.docs) {
    if (!region.slug) continue
    const pillars = (region.pillars ?? []).length > 0 ? (region.pillars as string[]) : allPillars
    for (const pillar of pillars) {
      matrixEntries.push({
        url: `${host}/${pillar}/${region.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }
  }

  // Pillar-level product pages: /{pillar}/{product} and /{pillar}/{product}/{suburb}
  for (const st of serviceTypes.docs) {
    if (!st.slug || !st.pillar) continue
    matrixEntries.push({
      url: `${host}/${st.pillar}/${st.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
    for (const suburb of suburbs.docs) {
      if (suburb.slug) {
        matrixEntries.push({
          url: `${host}/${st.pillar}/${st.slug}/${suburb.slug}`,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        })
      }
    }
  }

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
