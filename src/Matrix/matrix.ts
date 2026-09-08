import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AssetType, Business, Region, ServiceType, Suburb } from '@/payload-types'
import { pillarLabel, pillarOptions, pillarValues } from '@/fields/pillars'

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

// Pillar-level product page: /{pillar}/{product} or /{pillar}/{product}/{suburb}
export type PillarProductData = {
  pillar: string
  pillarLabel: string
  productType: ServiceType
  suburb: Suburb | null
  region: Region | null
  depth: 1 | 2
  applicableAssets: AssetType[]
  nearbySuburbs: Suburb[]
}

// Region + suburb page: /{pillar}/{region}/{suburb}
export type RegionSuburbData = {
  pillar: string
  pillarLabel: string
  region: Region
  suburb: Suburb
  assetTypes: AssetType[]
  nearbySuburbs: Suburb[]
}

// -- URL helpers ----------------------------------------------------------

export const matrixUrl = (
  pillar: string,
  assetSlug: string | null | undefined,
  productSlug?: string | null | undefined,
  suburbSlug?: string | null | undefined,
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
 * Map a service-type title to a broad work category for H1 generation.
 * Products are grouped so the H1 stays concise (e.g. "Covers & Canvas"
 * rather than listing every individual product).
 */
const productCategory = (title: string): string => {
  const t = title.toLowerCase()
  if (t.includes('cover')) return 'Covers'
  if (t.includes('enclosure') || t.includes('clear')) return 'Enclosures'
  if (t.includes('bimini') || t.includes('dodger') || t.includes('awning')) return 'Canvas'
  if (t.includes('sail')) return 'Sail Covers'
  if (t.includes('seat') || t.includes('sun bed')) return 'Seats'
  if (t.includes('cushion') || t.includes('mattress')) return 'Cushions'
  if (t.includes('panel') || t.includes('carpet') || t.includes('hull') || t.includes('lining') || t.includes('interior')) return 'Interior'
  if (t.includes('upholstery') || t.includes('trim')) return 'Upholstery'
  return ''
}

/**
 * Derive a concise work-category suffix from the asset type's applicable
 * products. e.g. if only weather/towing covers apply → "Covers"; if
 * covers + biminis + seats → "Covers, Canvas & Seats". Caps at 3 categories
 * to keep the H1 readable; falls back to "Trimming & Covers" when there's
 * a broad mix.
 */
const workSuffix = (applicableProducts: { title: string }[]): string => {
  const categories = new Set<string>()
  for (const p of applicableProducts) {
    const cat = productCategory(p.title)
    if (cat) categories.add(cat)
  }
  const list = [...categories]
  if (list.length === 0) return 'Trimming, Upholstery & Covers'
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]} & ${list[1]}`
  if (list.length === 3) return `${list[0]}, ${list[1]} & ${list[2]}`
  // 4+ categories — too long for an H1, use a sensible umbrella
  return 'Trimming & Covers'
}

/**
 * Human-readable H1 for the current matrix depth.
 */
export const matrixH1 = (data: MatrixData): string => {
  const vessel = singularOf(data.assetType)
  if (data.depth === 1) {
    const products = (data.assetType.applicableProducts ?? [])
      .filter((p): p is ServiceType => typeof p === 'object' && p !== null)
      .map((p) => ({ title: p.title }))
    return `${vessel} ${workSuffix(products)}`
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
    const products = (data.assetType.applicableProducts ?? [])
      .filter((p): p is ServiceType => typeof p === 'object' && p !== null)
      .map((p) => ({ title: p.title }))
    parts.push(`${vessel} ${workSuffix(products).toLowerCase()}`)
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

// -- Pillar-product page resolution ---------------------------------------

/**
 * Resolve a pillar-level product page: /{pillar}/{product-slug} or
 * /{pillar}/{product-slug}/{suburb-slug}
 *
 * Shows a product across ALL vessel types (not vessel-specific), e.g.
 * /marine/weather-covers or /marine/weather-cover-repairs/belmont.
 */
export async function resolvePillarProduct(
  pillar: string,
  segments: string[],
): Promise<PillarProductData | null> {
  if (!isValidPillar(pillar) || segments.length < 1 || segments.length > 2) {
    return null
  }

  const payload = await getPayload({ config: configPromise })

  // 1. Service type
  const prodRes = await payload.find({
    collection: 'service-types',
    where: {
      and: [{ slug: { equals: segments[0] } }, { pillar: { equals: pillar } }],
    },
    depth: 1,
    limit: 1,
    overrideAccess: false,
  })
  const productType = prodRes.docs?.[0] as ServiceType | undefined
  if (!productType) return null

  // 2. Suburb (optional)
  let suburb: Suburb | null = null
  let region: Region | null = null
  if (segments[1]) {
    const subRes = await payload.find({
      collection: 'suburbs',
      where: { slug: { equals: segments[1] } },
      depth: 1,
      limit: 1,
      overrideAccess: false,
    })
    suburb = (subRes.docs?.[0] as Suburb | undefined) ?? null
    if (!suburb) return null
    region = (typeof suburb.region === 'object' ? suburb.region : null) as Region | null
  }

  const depth = segments.length as 1 | 2

  // 3. Asset types that offer this product
  const assetRes = await payload.find({
    collection: 'asset-types',
    where: { pillar: { equals: pillar } },
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })
  const allAssets = assetRes.docs as AssetType[]
  const applicableAssets = allAssets.filter((a) =>
    (a.applicableProducts ?? [])
      .filter((p): p is ServiceType => typeof p === 'object' && p !== null)
      .some((p) => p.slug === productType.slug),
  )

  if (applicableAssets.length === 0) return null

  // 4. Nearby suburbs (same region) for suburb-level pages
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
    productType,
    suburb,
    region,
    depth,
    applicableAssets,
    nearbySuburbs,
  }
}

/** H1 for a pillar-product page */
export const pillarProductH1 = (data: PillarProductData): string => {
  const label = data.pillarLabel
  const product = data.productType.title
  if (data.depth === 2 && data.suburb && data.region) {
    return `${label} ${product} in ${data.suburb.title}, ${data.region.title}`
  }
  return `${label} ${product}`
}

/** Meta description for a pillar-product page */
export const pillarProductDescription = (data: PillarProductData): string => {
  const parts = [`${data.pillarLabel.toLowerCase()} ${data.productType.title.toLowerCase()}`]
  if (data.suburb && data.region) {
    parts.push(`in ${data.suburb.title}, ${data.region.title}`)
  }
  parts.push('by Winning Trimming. Custom-made and repaired to last.')
  return parts.join(' ')
}

/**
 * Resolve a region + suburb page: /{pillar}/{region-slug}/{suburb-slug}
 * Shows the pillar's asset types and service types available in that suburb.
 */
export async function resolveRegionSuburbPage(
  pillar: string,
  regionSlug: string,
  suburbSlug: string,
): Promise<RegionSuburbData | null> {
  if (!isValidPillar(pillar)) return null

  const payload = await getPayload({ config: configPromise })

  // 1. Region
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

  // 2. Suburb (must be in this region)
  const suburbRes = await payload.find({
    collection: 'suburbs',
    where: {
      and: [
        { slug: { equals: suburbSlug } },
        { region: { equals: region.id } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: false,
  })
  const suburb = suburbRes.docs?.[0] as Suburb | undefined
  if (!suburb) return null

  // 3. Asset types for this pillar
  const assetRes = await payload.find({
    collection: 'asset-types',
    where: { pillar: { equals: pillar } },
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })

  // 4. Nearby suburbs (same region, excluding current)
  const nearRes = await payload.find({
    collection: 'suburbs',
    where: { region: { equals: region.id } },
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: 'title',
  })
  const nearbySuburbs = (nearRes.docs as Suburb[]).filter((s) => s.id !== suburb.id)

  return {
    pillar,
    pillarLabel: pillarLabel(pillar),
    region,
    suburb,
    assetTypes: assetRes.docs as AssetType[],
    nearbySuburbs,
  }
}

/** H1 for a region-suburb page */
export const regionSuburbH1 = (data: RegionSuburbData): string =>
  `${data.pillarLabel} Trimming in ${data.suburb.title}, ${data.region.title}`

/** Meta description for a region-suburb page */
export const regionSuburbDescription = (data: RegionSuburbData): string =>
  `${data.pillarLabel.toLowerCase()} trimming, covers and upholstery in ${data.suburb.title}, ${data.region.title}. Custom-made and repaired to last. Serving the ${data.region.title} area.`

// -- All-pillar region/suburb pages ---------------------------------------

export type AllPillarRegionData = {
  region: Region
  suburbs: Suburb[]
  pillars: { slug: string; label: string }[]
}

export type AllPillarSuburbData = {
  region: Region
  suburb: Suburb
  nearbySuburbs: Suburb[]
  pillars: { slug: string; label: string }[]
}

/**
 * Resolve an all-pillar region landing page: /{region-slug}
 * Shows all service pillars available in that region.
 * Only returns regions that serve all pillars (not marine-only regions).
 */
export async function resolveAllPillarRegion(
  regionSlug: string,
): Promise<AllPillarRegionData | null> {
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

  // Only show all-pillar pages for regions that serve all pillars.
  // Marine-only regions (Sydney Harbour, Middle Harbour, etc.) redirect to /marine/{region}.
  const regionPillars = (region.pillars ?? []) as string[]
  if (regionPillars.length > 0 && !regionPillars.includes('automotive')) return null

  const suburbRes = await payload.find({
    collection: 'suburbs',
    where: { region: { equals: region.id } },
    depth: 0,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })

  return {
    region,
    suburbs: suburbRes.docs as Suburb[],
    pillars: pillarOptions.map((p) => ({ slug: p.value, label: p.label })),
  }
}

/**
 * Resolve an all-pillar suburb page: /{region-slug}/{suburb-slug}
 * Shows all service pillars available in that specific suburb.
 * Only returns for regions that serve all pillars (not marine-only regions).
 */
export async function resolveAllPillarSuburb(
  regionSlug: string,
  suburbSlug: string,
): Promise<AllPillarSuburbData | null> {
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

  // Only show all-pillar pages for regions that serve all pillars.
  const regionPillars = (region.pillars ?? []) as string[]
  if (regionPillars.length > 0 && !regionPillars.includes('automotive')) return null

  const suburbRes = await payload.find({
    collection: 'suburbs',
    where: {
      and: [
        { slug: { equals: suburbSlug } },
        { region: { equals: region.id } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: false,
  })
  const suburb = suburbRes.docs?.[0] as Suburb | undefined
  if (!suburb) return null

  const nearRes = await payload.find({
    collection: 'suburbs',
    where: { region: { equals: region.id } },
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: 'title',
  })
  const nearbySuburbs = (nearRes.docs as Suburb[]).filter((s) => s.id !== suburb.id)

  return {
    region,
    suburb,
    nearbySuburbs,
    pillars: pillarOptions.map((p) => ({ slug: p.value, label: p.label })),
  }
}

/** H1 for an all-pillar region page */
export const allPillarRegionH1 = (data: AllPillarRegionData): string =>
  `Trimming Services in ${data.region.title}`

/** Meta description for an all-pillar region page */
export const allPillarRegionDescription = (data: AllPillarRegionData): string =>
  `Marine, automotive, caravan, trade and commercial trimming services in ${data.region.title}. Custom covers, canvas, upholstery and repairs. Based in Toronto, Lake Macquarie.`

/** H1 for an all-pillar suburb page */
export const allPillarSuburbH1 = (data: AllPillarSuburbData): string =>
  `Trimming Services in ${data.suburb.title}, ${data.region.title}`

/** Meta description for an all-pillar suburb page */
export const allPillarSuburbDescription = (data: AllPillarSuburbData): string =>
  `Marine, automotive, caravan, trade and commercial trimming services in ${data.suburb.title}, ${data.region.title}. Custom covers, canvas, upholstery and repairs.`
