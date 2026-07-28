import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AssetType, Business, Region, ServiceType, Suburb } from '@/payload-types'
import { pillarLabel, pillarValues } from '@/fields/pillars'

export type { AssetType, Business, Region, ServiceType, Suburb }

export type MatrixDepth = 1 | 2 | 3

export type MatrixData = {
  pillar: string
  pillarLabel: string
  assetType: AssetType
  productType: ServiceType | null
  suburb: Suburb | null
  region: Region | null
  depth: MatrixDepth
  siblingAssets: AssetType[]
  nearbySuburbs: Suburb[]
}

// -- URL helpers ----------------------------------------------------------

export const matrixUrl = (
  pillar: string,
  assetSlug: string,
  productSlug?: string,
  suburbSlug?: string,
) => {
  let url = `/${pillar}/${assetSlug}`
  if (productSlug) url += `/${productSlug}`
  if (suburbSlug) url += `/${suburbSlug}`
  return url
}

// -- Text helpers ---------------------------------------------------------

export const singularOf = (asset: AssetType): string =>
  asset.singular ||
  (asset.title.endsWith('s') && !asset.title.endsWith('ss')
    ? asset.title.slice(0, -1)
    : asset.title)

/**
 * Human-readable H1 for the current matrix depth.
 */
export const matrixH1 = (data: MatrixData): string => {
  const vessel = singularOf(data.assetType)
  if (data.depth === 1) {
    return `${vessel} Trimming, Upholstery & Covers`
  }
  if (data.depth === 2 && data.productType) {
    return `${vessel} ${data.productType.title}`
  }
  // depth 3
  const loc = data.region ? `${data.suburb?.title}, ${data.region.title}` : data.suburb?.title
  return `${vessel} ${data.productType?.title} in ${loc}`
}

/**
 * Meta description assembled from the available dimensions.
 */
export const matrixDescription = (data: MatrixData): string => {
  const parts: string[] = []
  const vessel = singularOf(data.assetType)
  if (data.productType) {
    parts.push(`${vessel} ${data.productType.title.toLowerCase()}`)
  } else {
    parts.push(`${vessel} trimming, upholstery and covers`)
  }
  if (data.suburb && data.region) {
    parts.push(`in ${data.suburb.title}, ${data.region.title}`)
  }
  parts.push('by Winning Trimming. Custom-made and repaired to last.')
  return parts.join(' ')
}

// -- Data resolution ------------------------------------------------------

export const isValidPillar = (slug: string): boolean =>
  (pillarValues as readonly string[]).includes(slug)

/**
 * Resolve a matrix URL's segments against the taxonomy collections.
 * Returns null (→ 404) if any segment is invalid or the combination is not
 * allowed (e.g. a product not in the asset's applicableProducts).
 */
export async function resolveMatrix(
  pillar: string,
  segments: string[],
): Promise<MatrixData | null> {
  if (!isValidPillar(pillar) || segments.length < 1 || segments.length > 3) {
    return null
  }

  const payload = await getPayload({ config: configPromise })

  // 1. Asset type
  const assetRes = await payload.find({
    collection: 'asset-types',
    where: {
      and: [{ slug: { equals: segments[0] } }, { pillar: { equals: pillar } }],
    },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })
  const assetType = assetRes.docs?.[0] as AssetType | undefined
  if (!assetType) return null

  // 2. Product type (optional)
  let productType: ServiceType | null = null
  if (segments[1]) {
    const prodRes = await payload.find({
      collection: 'service-types',
      where: {
        and: [{ slug: { equals: segments[1] } }, { pillar: { equals: pillar } }],
      },
      depth: 1,
      limit: 1,
      overrideAccess: false,
    })
    productType = (prodRes.docs?.[0] as ServiceType | undefined) ?? null
    if (!productType) return null

    // Must be in the asset's applicableProducts
    const allowed = (assetType.applicableProducts ?? [])
      .filter((p): p is ServiceType => typeof p === 'object' && p !== null)
      .map((p) => p.slug)
    if (!allowed.includes(productType.slug)) return null
  }

  // 3. Suburb (optional — only valid at depth 3, i.e. product must be set)
  let suburb: Suburb | null = null
  let region: Region | null = null
  if (segments[2]) {
    if (!productType) return null // suburb without product is invalid
    const subRes = await payload.find({
      collection: 'suburbs',
      where: { slug: { equals: segments[2] } },
      depth: 1,
      limit: 1,
      overrideAccess: false,
    })
    suburb = (subRes.docs?.[0] as Suburb | undefined) ?? null
    if (!suburb) return null
    region = (typeof suburb.region === 'object' ? suburb.region : null) as Region | null
  }

  const depth = (segments.length as MatrixDepth)

  // 4. Sibling asset types for internal links (depth 2 to populate applicableProducts)
  const sibRes = await payload.find({
    collection: 'asset-types',
    where: { pillar: { equals: pillar } },
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })
  const siblingAssets = (sibRes.docs as AssetType[]).filter((a) => a.id !== assetType.id)

  // 5. Nearby suburbs (same region) for suburb-level pages
  let nearbySuburbs: Suburb[] = []
  if (suburb && region) {
    const nearRes = await payload.find({
      collection: 'suburbs',
      where: { region: { equals: region.id } },
      depth: 0,
      limit: 50,
      overrideAccess: false,
      sort: 'title',
    })
    nearbySuburbs = (nearRes.docs as Suburb[]).filter((s) => s.id !== suburb!.id)
  }

  return {
    pillar,
    pillarLabel: pillarLabel(pillar),
    assetType,
    productType,
    suburb,
    region,
    depth,
    siblingAssets,
    nearbySuburbs,
  }
}

// -- Region page resolution ------------------------------------------------

export type RegionPageData = {
  pillar: string
  pillarLabel: string
  region: Region
  suburbs: Suburb[]
  businesses: Business[]
  assetTypes: AssetType[]
}

/**
 * Resolve a region landing page: /{pillar}/{region-slug}
 * Shows vessel types, suburbs and businesses for the pillar in that region.
 */
export async function resolveRegionPage(
  pillar: string,
  regionSlug: string,
): Promise<RegionPageData | null> {
  if (!isValidPillar(pillar)) return null

  const payload = await getPayload({ config: configPromise })

  const regionRes = await payload.find({
    collection: 'regions',
    where: { slug: { equals: regionSlug } },
    depth: 1,
    limit: 1,
    overrideAccess: false,
  })
  const region = regionRes.docs?.[0] as Region | undefined
  if (!region) return null

  // Check pillar relevance
  const pillars = (region.pillars ?? []) as string[]
  if (pillars.length > 0 && !pillars.includes(pillar)) return null

  const [suburbRes, bizRes, assetRes] = await Promise.all([
    payload.find({
      collection: 'suburbs',
      where: { region: { equals: region.id } },
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
    payload.find({
      collection: 'businesses',
      where: {
        and: [{ region: { equals: region.id } }, { pillar: { equals: pillar } }],
      },
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
    payload.find({
      collection: 'asset-types',
      where: { pillar: { equals: pillar } },
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
  ])

  return {
    pillar,
    pillarLabel: pillarLabel(pillar),
    region,
    suburbs: suburbRes.docs as Suburb[],
    businesses: bizRes.docs as Business[],
    assetTypes: assetRes.docs as AssetType[],
  }
}
