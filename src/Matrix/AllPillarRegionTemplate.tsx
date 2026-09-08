import Link from 'next/link'
import NextImage from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { ProjectCard } from '@/Projects/ProjectCard'
import { ReviewsSection, Stars } from '@/components/Reviews/ReviewsSection'
import { Media } from '@/components/Media'
import type { AssetType, Media as MediaType, Project, Review } from '@/payload-types'
import type { AllPillarRegionData } from './matrix'

const PHONE = '1300 799 882'
const PHONE_TEL = 'tel:1300799882'

const SERVICE_PILLARS = [
  { slug: 'marine', label: 'Marine', description: 'Biminis, dodgers, enclosures, sail covers, cushions and full interior refits.' },
  { slug: 'automotive', label: 'Automotive', description: 'Tonneau covers, custom seats, door trims, headlinings and motorcycle seats.' },
  { slug: 'caravan-and-rv', label: 'Caravan & RV', description: 'Annexes, pop-top seals, upgraded cushions, mattresses and interior panels.' },
  { slug: 'trade-and-industrial', label: 'Trade & Industrial', description: 'Machinery covers, soft canopies, tool covers and operator-seat trimming.' },
  { slug: 'commercial', label: 'Commercial', description: 'Custom seating, booth upholstery, office chairs and contract runs to spec.' },
] as const

const PillarCard: React.FC<{
  pillar: { slug: string; label: string; description: string }
  image: MediaType | null
  regionSlug: string
}> = ({ pillar, image, regionSlug }) => {
  return (
    <Link
      href={`/${pillar.slug}/${regionSlug}`}
      className="group block w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-primary hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Media fill imgClassName="object-cover transition-transform duration-300 group-hover:scale-105" resource={image} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#607A00]/10 to-[#607A00]/5" />
        )}
      </div>
      <div className="p-6 text-center">
        <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">{pillar.label}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
        <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
          {pillar.label} in this area →
        </span>
      </div>
    </Link>
  )
}

export const AllPillarRegionTemplate: React.FC<{ data: AllPillarRegionData }> = async ({ data }) => {
  const { region, suburbs } = data

  const payload = await getPayload({ config: configPromise })
  const [projectsRes, reviewsRes, assetTypesRes] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 2,
      limit: 8,
      overrideAccess: false,
      draft: false,
      sort: '-featured,-completedAt',
    }),
    payload.find({
      collection: 'reviews',
      where: { and: [{ hidden: { not_equals: true } }, { rating: { equals: 5 } }] },
      depth: 1,
      limit: 4,
      overrideAccess: false,
      sort: '-featured,-reviewDate',
    }),
    payload.find({
      collection: 'asset-types',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
  ])

  const projects = projectsRes.docs as Project[]
  const reviews = reviewsRes.docs as Review[]

  // Build carousel slides from project images
  const carouselSlides = projects
    .map((p) => {
      const img = typeof p.featuredImage === 'object' ? (p.featuredImage as MediaType) : null
      if (!img?.url) return null
      return { url: img.url, alt: img.alt || p.title }
    })
    .filter((s): s is { url: string; alt: string } => s !== null)

  // Pillar card images — first asset type hero per pillar
  const pillarImages: Record<string, MediaType | null> = {}
  for (const pillar of SERVICE_PILLARS) {
    const assetType = (assetTypesRes.docs as AssetType[]).find(
      (a) => a.pillar === pillar.slug && typeof a.heroImage === 'object' && a.heroImage !== null,
    )
    pillarImages[pillar.slug] =
      assetType && typeof assetType.heroImage === 'object' ? (assetType.heroImage as MediaType) : null
  }

  return (
    <div className="pb-24">
      {/* ====================================================================
          1. HERO — image background with region SEO and action card
      ==================================================================== */}
      <section
        className="relative flex min-h-[60vh] items-center overflow-hidden text-white"
        data-theme="dark"
      >
        {carouselSlides[0] && (
          <>
            <NextImage
              src={carouselSlides[0].url}
              alt={carouselSlides[0].alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/30" aria-hidden="true" />
          </>
        )}
        {!carouselSlides[0] && (
          <div className="absolute inset-0 bg-accent" aria-hidden="true" />
        )}
        <div className="container relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-wide text-[#a3c44d] mb-4">
                Toronto · Lake Macquarie
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
                Trimming Services in {region.title}
              </h1>
              <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-xl">
                {region.description || `Custom-made covers, canvas and upholstery plus expert repairs. Serving ${region.title} from our Toronto workshop on Lake Macquarie.`}
              </p>
            </div>
            <div className="lg:col-span-1 flex lg:justify-end">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 w-full lg:max-w-xs">
                <div className="mb-5">
                  <CMSLink
                    {...{ type: 'custom', label: 'Request a Quote', url: '/quote', appearance: 'default' }}
                  />
                </div>
                <a
                  href={PHONE_TEL}
                  className="block text-white text-lg font-medium hover:text-white/80 transition-colors mb-5"
                >
                  {PHONE}
                </a>
                <div className="pt-5 border-t border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/60 mb-2">Areas we serve</p>
                  <p className="text-sm text-white/85 leading-relaxed">
                    Lake Macquarie &middot; Newcastle<br />
                    Central Coast &middot; Hunter Valley
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. TRUST BAR
      ==================================================================== */}
      <section className="bg-[#607A00] text-white py-4">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium">
            {reviews.length > 0 && (
              <span className="flex items-center gap-2">
                <Stars rating={5} className="text-yellow-400" />
                <span>5 stars on Google</span>
              </span>
            )}
            <span className="hidden sm:inline text-white/30">·</span>
            <span>Mon–Fri 7am–3pm · Sat by appointment</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. SERVICE PILLARS — link to /{pillar}/{region}
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-medium tracking-tight">What We Do in {region.title}</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Five service areas covering everything from boats to trucks. Explore each
              area to see what we offer in {region.title}.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {SERVICE_PILLARS.slice(0, 3).map((pillar) => (
              <PillarCard key={pillar.slug} pillar={pillar} image={pillarImages[pillar.slug]} regionSlug={region.slug || ''} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {SERVICE_PILLARS.slice(3).map((pillar) => (
              <PillarCard key={pillar.slug} pillar={pillar} image={pillarImages[pillar.slug]} regionSlug={region.slug || ''} />
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. RECENT WORK
      ==================================================================== */}
      {projects.length > 0 && (
        <section className="bg-accent text-white py-16" data-theme="dark">
          <div className="container">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-medium tracking-tight">Recent Work</h2>
                <p className="mt-2 text-white/85 max-w-2xl">Real jobs from our Toronto workshop.</p>
              </div>
              <Link
                href="/our-work"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                View all our work →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.slice(0, 4).map((p, i) => (
                <div key={p.id} className="[&_*]:text-white [&_.prose]:prose-invert">
                  <ProjectCard project={p} priority={i < 4} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          5. SEO CONTENT + REVIEWS
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="prose dark:prose-invert max-w-3xl text-foreground/80 leading-relaxed">
                <p>
                  Winning Trimming provides custom and repair trimming services across {region.title}.
                  From marine canvas and boat upholstery to automotive seat re-trims, caravan cushions,
                  machinery covers and commercial upholstery — we cover every type of trimming work
                  from our workshop in Toronto on Lake Macquarie.
                </p>
                <p>
                  Our {region.title} customers include boat owners at local marinas, tradespeople with
                  utes and work vehicles, caravanners touring the region, and businesses needing
                  commercial upholstery. We use premium marine-grade and automotive-grade materials
                  that withstand the harsh Australian conditions, and every job is patterned and
                  stitched in-house for a precise fit.
                </p>
                <p>
                  For larger jobs we can come to you — whether that&apos;s your marina, mooring, home
                  or workplace. Call {PHONE} or request a quote online.
                </p>
              </div>
            </div>
            {reviews.length > 0 && (
              <div className="lg:col-span-1">
                <ReviewsSection onTeal={false} limit={2} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. SUBURBS
      ==================================================================== */}
      {suburbs.length > 0 && (
        <section className="py-8">
          <div className="container">
            <h2 className="text-2xl font-medium tracking-tight mb-4">
              Areas within {region.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {suburbs.map((s) => (
                <Link
                  key={s.id}
                  href={`/${region.slug}/${s.slug}`}
                  className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          7. CTA BAND
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl bg-[#607A00] text-white p-10 md:p-16 text-center">
            <h2 className="text-3xl font-medium tracking-tight">Ready to Get Started?</h2>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              Request a quote online or call us — we&apos;ll help you find the right
              solution for your vessel, vehicle or business in {region.title}.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Request a Quote
              </Link>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}