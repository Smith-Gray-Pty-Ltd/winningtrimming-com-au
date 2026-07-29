import Link from 'next/link'
import NextImage from 'next/image'
import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import type { MatrixData } from './matrix'
import { matrixH1, matrixUrl, singularOf } from './matrix'

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
  links: { label: string; href: string; blurb?: string }[]
  columns?: 2 | 3 | 4
}> = ({ heading, links, columns = 3 }) => {
  if (links.length === 0) return null
  const colClass = columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium tracking-tight mb-5">{heading}</h2>
      <div className={`grid grid-cols-1 ${colClass} gap-4`}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group block rounded-lg border border-border bg-white px-5 py-4 hover:border-primary transition-colors"
          >
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
              {l.label}
            </span>
            {l.blurb && (
              <span className="block text-sm text-muted-foreground mt-1">{l.blurb}</span>
            )}
          </Link>
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

// -- Main template --------------------------------------------------------

export const MatrixTemplate: React.FC<{ data: MatrixData }> = ({ data }) => {
  const { assetType, productType, suburb, region, depth, pillar, pillarLabel } = data
  const vessel = singularOf(assetType)

  // Applicable products — split by workType
  const allProducts = (assetType.applicableProducts ?? [])
    .filter((p): p is NonNullable<typeof p> => typeof p === 'object' && p !== null)

  const customProducts = allProducts.filter((p) => !p.workType || p.workType === 'custom')
  const repairProducts = allProducts.filter((p) => p.workType === 'repair')

  const customLinks = customProducts.map((p) => ({
    label: p.title,
    href: `/${pillar}/${p.slug}`,
    blurb: p.intro,
  }))

  const repairLinks = repairProducts.map((p) => ({
    label: p.title,
    href: `/${pillar}/${p.slug}`,
    blurb: p.intro,
  }))

  // Sibling vessels (all)
  const vesselLinks = data.siblingAssets.map((a) => ({
    label: a.title,
    href: productType
      ? matrixUrl(pillar, a.slug, productType.slug)
      : matrixUrl(pillar, a.slug),
  }))

  // Sibling vessels that also offer this product (depth 2)
  const vesselsWithProduct = data.siblingAssets
    .filter((a) =>
      (a.applicableProducts ?? [])
        .filter((p): p is NonNullable<typeof p> => typeof p === 'object' && p !== null)
        .some((p) => p.slug === productType?.slug),
    )
    .map((a) => ({
      label: a.title,
      href: matrixUrl(pillar, a.slug, productType!.slug),
    }))

  return (
    <article className="pb-24">
      <ServiceSchema data={data} />

      {/* Hero (depth 1 — vessel type pages) */}
      {depth === 1 && assetType.heroImage && typeof assetType.heroImage === 'object' && (
        <section
          className="relative min-h-[50vh] flex items-center overflow-hidden text-white"
          data-theme="dark"
        >
          <NextImage
            src={assetType.heroImage.url || ''}
            alt={assetType.heroImage.alt || assetType.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" aria-hidden="true" />
          <div className="container relative z-10 py-20">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-medium tracking-tight">
                {matrixH1(data)}
              </h1>
              <p className="mt-4 text-lg text-white/85">
                {assetType.intro}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs data={data} />

      {/* Hero */}
      <header className="container mt-6 mb-12">
        {/* Only show H1 + subtitle here if no hero image rendered them above */}
        {!(depth === 1 && assetType.heroImage && typeof assetType.heroImage === 'object') && (
          <>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
              {matrixH1(data)}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              {depth >= 2 && productType?.intro
                ? productType.intro
                : assetType.intro}
            </p>
          </>
        )}
        {depth === 3 && suburb && region && (
          <p className="mt-2 text-muted-foreground">
            Serving {suburb.title} and the wider {region.title} area.
          </p>
        )}
      </header>

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
        <section className="pt-4 pb-16">
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
                <Link
                  key={l.href}
                  href={l.href}
                  className="group block rounded-lg border border-border bg-white px-5 py-4 hover:border-primary transition-colors"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {l.label}
                  </span>
                  {l.blurb && (
                    <span className="block text-sm text-muted-foreground mt-1 line-clamp-2">
                      {l.blurb}
                    </span>
                  )}
                </Link>
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
                <Link
                  key={l.href}
                  href={l.href}
                  className="group block rounded-lg bg-white/10 hover:bg-white/20 transition-colors px-5 py-4"
                >
                  <span className="font-medium text-white group-hover:text-primary transition-colors">
                    {l.label}
                  </span>
                  {l.blurb && (
                    <span className="block text-sm text-white/70 mt-1 line-clamp-2">
                      {l.blurb}
                    </span>
                  )}
                </Link>
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
            heading={depth === 1 ? `Other ${pillarLabel.toLowerCase()} types` : `Other vessel types`}
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
                url: '/contact',
                appearance: 'default',
              }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
