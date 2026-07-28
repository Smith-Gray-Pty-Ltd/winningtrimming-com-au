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
      {showAssetGrid && <ServiceTypeGrid pillar={slug} />}
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
