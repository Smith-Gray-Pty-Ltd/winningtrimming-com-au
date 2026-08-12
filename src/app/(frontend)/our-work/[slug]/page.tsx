import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import NextImage from 'next/image'
import React, { cache } from 'react'

import type { Project } from '@/payload-types'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { pillarLabel } from '@/fields/pillars'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: { slug: true },
  })
  return projects.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = `/our-work/${slug}`
  const project = await queryProjectBySlug({ slug })

  if (!project) return <PayloadRedirects url={url} />

  const featuredImage =
    typeof project.featuredImage === 'object' ? project.featuredImage : null
  const gallery = project.gallery ?? []
  const beforeAfter = project.beforeAfter ?? []
  const serviceTypes = (project.serviceTypes ?? []).filter(
    (s): s is NonNullable<typeof s> => typeof s === 'object',
  )

  const completed = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString('en-AU', {
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article className="pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {/* Hero */}
      <section className="relative w-full h-[50vh] min-h-[360px] max-h-[560px]">
        {featuredImage && (
          <>
            <NextImage
              src={featuredImage.url || ''}
              alt={featuredImage.alt || project.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/40" />
          </>
        )}
        <div className="relative container h-full flex flex-col justify-end pb-10">
          <span className="self-start bg-primary text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
            {pillarLabel(project.pillar)}
          </span>
          <h1 className="text-white text-3xl md:text-5xl font-medium tracking-tight max-w-3xl">
            {project.title}
          </h1>
          {project.location && (
            <p className="text-white/85 mt-2">{project.location}</p>
          )}
        </div>
      </section>

      {/* Meta row */}
      <div className="container mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground border-b border-border pb-6">
        {completed && <span>Completed {completed}</span>}
        {project.materials && <span>Materials: {project.materials}</span>}
        {serviceTypes.length > 0 && (
          <span>
            {serviceTypes.map((s) => s.title).join(' · ')}
          </span>
        )}
      </div>

      {/* Summary + content */}
      <div className="container mt-10 grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-10">
        <div className="lg:col-span-8">
          <p className="text-lg text-foreground/80 leading-relaxed">
            {project.summary}
          </p>
          {project.content && (
            <div className="prose dark:prose-invert max-w-none mt-8">
              <RichText content={project.content} enableGutter={false} />
            </div>
          )}
        </div>

        {/* CTA sidebar */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl bg-accent text-white p-8 lg:sticky lg:top-28">
            <h2 className="text-xl font-medium">Want something like this?</h2>
            <p className="text-white/85 mt-2 text-sm">
              Tell us about your project and we will provide a tailored quote.
            </p>
            <div className="mt-5">
              <CMSLink
                {...{
                  type: 'custom',
                  label: 'Request a Quote',
                  url: '/quote',
                  appearance: 'default',
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="container mt-16">
          <h2 className="text-2xl font-medium tracking-tight mb-6">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item, i) => {
              const img = typeof item.image === 'object' ? item.image : null
              if (!img) return null
              return (
                <figure key={i}>
                  <Media
                    imgClassName="w-full aspect-[4/3] object-cover rounded-lg"
                    resource={img}
                  />
                  {item.caption && (
                    <figcaption className="text-sm text-muted-foreground mt-2">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </div>
      )}

      {/* Before & After */}
      {beforeAfter.length > 0 && (
        <div className="container mt-16">
          <h2 className="text-2xl font-medium tracking-tight mb-6">Before &amp; After</h2>
          <div className="flex flex-col gap-10">
            {beforeAfter.map((pair, i) => {
              const before = typeof pair.before === 'object' ? pair.before : null
              const after = typeof pair.after === 'object' ? pair.after : null
              return (
                <div key={i}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {before && (
                      <figure>
                        <Media
                          imgClassName="w-full aspect-[4/3] object-cover rounded-lg"
                          resource={before}
                        />
                        <figcaption className="text-sm font-medium text-muted-foreground mt-2">
                          Before
                        </figcaption>
                      </figure>
                    )}
                    {after && (
                      <figure>
                        <Media
                          imgClassName="w-full aspect-[4/3] object-cover rounded-lg"
                          resource={after}
                        />
                        <figcaption className="text-sm font-medium text-primary mt-2">
                          After
                        </figcaption>
                      </figure>
                    )}
                  </div>
                  {pair.caption && (
                    <p className="text-sm text-muted-foreground mt-3">{pair.caption}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const project = await queryProjectBySlug({ slug })
  return generateMeta({ doc: project as unknown as any })
}

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'projects',
    draft,
    limit: 1,
    overrideAccess: draft,
    depth: 2,
    where: { slug: { equals: slug } },
  })
  return (result.docs?.[0] as Project | undefined) || null
})
