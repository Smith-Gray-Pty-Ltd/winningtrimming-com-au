import Link from 'next/link'
import NextImage from 'next/image'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ProjectCard } from '@/Projects/ProjectCard'
import { CompactReviewCard } from '@/components/Reviews/ReviewsSection'
import type { AssetType, Media, Project, Review } from '@/payload-types'
import type { PillarProductData } from './matrix'
import { pillarProductH1 } from './matrix'

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
 * Resolve the best image for an asset-type card. Falls back to a project
 * photo (cycling by index) when the hero image is a placeholder.
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

export const PillarProductTemplate: React.FC<{ data: PillarProductData }> = async ({ data }) => {
  const { pillar, pillarLabel, productType, suburb, region, depth, applicableAssets, nearbySuburbs } = data
  const hero = typeof productType.heroImage === 'object' && productType.heroImage !== null
    ? (productType.heroImage as Media)
    : null

  // Fetch projects + regions + reviews in parallel
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

  // Projects matching this product type — find projects tagged with this
  // service type. Falls back to any project in the same pillar if no matches.
  const matchingProjects = projects.filter((p) =>
    (p.serviceTypes ?? []).some(
      (s) => typeof s === 'object' && s !== null && s.id === productType.id,
    ),
  )
  const showcaseProjects =
    matchingProjects.length > 0 ? matchingProjects : projects

  return (
    <article className="pb-24">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${pillarLabel} ${productType.title}`,
            serviceType: `${pillarLabel} ${productType.title}`,
            provider: {
              '@type': 'LocalBusiness',
              name: 'Winning Trimming',
              telephone: '1300 799 882',
            },
            ...(suburb && region
              ? { areaServed: { '@type': 'Place', name: `${suburb.title}, ${region.title}` } }
              : {}),
          }),
        }}
      />

      {/* Depth 1 — high-impact hero */}
      {depth === 1 && (
        <section
          className="relative flex min-h-[60vh] items-end overflow-hidden text-white"
          data-theme="dark"
        >
          {hero && (
            <>
              <NextImage
                src={hero.url || ''}
                alt={hero.alt || productType.title}
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
                  {pillarProductH1(data)}
                </h1>
                {productType.intro && (
                  <p className="mt-4 text-lg text-white/85 leading-relaxed">
                    {productType.intro}
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
      )}

      {/* Breadcrumbs — standard position below the hero (all depths) */}
      <nav className="container pt-8" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-border">/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link href={`/${pillar}`} className="hover:text-primary transition-colors">{pillarLabel}</Link>
            <span className="text-border">/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link
              href={`/${pillar}/${productType.slug}`}
              className={depth > 1 ? 'hover:text-primary transition-colors' : 'text-foreground font-medium'}
            >
              {productType.title}
            </Link>
            {depth > 1 && <span className="text-border">/</span>}
          </li>
          {suburb && (
            <li><span className="text-foreground font-medium">{suburb.title}</span></li>
          )}
        </ol>
      </nav>

      {/* SEO content + review sidebar */}
      {productType.seoContent && (
        <div className="container mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* SEO text — 3/4 width */}
            <div className="lg:col-span-3">
              <div className="prose dark:prose-invert max-w-3xl text-foreground/80 leading-relaxed">
                {productType.seoContent.split('\n').map((para, i) =>
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
                  Real {productType.title.toLowerCase()} jobs we&apos;ve completed in
                  the workshop — custom builds, repairs and restorations.
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

      {/* Depth 2 — plain header */}
      {depth > 1 && (
        <header className="container mt-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            {pillarProductH1(data)}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            {productType.intro}
          </p>
          {depth === 2 && suburb && region && (
            <p className="mt-2 text-muted-foreground">
              Serving {suburb.title} and the wider {region.title} area.
            </p>
          )}
        </header>
      )}

      <div className="container">
        {/* Product body */}
        {productType.content?.body && (
          <div className="prose dark:prose-invert max-w-3xl mb-12">
            <RichText content={productType.content.body} enableGutter={false} />
          </div>
        )}

        {/* Key features */}
        {productType.content?.keyFeatures && productType.content.keyFeatures.length > 0 && (
          <div className="mb-12 max-w-3xl">
            <h2 className="text-2xl font-medium tracking-tight mb-4">What we offer</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productType.content.keyFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <span className="text-foreground/80">{f.feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vessel types that offer this product */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium tracking-tight mb-5">
            Available for these {pillarLabel.toLowerCase()} types
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {applicableAssets.map((asset, i) => {
              const img = resolveAssetTypeImage(asset, projects, i)
              return (
                <Link
                  key={asset.id}
                  href={`/${pillar}/${asset.slug}/${productType.slug}`}
                  className="group block rounded-xl border border-border bg-white overflow-hidden hover:border-primary transition-colors h-full"
                >
                  {img && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <NextImage
                        src={img.url || ''}
                        alt={img.alt || asset.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {asset.title}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Nearby suburbs (depth 2) */}
        {depth === 2 && nearbySuburbs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-medium tracking-tight mb-5">Also serving nearby</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbySuburbs.map((s) => (
                <Link
                  key={s.id}
                  href={`/${pillar}/${productType.slug}/${s.slug}`}
                  className="group block rounded-lg border border-border bg-white px-5 py-4 hover:border-primary transition-colors"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="container mt-16">
        <div className="rounded-2xl bg-accent text-white px-8 py-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-medium">
            {depth === 2 && suburb
              ? `Need ${productType.title.toLowerCase()} in ${suburb.title}?`
              : `Need ${productType.title.toLowerCase()}?`}
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