import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import type { Page as PageType } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { AssetTypeGrid } from '@/Matrix/AssetTypeGrid'
import { ServiceTypeGrid } from '@/Matrix/ServiceTypeGrid'
import { isValidPillar } from '@/Matrix/matrix'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

/** Custom & repairs intro copy per pillar, shown above the two service grids. */
const pillarCopy: Record<string, { custom: string; repairs: string }> = {
  marine: {
    custom:
      'Bespoke biminis, Dodgers, cockpit and flybridge enclosures, sail covers, sunbeds, cushions and full interior refits — designed and stitched from marine-grade materials.',
    repairs:
      'Zip repairs, re-stitching, re-covering damaged vinyl, replacing worn clears and canvas, and bringing tired trim back to life at a fraction of the replacement cost.',
  },
  automotive: {
    custom:
      'Tonneau covers, custom seats, door trims, headlinings, motorcycle seats and scooter upholstery, all stitched to suit your vehicle and use.',
    repairs:
      'Bolster repairs, vinyl and leather repair, stitched seams, headlining sag fixes, and seat foam replacement to restore comfort and looks.',
  },
  'caravan-and-rv': {
    custom:
      'Annexes, shade walls, pop-top seals, upgraded cushions, mattresses and interior panels, built to fit your van and your travels.',
    repairs:
      'Annex repairs, window and hatch seal replacement, re-stitching, cushion and mattress refurbishment, and water-damaged trim renewal.',
  },
  'trade-and-industrial': {
    custom:
      'Tonneau and machinery covers, soft canopies, tool covers, custom trays and operator-seat trimming for trucks and equipment.',
    repairs:
      'Tonneau and cover repairs, seam re-stitching, replacement hardware, and refurbishing seats and trim on working vehicles.',
  },
  commercial: {
    custom:
      'Custom seating and booth upholstery for cafés and restaurants, office chair re-upholstery, bench seating and contract runs to spec.',
    repairs:
      'Re-covering worn panels, replacing damaged vinyl, re-stitching seams and refreshing furniture to extend the life of your investment.',
  },
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = 'home' } = await paramsPromise
  const url = '/' + slug

  let page: PageType | null

  page = await queryPageBySlug({
    slug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  // A high-impact hero is full-bleed and should sit flush under the header;
  // other pages (e.g. contact, no hero) keep top padding.
  const hasHighImpactHero = hero?.type === 'highImpact'

  // Service-pillar pages show a vessel/vehicle-type grid linking into the
  // SEO matrix. Renders nothing on non-pillar pages or pillars without types.
  const showAssetGrid = isValidPillar(slug)

  return (
    <article className={hasHighImpactHero ? 'pb-24' : 'pt-16 pb-24'}>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <RenderHero {...hero} pillar={showAssetGrid ? slug : undefined} regions={showAssetGrid ? await queryRegions(slug) : undefined} />
      {showAssetGrid && <AssetTypeGrid pillar={slug} />}
      {showAssetGrid && (
        <ServiceTypeGrid
          pillar={slug}
          customIntro={pillarCopy[slug]?.custom ?? ''}
          repairsIntro={pillarCopy[slug]?.repairs ?? ''}
        />
      )}
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

/**
 * Query regions relevant to a pillar for the hero "Areas we serve" links.
 * Returns regions where pillars is empty (all pillars) or includes the given pillar.
 */
const queryRegions = cache(async (pillar: string) => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'regions',
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })
  return res.docs
    .filter((r) => {
      const pillars = r.pillars ?? []
      return pillars.length === 0 || pillars.includes(pillar as any)
    })
    .map((r) => ({ title: r.title, slug: r.slug }))
})
