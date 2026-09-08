import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import Link from 'next/link'

import type { AssetType, Media as MediaType, Project, Review } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { HeroCarousel } from '@/components/HeroCarousel'
import { Media } from '@/components/Media'
import { ProjectCard } from '@/Projects/ProjectCard'
import { ReviewsSection, Stars, CompactReviewCard } from '@/components/Reviews/ReviewsSection'
import { generateMeta } from '@/utilities/generateMeta'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Data queries
// ---------------------------------------------------------------------------

const queryHomePage = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: 'home' } },
  })
  return result.docs?.[0] || null
})

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage()
  return generateMeta({ doc: page })
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const SERVICE_PILLARS = [
  {
    slug: 'marine',
    label: 'Marine',
    noun: 'vessels',
    description: 'Biminis, dodgers, enclosures, sail covers, cushions and full interior refits.',
  },
  {
    slug: 'automotive',
    label: 'Automotive',
    noun: 'vehicles',
    description: 'Tonneau covers, custom seats, door trims, headlinings and motorcycle seats.',
  },
  {
    slug: 'caravan-and-rv',
    label: 'Caravan & RV',
    noun: 'vans',
    description: 'Annexes, pop-top seals, upgraded cushions, mattresses and interior panels.',
  },
  {
    slug: 'trade-and-industrial',
    label: 'Trade & Industrial',
    noun: 'gear',
    description: 'Machinery covers, soft canopies, tool covers and operator-seat trimming.',
  },
  {
    slug: 'commercial',
    label: 'Commercial',
    noun: 'businesses',
    description: 'Custom seating, booth upholstery, office chairs and contract runs to spec.',
  },
] as const

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Request a Quote',
    description: 'Fill out our online form or call us. Tell us what you need — photos help.',
    icon: '📝',
  },
  {
    step: 2,
    title: 'We Review & Quote',
    description: 'We assess the job, provide a clear quote with materials and timeframe, and answer your questions.',
    icon: '📋',
  },
  {
    step: 3,
    title: 'We Build & Repair',
    description: 'We get to work — most jobs are built in the workshop, but for larger jobs like clears we come to your vessel to measure and fit on-site.',
    icon: '🔧',
  },
] as const

const PHONE = '1300 799 882'
const PHONE_TEL = 'tel:1300799882'

// ---------------------------------------------------------------------------
// Pillar card — image on top, text below, fixed width for centred rows
// ---------------------------------------------------------------------------

type PillarInfo = (typeof SERVICE_PILLARS)[number]

const PillarCard: React.FC<{
  pillar: PillarInfo
  image: MediaType | null
}> = ({ pillar, image }) => {
  return (
    <Link
      href={`/${pillar.slug}`}
      className="group block w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-primary hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
            resource={image}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#607A00]/10 to-[#607A00]/5" />
        )}
      </div>
      {/* Text */}
      <div className="p-6 text-center">
        <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">
          {pillar.label}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {pillar.description}
        </p>
        <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
          Explore {pillar.label} →
        </span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [projectsRes, reviewsRes, assetTypesRes, homePageGlobal] = await Promise.all([
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
      where: {
        and: [
          { hidden: { not_equals: true } },
          { rating: { equals: 5 } },
        ],
      },
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
    payload.findGlobal({
      slug: 'home-page',
      depth: 2,
      overrideAccess: false,
    }),
  ])

  const projects = projectsRes.docs as Project[]
  const reviews = reviewsRes.docs as Review[]

  // Build carousel slides from project featured images
  const carouselSlides = projects
    .map((p) => {
      const img = typeof p.featuredImage === 'object' ? (p.featuredImage as MediaType) : null
      if (!img?.url) return null
      return { url: img.url, alt: img.alt || p.title }
    })
    .filter((s): s is { url: string; alt: string } => s !== null)

  // Build a map of pillar → image from the HomePage global (admin-configured).
  // Falls back to project featured image, then asset type hero image.
  const globalPillarImages: Record<string, MediaType | null> = {
    marine: typeof homePageGlobal?.marineImage === 'object' ? (homePageGlobal.marineImage as MediaType) : null,
    automotive:
      typeof homePageGlobal?.automotiveImage === 'object'
        ? (homePageGlobal.automotiveImage as MediaType)
        : null,
    'caravan-and-rv':
      typeof homePageGlobal?.caravanRvImage === 'object'
        ? (homePageGlobal.caravanRvImage as MediaType)
        : null,
    'trade-and-industrial':
      typeof homePageGlobal?.tradeIndustrialImage === 'object'
        ? (homePageGlobal.tradeIndustrialImage as MediaType)
        : null,
    commercial:
      typeof homePageGlobal?.commercialImage === 'object'
        ? (homePageGlobal.commercialImage as MediaType)
        : null,
  }

  const pillarImages: Record<string, MediaType | null> = {}
  for (const pillar of SERVICE_PILLARS) {
    // 1. Admin-configured image from the HomePage global (highest priority)
    if (globalPillarImages[pillar.slug]) {
      pillarImages[pillar.slug] = globalPillarImages[pillar.slug]
      continue
    }
    // 2. Project featured image for this pillar
    const project = projects.find((p) => p.pillar === pillar.slug)
    if (project && typeof project.featuredImage === 'object') {
      pillarImages[pillar.slug] = (project.featuredImage as MediaType)
      continue
    }
    // 3. First asset type hero image for this pillar
    const assetType = (assetTypesRes.docs as AssetType[]).find(
      (a) => a.pillar === pillar.slug && typeof a.heroImage === 'object' && a.heroImage !== null,
    )
    pillarImages[pillar.slug] =
      assetType && typeof assetType.heroImage === 'object'
        ? (assetType.heroImage as MediaType)
        : null
  }

  return (
    <div className="pb-24">
      {/* ====================================================================
          1. HERO — image carousel background with local SEO and action card
      ==================================================================== */}
      <section
        className="relative flex min-h-[70vh] items-center overflow-hidden text-white"
        data-theme="dark"
      >
        {/* Background — cross-fading project image carousel */}
        <HeroCarousel slides={carouselSlides} />

        <div className="container relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left 2/3 — title + subtitle */}
            <div className="lg:col-span-2 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-wide text-[#a3c44d] mb-4">
                Lake Macquarie · Newcastle · Central Coast · Hunter Valley
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
                Marine, Automotive &amp; General Trimming
              </h1>
              <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-xl">
                Custom-made covers, canvas and upholstery — plus expert repairs that bring
                tired trim back to life. Built to handle harsh Australian conditions, stitched
                in our Toronto workshop.
              </p>
            </div>

            {/* Right 1/3 — action card (matches standard hero layout) */}
            <div className="lg:col-span-1 flex lg:justify-end">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 w-full lg:max-w-xs">
                {/* CTA */}
                <div className="mb-5">
                  <CMSLink
                    {...{
                      type: 'custom',
                      label: 'Request a Quote',
                      url: '/quote',
                      appearance: 'default',
                    }}
                  />
                </div>

                {/* Phone */}
                <a
                  href={PHONE_TEL}
                  className="block text-white text-lg font-medium hover:text-white/80 transition-colors mb-5"
                >
                  {PHONE}
                </a>

                {/* Areas we serve */}
                <div className="pt-5 border-t border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
                    Areas we serve
                  </p>
                  <p className="text-sm text-white/85 leading-relaxed">
                    Lake Macquarie &middot; Newcastle
                    <br />
                    Central Coast &middot; Hunter Valley
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. TRUST BAR — thin strip with social proof
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
          3. SERVICE PILLARS — 5 cards with images, 3 + 2 rows, centred
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-medium tracking-tight">What We Do</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Five service areas covering everything from boats to trucks. Explore each
              area to see the full range of custom work and repairs we offer.
            </p>
          </div>

          {/* Row 1 — 3 cards */}
          <div className="flex flex-wrap justify-center gap-6">
            {SERVICE_PILLARS.slice(0, 3).map((pillar) => (
              <PillarCard
                key={pillar.slug}
                pillar={pillar}
                image={pillarImages[pillar.slug]}
              />
            ))}
          </div>

          {/* Row 2 — 2 cards */}
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {SERVICE_PILLARS.slice(3).map((pillar) => (
              <PillarCard
                key={pillar.slug}
                pillar={pillar}
                image={pillarImages[pillar.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. RECENT WORK — project showcase
      ==================================================================== */}
      {projects.length > 0 && (
        <section className="bg-accent text-white py-16" data-theme="dark">
          <div className="container">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-medium tracking-tight">Recent Work</h2>
                <p className="mt-2 text-white/85 max-w-2xl">
                  Real jobs from our Toronto workshop.
                </p>
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
          5. HOW IT WORKS — 3-step process
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-medium tracking-tight">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              From first contact to finished job — three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description, icon }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#607A00]/10 text-3xl">
                  {icon}
                </div>
                <div className="mb-2 text-sm font-medium text-[#607A00]">
                  Step {step}
                </div>
                <h3 className="text-xl font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
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
      </section>

      {/* ====================================================================
          6. REVIEWS — Google reviews (teal band)
      ==================================================================== */}
      {reviews.length > 0 && (
        <section className="bg-accent text-white py-16" data-theme="dark">
          <div className="container">
            <ReviewsSection onTeal={true} limit={4} />
          </div>
        </section>
      )}

      {/* ====================================================================
          7. CTA BAND — final conversion push
      ==================================================================== */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl bg-[#607A00] text-white p-10 md:p-16 text-center">
            <h2 className="text-3xl font-medium tracking-tight">Ready to Get Started?</h2>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              Request a quote online or call us — we&apos;ll help you find the right
              solution for your vessel, vehicle or business.
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