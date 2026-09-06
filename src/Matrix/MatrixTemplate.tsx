import Link from 'next/link'
import NextImage from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ProjectCard } from '@/Projects/ProjectCard'
import { CompactReviewCard } from '@/components/Reviews/ReviewsSection'
import type { Media, Project, Review, ServiceType, AssetType } from '@/payload-types'
import type { MatrixData } from './matrix'
import { matrixH1, matrixUrl, singularOf } from './matrix'

// -- Placeholder detection (shared with ServiceTypeGrid) ------------------

/**
 * Returns true if the media looks like a generated placeholder rather than
 * a real project photo. See ServiceTypeGrid for full docs.
 */
const isPlaceholderImage = (media: Media | null): boolean => {
  if (!media) return true
  const filename = media.filename || ''
  const alt = media.alt || ''
  if (alt.startsWith('Curving abstract shapes')) return true
  return filename.startsWith('service-') || /-hero-\d+\./.test(filename)
}

/**
 * Resolve the best image for a service-type card. Falls back to the
 * featuredImage of the most recent published project tagged with the
 * service type when the service type's own hero image is a placeholder.
 */
function resolveServiceTypeImage(
  st: ServiceType,
  projects: Project[],
): Media | null {
  const ownHero =
    typeof st.heroImage === 'object' && st.heroImage !== null
      ? (st.heroImage as Media)
      : null
  if (!isPlaceholderImage(ownHero)) return ownHero

  const matching = projects.find((p) =>
    (p.serviceTypes ?? []).some(
      (s) => typeof s === 'object' && s !== null && s.id === st.id,
    ),
  )
  if (!matching) return ownHero

  const projectImage =
    typeof matching.featuredImage === 'object' && matching.featuredImage !== null
      ? (matching.featuredImage as Media)
      : null
  return projectImage || ownHero
}

/**
 * Resolve the best image for an asset-type card. Falls back to a project
 * photo (cycling by index) when the asset type's hero image is a placeholder.
 */
function resolveAssetTypeImage(
  asset: AssetType,
  projects: Project[],
  index: number,
): Media | null {
  const ownHero =
    typeof asset.heroImage === 'object' && asset.heroImage !== null
      ? (asset.heroImage as Media)
      : null
  if (!isPlaceholderImage(ownHero)) return ownHero

  const fallback = projects.length > 0 ? projects[index % projects.length] : null
  const projectImage =
    fallback &&
    typeof fallback.featuredImage === 'object' &&
    fallback.featuredImage !== null
      ? (fallback.featuredImage as Media)
      : null
  return projectImage || ownHero
}

// -- Link card ------------------------------------------------------------

type LinkCardData = {
  label: string
  href: string
  blurb?: string
  image?: Media | null
}

const LinkCard: React.FC<{ link: LinkCardData; onTeal?: boolean }> = ({
  link,
  onTeal,
}) => {
  const { label, href, blurb, image } = link
  const cardClass = onTeal
    ? 'group block rounded-xl bg-white/10 hover:bg-white/20 transition-colors overflow-hidden h-full'
    : 'group block rounded-xl border border-border bg-white hover:border-primary transition-colors overflow-hidden h-full'
  const titleClass = onTeal
    ? 'font-medium text-white group-hover:text-primary transition-colors'
    : 'font-medium text-foreground group-hover:text-primary transition-colors'
  const blurbClass = onTeal
    ? 'text-sm text-white/70 mt-1 line-clamp-2'
    : 'text-sm text-muted-foreground mt-1 line-clamp-2'

  return (
    <Link href={href} className={cardClass}>
      {image && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <NextImage
            src={image.url || ''}
            alt={image.alt || label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className={titleClass}>{label}</h3>
        {blurb && <p className={blurbClass}>{blurb}</p>}
      </div>
    </Link>
  )
}

// -- Breadcrumb -----------------------------------------------------------

const Breadcrumbs: React.FC<{ data: MatrixData }> = ({ data }) => {
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: data.pillarLabel, href: `/${data.pillar}` },
  ]
  crumbs.push({
    label: data.assetType.title,
    href: data.depth > 1 ? matrixUrl(data.pillar, data.assetType.slug) : undefined,
  })
  if (data.productType) {
    crumbs.push({
      label: data.productType.title,
      href: data.depth > 2 ? matrixUrl(data.pillar, data.assetType.slug, data.productType.slug) : undefined,
    })
  }
  if (data.suburb) {
    crumbs.push({ label: data.suburb.title })
  }

  return (
    <nav className="container pt-8" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-border">/</span>}
            {c.href ? (
              <Link href={c.href} className="hover:text-primary transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// -- Link card grid -------------------------------------------------------

const LinkGrid: React.FC<{
  heading: string
  subtitle?: string
  links: LinkCardData[]
  columns?: 2 | 3 | 4
}> = ({ heading, subtitle, links, columns = 3 }) => {
  if (links.length === 0) return null
  const colClass = columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <div className="mt-12 mb-12">
      <h2 className="text-2xl font-medium tracking-tight mb-2">{heading}</h2>
      {subtitle && (
        <p className="text-muted-foreground mb-5 max-w-2xl">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-5" />}
      <div className={`grid grid-cols-1 ${colClass} gap-4`}>
        {links.map((l) => (
          <LinkCard key={l.href} link={l} />
        ))}
      </div>
    </div>
  )
}

// -- JSON-LD --------------------------------------------------------------

const ServiceSchema: React.FC<{ data: MatrixData }> = ({ data }) => {
  const vessel = singularOf(data.assetType)
  const serviceName = data.productType
    ? `${vessel} ${data.productType.title}`
    : `${vessel} Trimming`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    serviceType: serviceName,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Winning Trimming',
      telephone: '1300 799 882',
      areaServed: ['Lake Macquarie', 'Newcastle', 'Central Coast', 'Hunter Valley'],
    },
  }

  if (data.suburb && data.region) {
    schema.areaServed = {
      '@type': 'Place',
      name: `${data.suburb.title}, ${data.region.title}`,
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// -- High-impact hero (depth 1 — vessel type pages) -----------------------

/**
 * Full-height background image with gradient overlay, H1 + subtitle, and a
 * glassmorphism action card — matching the HighImpactHero used on pillar
 * landing pages. Renders nothing at depth 2/3 (those pages use breadcrumbs
 * + a plain header instead).
 */
const MatrixHero: React.FC<{ data: MatrixData; regions: { title: string; slug: string }[] }> = ({
  data,
  regions,
}) => {
  const { assetType, pillar, pillarLabel } = data
  const hero =
    typeof assetType.heroImage === 'object' && assetType.heroImage !== null
      ? (assetType.heroImage as Media)
      : null

  return (
    <section
      className="relative flex min-h-[60vh] items-end overflow-hidden text-white"
      data-theme="dark"
    >
      {hero && (
        <>
          <NextImage
            src={hero.url || ''}
            alt={hero.alt || assetType.title}
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
          {/* Left 2/3 — title + subtitle */}
          <div className="lg:col-span-2 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
              {matrixH1(data)}
            </h1>
            {assetType.intro && (
              <p className="mt-4 text-lg text-white/85 leading-relaxed">
                {assetType.intro}
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

// -- Main template --------------------------------------------------------

export const MatrixTemplate: React.FC<{ data: MatrixData }> = async ({ data }) => {
  const { assetType, productType, suburb, region, depth, pillar, pillarLabel } = data
  const vessel = singularOf(assetType)

  // Fetch projects (for image fallbacks) + regions in parallel
  const payload = await getPayload({ config: configPromise })
  const [projectsRes, regionRes, reviewsRes] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: { pillar: { equals: pillar } },
      depth: 2,
      limit: 200,
      overrideAccess: false,
      draft: false,
      sort: '-completedAt',
    }),
    payload.find({
      collection: 'regions',
      limit: 100,
      overrideAccess: false,
      sort: 'title',
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
  const projects = projectsRes.docs as Project[]
  const reviews = reviewsRes.docs as Review[]
  const regions = regionRes.docs
    .filter((r) => {
      const pillars = r.pillars ?? []
      return pillars.length === 0 || pillars.includes(pillar as any)
    })
    .map((r) => ({ title: r.title, slug: r.slug }))

  // Applicable products — split by workType
  const allProducts = (assetType.applicableProducts ?? [])
    .filter((p): p is NonNullable<typeof p> => typeof p === 'object' && p !== null)

  const customProducts = allProducts.filter((p) => !p.workType || p.workType === 'custom')
  const repairProducts = allProducts.filter((p) => p.workType === 'repair')

  const customLinks: LinkCardData[] = customProducts.map((p) => ({
    label: p.title,
    href: `/${pillar}/${p.slug}`,
    blurb: p.intro || undefined,
    image: resolveServiceTypeImage(p, projects),
  }))

  const repairLinks: LinkCardData[] = repairProducts.map((p) => ({
    label: p.title,
    href: `/${pillar}/${p.slug}`,
    blurb: p.intro || undefined,
    image: resolveServiceTypeImage(p, projects),
  }))

  // Sibling vessels (all)
  const vesselLinks: LinkCardData[] = data.siblingAssets.map((a, i) => ({
    label: a.title,
    href: productType
      ? matrixUrl(pillar, a.slug, productType.slug)
      : matrixUrl(pillar, a.slug),
    image: resolveAssetTypeImage(a, projects, i),
  }))

  // Sibling vessels that also offer this product (depth 2)
  const vesselsWithProduct: LinkCardData[] = data.siblingAssets
    .filter((a) =>
      (a.applicableProducts ?? [])
        .filter((p): p is NonNullable<typeof p> => typeof p === 'object' && p !== null)
        .some((p) => p.slug === productType?.slug),
    )
    .map((a, i) => ({
      label: a.title,
      href: matrixUrl(pillar, a.slug, productType!.slug),
      image: resolveAssetTypeImage(a, projects, i),
    }))

  // Projects matching this asset type — find projects tagged with any of the
  // asset type's applicable service types. Falls back to any project in the
  // same pillar if no matches.
  const assetServiceTypeIds = new Set(
    allProducts.map((p) => p.id),
  )
  const matchingProjects = projects.filter((p) =>
    (p.serviceTypes ?? []).some(
      (s) => typeof s === 'object' && s !== null && assetServiceTypeIds.has(s.id),
    ),
  )
  const showcaseProjects =
    matchingProjects.length > 0
      ? matchingProjects
      : projects

  return (
    <article className="pb-24">
      <ServiceSchema data={data} />

      {/* Depth 1 — high-impact hero with action card */}
      {depth === 1 && <MatrixHero data={data} regions={regions} />}

      {/* Breadcrumbs — standard position below the hero (all depths) */}
      <Breadcrumbs data={data} />

      {/* SEO content + review sidebar */}
      {assetType.seoContent && (
        <div className="container mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* SEO text — 3/4 width */}
            <div className="lg:col-span-3">
              <div className="prose dark:prose-invert max-w-3xl text-foreground/80 leading-relaxed">
                {assetType.seoContent.split('\n').map((para, i) =>
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
            {reviews.length > 0 && (
              <div className="lg:col-span-1 flex flex-col gap-4">
                {reviews.map((review) => (
                  <CompactReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Our Work — full-width teal band showing matching projects */}
      {depth === 1 && showcaseProjects.length > 0 && (
        <section className="bg-accent text-white py-16 mt-12" data-theme="dark">
          <div className="container">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-medium tracking-tight">
                  Our Work
                </h2>
                <p className="mt-2 text-white/85 max-w-2xl">
                  Real {vessel.toLowerCase()} jobs we&apos;ve completed in the workshop —
                  covers, canvas, upholstery and repairs.
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
              {showcaseProjects.slice(0, 4).map((p, i) => (
                <div key={p.id} className="[&_*]:text-white [&_.prose]:prose-invert">
                  <ProjectCard project={p} priority={i < 4} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Depth 2/3 — plain header (no hero image) */}
      {depth > 1 && (
        <header className="container mt-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            {matrixH1(data)}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            {depth >= 2 && productType?.intro
              ? productType.intro
              : assetType.intro}
          </p>
          {depth === 3 && suburb && region && (
            <p className="mt-2 text-muted-foreground">
              Serving {suburb.title} and the wider {region.title} area.
            </p>
          )}
        </header>
      )}

      {/* Body content + key features */}
      <div className="container">
        {/* Body content from taxonomy */}
        {productType?.content?.body && (
          <div className="prose dark:prose-invert max-w-3xl mb-12">
            <RichText content={productType.content.body} enableGutter={false} />
          </div>
        )}
        {!productType && assetType.content?.body && (
          <div className="prose dark:prose-invert max-w-3xl mb-12">
            <RichText content={assetType.content.body} enableGutter={false} />
          </div>
        )}

        {/* Key features */}
        {productType?.content?.keyFeatures &&
          productType.content.keyFeatures.length > 0 && (
            <div className="mb-12 max-w-3xl">
              <h2 className="text-2xl font-medium tracking-tight mb-4">
                What we offer
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {productType.content.keyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="text-foreground/80">{f.feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {/* Custom & New Work (depth 1) — white band */}
      {depth === 1 && customLinks.length > 0 && (
        <section className="pt-16 pb-16">
          <div className="container">
            <h2 className="text-2xl font-medium tracking-tight mb-2">
              Custom &amp; New Work
            </h2>
            <p className="text-muted-foreground mb-5 max-w-2xl">
              Bespoke {vessel.toLowerCase()} covers, canvas and upholstery —
              designed and stitched from marine-grade materials.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customLinks.map((l) => (
                <LinkCard key={l.href} link={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Repairs & Restorations (depth 1) — full-bleed teal band */}
      {depth === 1 && repairLinks.length > 0 && (
        <section className="bg-accent text-white py-16" data-theme="dark">
          <div className="container">
            <h2 className="text-2xl font-medium tracking-tight mb-2">
              Repairs &amp; Restorations
            </h2>
            <p className="text-white/80 mb-5 max-w-2xl">
              Zip repairs, re-stitching, re-covering damaged vinyl and bringing
              tired trim back to life at a fraction of the replacement cost.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repairLinks.map((l) => (
                <LinkCard key={l.href} link={l} onTeal />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Remaining links */}
      <div className="container">
        {/* Vessel links for same product (depth 2) */}
        {depth === 2 && vesselsWithProduct.length > 0 && (
          <LinkGrid
            heading={`Also available for`}
            links={vesselsWithProduct}
          />
        )}

        {/* Location links (depth 2) */}
        {depth === 2 && (
          <div className="mb-12 rounded-2xl bg-muted px-8 py-8">
            <h2 className="text-xl font-medium mb-2">Areas we serve</h2>
            <p className="text-muted-foreground mb-4">
              Based in Toronto on Lake Macquarie, we cover the Lake, Newcastle,
              the Central Coast and the Hunter Valley.{' '}
              <Link href="/about" className="text-primary underline">
                Learn more about our service area
              </Link>
              .
            </p>
          </div>
        )}

        {/* Nearby suburbs (depth 3) */}
        {depth === 3 && data.nearbySuburbs.length > 0 && (
          <LinkGrid
            heading={`Also serving nearby`}
            links={data.nearbySuburbs.map((s) => ({
              label: s.title,
              href: matrixUrl(pillar, assetType.slug, productType!.slug, s.slug),
            }))}
            columns={4}
          />
        )}

        {/* All vessel types (depth 1 & 2) */}
        {(depth === 1 || depth === 2) && vesselLinks.length > 0 && (
          <LinkGrid
            heading="Looking for another vessel type?"
            subtitle="We trim, cover and upholster all kinds of boats — pick yours to see what we do."
            links={vesselLinks}
            columns={4}
          />
        )}
      </div>

      {/* CTA */}
      <div className="container mt-16">
        <div className="rounded-2xl bg-accent text-white px-8 py-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-medium">
            {depth === 3 && suburb
              ? `Need ${vessel.toLowerCase()} ${productType?.title.toLowerCase()} in ${suburb.title}?`
              : `Got a ${vessel.toLowerCase()} project?`}
          </h2>
          <p className="mt-2 max-w-lg text-white/85">
            Tell us what you need and we will provide a tailored quote.
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
