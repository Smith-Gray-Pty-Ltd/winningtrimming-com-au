import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { homeStatic } from '@/endpoints/seed/home-static'

import type { Page as PageType, Media, Project, Review } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { AssetTypeGrid } from '@/Matrix/AssetTypeGrid'
import { ServiceTypeGrid } from '@/Matrix/ServiceTypeGrid'
import { AllPillarRegionTemplate } from '@/Matrix/AllPillarRegionTemplate'
import { resolveAllPillarRegion, allPillarRegionH1, allPillarRegionDescription } from '@/Matrix/matrix'
import { isValidPillar } from '@/Matrix/matrix'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { pillarLabel } from '@/fields/pillars'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { ReviewsSection, CompactReviewCard } from '@/components/Reviews/ReviewsSection'
import { ProjectCard } from '@/Projects/ProjectCard'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export const revalidate = 3600

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

/** Pillar-level hero — uses the page's hero content but with the matrix layout. */
const PillarHero: React.FC<{
  pillar: string
  heroMedia?: Media | null
  heroRichText?: any
  regions: { title: string; slug: string | null | undefined }[]
}> = ({ pillar, heroMedia, heroRichText, regions }) => {
  const label = pillarLabel(pillar)

  return (
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
          {/* Left 2/3 — title + subtitle from the page hero */}
          <div className="lg:col-span-2 max-w-2xl">
            {heroRichText && <RichText className="text-white" content={heroRichText} enableGutter={false} />}
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
                href="tel:1300799882"
                className="block text-white text-lg font-medium hover:text-white/80 transition-colors mb-5"
              >
                1300 799 882
              </a>
              <div className="pt-5 border-t border-white/20">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
                  Areas we serve
                </p>
                {regions.length > 0 ? (
                  <p className="text-sm leading-relaxed">
                    {regions.map((r, i) => (
                      <span key={r.slug}>
                        <Link
                          href={`/${pillar}/${r.slug}`}
                          className="font-medium text-white hover:text-white/70 transition-colors"
                        >
                          {r.title}
                        </Link>
                        {i < regions.length - 1 && <span className="text-white/40"> · </span>}
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
  )
}

export async function generateStaticParams() {
  try {
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
        // Exclude slugs that have their own dedicated page files or are
        // region slugs handled by the all-pillar region resolver —
        // otherwise Next.js prerenders them via this catch-all template
        // and serves the cached version instead of the dedicated page.
        const excludedSlugs = [
          'home', 'our-work', 'about',
          // Region slugs — handled by AllPillarRegionTemplate
          'parramatta-river', 'sydney-harbour', 'middle-harbour',
          'pittwater--hawkesbury', 'central-coast', 'lake-macquarie',
          'newcastle--hunter', 'port-stephens',
        ]
        return !excludedSlugs.includes(doc.slug || '')
      })
      .map(({ slug }) => {
        return { slug }
      })

    return params
  } catch {
    // During build with an empty/unmigrated DB, return no static params.
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = 'home' } = await paramsPromise
  const url = '/' + slug

  // Check if this is an all-pillar region page (e.g. /lake-macquarie)
  const regionData = await resolveAllPillarRegion(slug)
  if (regionData) {
    return (
      <>
        <PageClient />
        <AllPillarRegionTemplate data={regionData} />
      </>
    )
  }

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

  // Fetch projects and reviews for the pillar page
  let showcaseProjects: Project[] = []
  let sidebarReviews: Review[] = []
  if (showAssetGrid) {
    const payload = await getPayload({ config: configPromise })
    const [projectsRes, reviewsRes] = await Promise.all([
      payload.find({
        collection: 'projects',
        where: { pillar: { equals: slug } },
        depth: 2,
        limit: 4,
        overrideAccess: false,
        draft: false,
        sort: '-completedAt',
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
    ])
    showcaseProjects = projectsRes.docs as Project[]
    sidebarReviews = reviewsRes.docs as Review[]
  }

  return (
    <article className={hasHighImpactHero ? 'pb-24' : 'pt-16 pb-24'}>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {/* Pillar pages use the matrix-style hero; other pages use RenderHero */}
      {showAssetGrid ? (
        <PillarHero
          pillar={slug}
          heroMedia={hero?.media && typeof hero.media === 'object' ? hero.media as Media : null}
          heroRichText={hero?.richText}
          regions={await queryRegions(slug)}
        />
      ) : (
        <RenderHero {...hero} />
      )}

      {/* Pillar pages — breadcrumbs, SEO content, Our Work section */}
      {showAssetGrid && (
        <>
          {/* Breadcrumbs */}
          <nav className="container pt-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="text-border">/</span>
              </li>
              <li>
                <span className="text-foreground font-medium">{pillarLabel(slug)}</span>
              </li>
            </ol>
          </nav>

          {/* SEO content from the Pages collection + review sidebar */}
          {page.seoContent && (
            <div className="container mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* SEO text — 3/4 width */}
                <div className="lg:col-span-3">
                  <div className="prose dark:prose-invert max-w-3xl text-foreground/80 leading-relaxed">
                    {page.seoContent.split('\n').map((para, i) =>
                      para.trim() ? <p key={i}>{para}</p> : null,
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
                {sidebarReviews.length > 0 && (
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    {sidebarReviews.map((review) => (
                      <CompactReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Our Work — full-width teal band */}
          {showcaseProjects.length > 0 && (
            <section className="bg-accent text-white py-16 mt-12" data-theme="dark">
              <div className="container">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-medium tracking-tight">Our Work</h2>
                    <p className="mt-2 text-white/85 max-w-2xl">
                      Real {pillarLabel(slug).toLowerCase()} jobs we&apos;ve completed in the workshop.
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
                  {showcaseProjects.map((p, i) => (
                    <div key={p.id} className="[&_*]:text-white [&_.prose]:prose-invert">
                      <ProjectCard project={p} priority={i < 4} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {showAssetGrid && <AssetTypeGrid pillar={slug} />}
      {showAssetGrid && (
        <ServiceTypeGrid
          pillar={slug}
          customIntro={pillarCopy[slug]?.custom ?? ''}
          repairsIntro={pillarCopy[slug]?.repairs ?? ''}
        />
      )}
      <RenderBlocks blocks={layout} />

      {/* Google reviews — white section with bordered cards. Returns null if no reviews. */}
      {!showAssetGrid && (
        <section className="py-16">
          <div className="container">
            <ReviewsSection onTeal={false} />
          </div>
        </section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise

  // Check if this is an all-pillar region page (e.g. /lake-macquarie)
  const regionData = await resolveAllPillarRegion(slug)
  if (regionData) {
    const host = getServerSideURL()
    const title = allPillarRegionH1(regionData)
    const desc = allPillarRegionDescription(regionData)
    return {
      title: `${title} | Winning Trimming`,
      description: desc,
      alternates: { canonical: `/${slug}` },
      openGraph: mergeOpenGraph({
        title: `${title} | Winning Trimming`,
        description: desc,
        url: `${host}/${slug}`,
      }),
    }
  }

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
