import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Page as PageType } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { ProjectGallery } from '@/Projects/ProjectGallery'
import { generateMeta } from '@/utilities/generateMeta'
import { CMSLink } from '@/components/Link'
import PageClient from './page.client'

export const revalidate = 600

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function OurWorkPage() {
  const payload = await getPayload({ config: configPromise })

  // The /our-work page document (for its hero, managed in the CMS)
  const pageRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'our-work' } },
    limit: 1,
    depth: 2,
    overrideAccess: false,
    draft: false,
  })
  const page: PageType | null = pageRes.docs?.[0] || null

  // Published projects (depth 2 populates media + service types)
  const projectsRes = await payload.find({
    collection: 'projects',
    depth: 2,
    limit: 200,
    overrideAccess: false,
    draft: false,
    sort: '-completedAt',
  })

  const serviceTypesRes = await payload.find({
    collection: 'service-types',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    sort: 'title',
  })

  const hero = page?.hero
  const hasHighImpactHero = hero?.type === 'highImpact'

  return (
    <article className={hasHighImpactHero ? 'pb-24' : 'pt-16 pb-24'}>
      <PageClient />
      {hero && <RenderHero {...hero} />}

      {page?.layout && <RenderBlocks blocks={page.layout} />}

      <div className="container mt-8">
        <ProjectGallery
          projects={projectsRes.docs as unknown as any}
          serviceTypes={serviceTypesRes.docs as unknown as any}
        />

        <div className="mt-20 rounded-2xl bg-accent text-white px-8 py-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-medium">Got a project in mind?</h2>
          <p className="mt-2 max-w-lg text-white/85">
            Tell us what you need and we will help you find the right solution.
          </p>
          <CMSLink
            {...{
              type: 'custom',
              label: 'Request a Quote',
              url: '/contact',
              appearance: 'default',
            }}
          />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const pageRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'our-work' } },
    limit: 1,
    overrideAccess: false,
    draft: false,
  })
  return generateMeta({ doc: pageRes.docs?.[0] || {} })
}
