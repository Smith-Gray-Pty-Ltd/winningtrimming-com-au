import Link from 'next/link'
import NextImage from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { AssetType, Media, Project, ServiceType } from '@/payload-types'

type ServiceCardProps = {
  title: string
  blurb?: string
  href: string
  onTeal: boolean
  heroImage?: Media | null
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, blurb, href, onTeal, heroImage }) => {
  const cardClass = onTeal
    ? 'group block rounded-xl bg-white/10 hover:bg-white/20 transition-colors overflow-hidden h-full'
    : 'group block rounded-xl border border-border bg-white hover:border-primary transition-colors overflow-hidden h-full'
  const titleClass = onTeal
    ? 'font-medium text-white group-hover:text-primary transition-colors'
    : 'font-medium text-foreground group-hover:text-primary transition-colors'
  const blurbClass = onTeal
    ? 'text-sm text-white/70 mt-1 line-clamp-2'
    : 'text-sm text-muted-foreground mt-1 line-clamp-2'
  const bodyClass = onTeal ? 'p-5' : 'p-5'

  return (
    <Link href={href} className={cardClass}>
      {heroImage && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <NextImage
            src={heroImage.url || ''}
            alt={heroImage.alt || title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className={bodyClass}>
        <h3 className={titleClass}>{title}</h3>
        {blurb && <p className={blurbClass}>{blurb}</p>}
      </div>
    </Link>
  )
}

/**
 * Returns true if the media looks like a generated placeholder rather than
 * a real project photo. Two patterns are in use:
 *   - Service types: `service-{slug}-hero-N.jpg`
 *   - Asset types:    `{slug}-hero-N.jpg`
 * Both share the alt text "Curving abstract shapes with an orange and blue
 * gradient". Real project photos keep their original filenames (IMG_…, dates).
 */
const isPlaceholderImage = (media: Media | null): boolean => {
  if (!media) return true
  const filename = media.filename || ''
  const alt = media.alt || ''
  if (alt.startsWith('Curving abstract shapes')) return true
  return filename.startsWith('service-') || /-hero-\d+\./.test(filename)
}

/**
 * Renders two grids of service-type cards on pillar pages:
 *
 * 1. "Custom & New Work" (teal band) — service types with workType = custom
 * 2. "Repairs & Restorations" (white band) — service types with workType = repair
 *
 * Each card links into the SEO matrix. When a service type's hero image is a
 * placeholder, the card falls back to the featured image of the most recent
 * published project tagged with that service type — so real work photos show
 * up on the pillar landing pages automatically as projects are added.
 *
 * Returns null if no service types exist.
 */
export const ServiceTypeGrid: React.FC<{
  pillar: string
  customIntro: string
  repairsIntro: string
}> = async ({ pillar, customIntro, repairsIntro }) => {
  const payload = await getPayload({ config: configPromise })

  const [typesRes, assetsRes, projectsRes] = await Promise.all([
    payload.find({
      collection: 'service-types',
      where: { pillar: { equals: pillar } },
      depth: 1,
      limit: 200,
      overrideAccess: false,
      sort: 'title',
    }),
    payload.find({
      collection: 'asset-types',
      where: { pillar: { equals: pillar } },
      depth: 2,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
    payload.find({
      collection: 'projects',
      where: { pillar: { equals: pillar } },
      depth: 2,
      limit: 200,
      overrideAccess: false,
      draft: false,
      sort: '-completedAt',
    }),
  ])

  const allTypes = typesRes.docs as ServiceType[]
  if (allTypes.length === 0) return null

  const assets = assetsRes.docs as AssetType[]
  const projects = projectsRes.docs as Project[]

  const vesselForProduct = (productSlug: string): AssetType | undefined =>
    assets.find((a) =>
      (a.applicableProducts ?? [])
        .filter((p): p is ServiceType => typeof p === 'object' && p !== null)
        .some((p) => p.slug === productSlug),
    )

  const customTypes = allTypes.filter((t) => !t.workType || t.workType === 'custom')
  const repairTypes = allTypes.filter((t) => t.workType === 'repair')

  /**
   * Resolve the best image for a service-type card. Falls back to the
   * featuredImage of the most recent published project tagged with the
   * given service type when the service type's own hero image is missing
   * or a generated placeholder.
   */
  const heroOf = (st: ServiceType): Media | null => {
    const ownHero =
      typeof st.heroImage === 'object' && st.heroImage !== null
        ? (st.heroImage as Media)
        : null

    if (!isPlaceholderImage(ownHero)) return ownHero

    // Fall back to a matching project's featured image.
    const matchingProject = projects.find((p) =>
      (p.serviceTypes ?? []).some(
        (s) => typeof s === 'object' && s !== null && s.id === st.id,
      ),
    )
    if (!matchingProject) return ownHero // keep the placeholder if no project matches

    const projectImage =
      typeof matchingProject.featuredImage === 'object' &&
      matchingProject.featuredImage !== null
        ? (matchingProject.featuredImage as Media)
        : null
    return projectImage || ownHero
  }

  return (
    <>
      {/* Custom & New Work — teal band */}
      {customTypes.length > 0 && (
        <section className="bg-accent text-white py-16" data-theme="dark">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-3xl font-medium tracking-tight">
                Custom &amp; New Work
              </h2>
              <p className="mt-3 text-white/85 max-w-2xl leading-relaxed">
                {customIntro}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {customTypes.map((st) => (
                <ServiceCard
                  key={st.id}
                  title={st.title}
                  blurb={st.intro || undefined}
                  href={`/${pillar}/${st.slug}`}
                  onTeal
                  heroImage={heroOf(st)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Repairs & Restorations — white band */}
      {repairTypes.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-3xl font-medium tracking-tight">
                Repairs &amp; Restorations
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
                {repairsIntro}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {repairTypes.map((st) => (
                <ServiceCard
                  key={st.id}
                  title={st.title}
                  blurb={st.intro || undefined}
                  href={`/${pillar}/${st.slug}`}
                  onTeal={false}
                  heroImage={heroOf(st)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}