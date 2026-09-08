import Link from 'next/link'
import NextImage from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { CompactReviewCard } from '@/components/Reviews/ReviewsSection'
import { AssetTypeGrid } from '@/Matrix/AssetTypeGrid'
import { ServiceTypeGrid } from '@/Matrix/ServiceTypeGrid'
import { pillarLabel } from '@/fields/pillars'
import type { Media, Page, Review } from '@/payload-types'
import type { RegionSuburbData } from './matrix'

const PHONE = '1300 799 882'
const PHONE_TEL = 'tel:1300799882'

const regionCopy: Record<string, { custom: string; repairs: string }> = {
  marine: {
    custom: 'Bespoke biminis, Dodgers, cockpit and flybridge enclosures, sail covers, sunbeds, cushions and full interior refits — designed and stitched from marine-grade materials.',
    repairs: 'Zip repairs, re-stitching, re-covering damaged vinyl, replacing worn clears and canvas, and bringing tired trim back to life at a fraction of the replacement cost.',
  },
  automotive: {
    custom: 'Tonneau covers, custom seats, door trims, headlinings, motorcycle seats and scooter upholstery, all stitched to suit your vehicle and use.',
    repairs: 'Bolster repairs, vinyl and leather repair, stitched seams, headlining sag fixes, and seat foam replacement to restore comfort and looks.',
  },
  'caravan-and-rv': {
    custom: 'Annexes, shade walls, pop-top seals, upgraded cushions, mattresses and interior panels, built to fit your van and your travels.',
    repairs: 'Annex repairs, window and hatch seal replacement, re-stitching, cushion and mattress refurbishment, and water-damaged trim renewal.',
  },
  'trade-and-industrial': {
    custom: 'Tonneau and machinery covers, soft canopies, tool covers, custom trays and operator-seat trimming for trucks and equipment.',
    repairs: 'Tonneau and cover repairs, seam re-stitching, replacement hardware, and refurbishing seats and trim on working vehicles.',
  },
  commercial: {
    custom: 'Custom seating and booth upholstery for cafés and restaurants, office chair re-upholstery, bench seating and contract runs to spec.',
    repairs: 'Re-covering worn panels, replacing damaged vinyl, re-stitching seams and refreshing furniture to extend the life of your investment.',
  },
}

export const RegionSuburbTemplate: React.FC<{ data: RegionSuburbData }> = async ({ data }) => {
  const { pillar, region, suburb, nearbySuburbs } = data
  const label = pillarLabel(pillar)

  // Fetch the pillar page's hero media and reviews (same as RegionTemplate)
  const payload = await getPayload({ config: configPromise })
  const [pageRes, reviewsRes] = await Promise.all([
    payload.find({
      collection: 'pages',
      draft: false,
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: pillar } },
    }),
    payload.find({
      collection: 'reviews',
      where: { and: [{ hidden: { not_equals: true } }, { rating: { equals: 5 } }] },
      depth: 1,
      limit: 2,
      overrideAccess: false,
      sort: '-featured,-reviewDate',
    }),
  ])

  const pillarPage = pageRes.docs?.[0] as Page | undefined
  const heroMedia =
    pillarPage?.hero?.media && typeof pillarPage.hero.media === 'object'
      ? (pillarPage.hero.media as Media)
      : null
  const reviews = reviewsRes.docs as Review[]

  return (
    <article className="pb-24">
      {/* ====================================================================
          Hero — inherits the pillar page's hero image
      ==================================================================== */}
      <section
        className="relative flex min-h-[50vh] items-end overflow-hidden text-white"
        data-theme="dark"
      >
        {heroMedia && (
          <>
            <NextImage
              src={heroMedia.url || ''}
              alt={heroMedia.alt || `${label} trimming in ${suburb.title}`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/30"
              aria-hidden="true"
            />
          </>
        )}
        {!heroMedia && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-accent/80 to-accent" aria-hidden="true" />
        )}
        <div className="container relative z-10 pb-16 pt-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wide text-[#a3c44d] mb-3">
              {suburb.title} · {region.title}
            </p>
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
              {label} Trimming in {suburb.title}
            </h1>
            <p className="mt-4 text-lg text-white/85 leading-relaxed max-w-xl">
              Custom-made and repaired covers, canvas and upholstery for{' '}
              {label.toLowerCase()} customers in {suburb.title}, {region.title}.
              Based at our Toronto workshop on Lake Macquarie.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Breadcrumbs
      ==================================================================== */}
      <nav className="container pt-8" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-border">/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link href={`/${pillar}`} className="hover:text-primary transition-colors">{label}</Link>
            <span className="text-border">/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link href={`/${pillar}/${region.slug}`} className="hover:text-primary transition-colors">{region.title}</Link>
            <span className="text-border">/</span>
          </li>
          <li>
            <span className="text-foreground font-medium">{suburb.title}</span>
          </li>
        </ol>
      </nav>

      {/* ====================================================================
          SEO content + reviews sidebar
      ==================================================================== */}
      <div className="container mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SEO text — 3/4 width */}
          <div className="lg:col-span-3">
            <div className="prose dark:prose-invert max-w-3xl text-foreground/80 leading-relaxed">
              <p>
                {label} trimming services in {suburb.title}, {region.title}.{' '}
                {regionCopy[pillar]?.custom ?? ''}{' '}
                {regionCopy[pillar]?.repairs ?? ''}
              </p>
              <p>
                Based in Toronto on Lake Macquarie, our workshop is a short drive from{' '}
                {suburb.title}. For larger jobs we can come to you to measure and fit on-site —
                whether that&apos;s your home, workplace, marina or mooring.
              </p>
            </div>
            <div className="mt-8">
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
          {/* Google reviews sidebar — 1/4 width */}
          {reviews.length > 0 && (
            <div className="lg:col-span-1 flex flex-col gap-4">
              {reviews.map((review) => (
                <CompactReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          Asset types + Service types (same grids as pillar/region pages)
      ==================================================================== */}
      <AssetTypeGrid pillar={pillar} />
      <ServiceTypeGrid
        pillar={pillar}
        customIntro={regionCopy[pillar]?.custom ?? ''}
        repairsIntro={regionCopy[pillar]?.repairs ?? ''}
      />

      {/* ====================================================================
          Nearby suburbs
      ==================================================================== */}
      {nearbySuburbs.length > 0 && (
        <div className="container mt-16">
          <h2 className="text-2xl font-medium tracking-tight mb-4">
            Nearby areas in {region.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {nearbySuburbs.map((s) => (
              <Link
                key={s.id}
                href={`/${pillar}/${region.slug}/${s.slug}`}
                className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          CTA band
      ==================================================================== */}
      <div className="container mt-16">
        <div className="rounded-2xl bg-accent text-white px-8 py-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-medium">
            Need {label.toLowerCase()} services in {suburb.title}?
          </h2>
          <p className="mt-2 max-w-lg text-white/85">
            Tell us about your project and we will provide a tailored quote.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-4">
            <CMSLink
              {...{
                type: 'custom',
                label: 'Request a Quote',
                url: '/quote',
                appearance: 'default',
              }}
            />
            <a
              href={PHONE_TEL}
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {PHONE}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}