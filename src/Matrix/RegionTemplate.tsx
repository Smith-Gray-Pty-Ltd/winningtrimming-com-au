import Link from 'next/link'
import NextImage from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ProjectCard } from '@/Projects/ProjectCard'
import { AssetTypeGrid } from '@/Matrix/AssetTypeGrid'
import { ServiceTypeGrid } from '@/Matrix/ServiceTypeGrid'
import { CompactReviewCard } from '@/components/Reviews/ReviewsSection'
import type { Media, Page, Project, Review } from '@/payload-types'
import { pillarLabel, pillarNoun } from '@/fields/pillars'
import type { RegionPageData } from './matrix'

const PHONE = '1300 799 882'
const PHONE_TEL = 'tel:1300799882'

/**
 * Region-specific intro copy for the Custom & Repairs sections.
 * Falls back to the pillar copy with the region name prepended.
 */
const regionCopy: Record<string, { custom: string; repairs: string }> = {
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

/**
 * Generate region-specific SEO text from the pillar copy + region name.
 */
const regionSeoText = (pillar: string, regionTitle: string): string => {
  const copy = regionCopy[pillar]
  if (!copy) return ''
  const noun = pillarNoun[pillar] ?? 'vessel'
  const onSiteNote = pillar === 'marine'
    ? `for larger jobs like clears we can come to your ${noun} to measure and fit on-site`
    : `for larger jobs we can come to you to measure and fit on-site`
  return `Based in the ${regionTitle} area? ${copy.custom} ${copy.repairs} Our Toronto workshop is a short drive away, and ${onSiteNote}.`
}

export const RegionTemplate: React.FC<{ data: RegionPageData }> = async ({ data }) => {
  const { pillar, region, suburbs, businesses, assetTypes } = data
  const label = pillarLabel(pillar)

  // Fetch pillar page hero + projects + reviews in parallel
  const payload = await getPayload({ config: configPromise })
  const [pageRes, projectsRes, reviewsRes, regionsRes] = await Promise.all([
    payload.find({
      collection: 'pages',
      draft: false,
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: pillar } },
    }),
    payload.find({
      collection: 'projects',
      where: { pillar: { equals: pillar } },
      depth: 2,
      limit: 4,
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
      limit: 2,
      overrideAccess: false,
      sort: '-featured,-reviewDate',
    }),
    payload.find({
      collection: 'regions',
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
  ])

  const pillarPage = pageRes.docs?.[0] as Page | undefined
  const projects = projectsRes.docs as Project[]
  const reviews = reviewsRes.docs as Review[]

  // Regions relevant to this pillar (for the hero "Areas we serve" links)
  const pillarRegions = regionsRes.docs
    .filter((r) => {
      const pillars = r.pillars ?? []
      return pillars.length === 0 || pillars.includes(pillar as never)
    })
    .map((r) => ({ title: r.title, slug: r.slug }))
    .filter((r) => r.slug)

  // Hero — use the pillar page's hero media and richText if available
  const heroMedia =
    pillarPage?.hero?.media && typeof pillarPage.hero.media === 'object'
      ? (pillarPage.hero.media as Media)
      : null
  const heroRichText = pillarPage?.hero?.richText || null

  const businessTypeLabel = (type?: string | null) => {
    const labels: Record<string, string> = {
      marina: 'Marina',
      'yacht-club': 'Yacht Club',
      'sailing-club': 'Sailing Club',
      shipwright: 'Shipwright',
      boatyard: 'Boatyard',
      chandlery: 'Chandlery',
    }
    return type ? labels[type] ?? type : ''
  }

  return (
    <article className="pb-24">
      {/* ====================================================================
          Hero — uses the pillar page's hero media/richText (matches pillar layout)
      ==================================================================== */}
      <section
        className="relative flex min-h-[60vh] items-end overflow-hidden text-white"
        data-theme="dark"
      >
        {heroMedia && (
          <>
            <NextImage
              src={heroMedia.url || ''}
              alt={heroMedia.alt || label}
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
        <div className="container relative z-10 pb-16 pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Left 2/3 — pillar richText, with region context line */}
            <div className="lg:col-span-2 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-wide text-[#a3c44d] mb-3">
                {region.title}
              </p>
              {heroRichText ? (
                <RichText className="text-white" content={heroRichText} enableGutter={false} />
              ) : (
                <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
                  {label} services in {region.title}
                </h1>
              )}
              {!heroRichText && region.description && (
                <p className="mt-4 text-lg text-white/85 leading-relaxed">
                  {region.description}
                </p>
              )}
            </div>

            {/* Right 1/3 — action card */}
            <div className="lg:col-span-1 flex lg:justify-end">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 w-full lg:max-w-xs">
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
                <a
                  href={PHONE_TEL}
                  className="block text-white text-lg font-medium hover:text-white/80 transition-colors mb-5"
                >
                  {PHONE}
                </a>
                <div className="pt-5 border-t border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
                    Areas we serve
                  </p>
                  {pillarRegions.length > 0 ? (
                    <p className="text-sm leading-relaxed">
                      {pillarRegions.map((r, i) => (
                        <span key={r.slug}>
                          <Link
                            href={`/${pillar}/${r.slug}`}
                            className="font-medium text-white hover:text-white/70 transition-colors"
                          >
                            {r.title}
                          </Link>
                          {i < pillarRegions.length - 1 && <span className="text-white/40"> · </span>}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="text-sm text-white/85 leading-relaxed">
                      Lake Macquarie &middot; Newcastle
                      <br />
                      Central Coast &middot; Hunter Valley
                    </p>
                  )}
                </div>
              </div>
            </div>
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
          <li>
            <span className="text-foreground font-medium">{region.title}</span>
          </li>
        </ol>
      </nav>

      {/* ====================================================================
          SEO content + review sidebar
      ==================================================================== */}
      <div className="container mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SEO text — 3/4 width */}
          <div className="lg:col-span-3">
            <div className="prose dark:prose-invert max-w-3xl text-foreground/80 leading-relaxed">
              {region.content?.body ? (
                <RichText content={region.content.body} enableGutter={false} />
              ) : region.description ? (
                <p>{region.description}</p>
              ) : null}
              {/* Generated region SEO text */}
              {regionSeoText(pillar, region.title) && (
                <p>{regionSeoText(pillar, region.title)}</p>
              )}
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
          Our Work — full-width teal band
      ==================================================================== */}
      {projects.length > 0 && (
        <section className="bg-accent text-white py-16 mt-12" data-theme="dark">
          <div className="container">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-medium tracking-tight">Our Work</h2>
                <p className="mt-2 text-white/85 max-w-2xl">
                  Real {label.toLowerCase()} jobs we&apos;ve completed in the workshop.
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
              {projects.map((p, i) => (
                <div key={p.id} className="[&_*]:text-white [&_.prose]:prose-invert">
                  <ProjectCard project={p} priority={i < 4} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          What can we do for your vessel? + Custom & Repairs sections
          (same AssetTypeGrid and ServiceTypeGrid as the pillar pages)
      ==================================================================== */}
      <AssetTypeGrid pillar={pillar} />
      <ServiceTypeGrid
        pillar={pillar}
        customIntro={regionCopy[pillar]?.custom ?? ''}
        repairsIntro={regionCopy[pillar]?.repairs ?? ''}
      />

      {/* ====================================================================
          Businesses / marinas + Suburbs
      ==================================================================== */}
      <div className="container mt-16">
        {/* Businesses / marinas */}
        {businesses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-medium tracking-tight mb-5">
              Marinas &amp; facilities in {region.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="rounded-lg border border-border bg-white px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">{biz.title}</span>
                    {biz.type && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {businessTypeLabel(biz.type)}
                      </span>
                    )}
                  </div>
                  {biz.suburb && (
                    <span className="block text-sm text-muted-foreground mt-1">
                      {biz.suburb}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suburbs */}
        {suburbs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-medium tracking-tight mb-4">
              Areas within {region.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {suburbs.map((s) => (
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
      </div>

      {/* ====================================================================
          CTA band
      ==================================================================== */}
      <div className="container mt-16">
        <div className="rounded-2xl bg-accent text-white px-8 py-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-medium">
            Need {label.toLowerCase()} services in {region.title}?
          </h2>
          <p className="mt-2 max-w-lg text-white/85">
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
      </div>
    </article>
  )
}