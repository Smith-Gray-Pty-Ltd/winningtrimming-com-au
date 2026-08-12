import Link from 'next/link'
import NextImage from 'next/image'
import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import type { Media } from '@/payload-types'
import type { PillarProductData } from './matrix'
import { pillarProductH1 } from './matrix'

export const PillarProductTemplate: React.FC<{ data: PillarProductData }> = ({ data }) => {
  const { pillar, pillarLabel, productType, suburb, region, depth, applicableAssets, nearbySuburbs } = data
  const hero = typeof productType.heroImage === 'object' && productType.heroImage !== null
    ? (productType.heroImage as Media)
    : null

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

      {/* Hero (depth 1 — pillar-product pages) */}
      {depth === 1 && hero && (
        <section className="relative w-full aspect-[16/9] overflow-hidden">
          <NextImage
            src={hero.url || ''}
            alt={hero.alt || productType.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </section>
      )}

      {/* Breadcrumbs */}
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

      {/* Header */}
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
            {applicableAssets.map((asset) => (
              <Link
                key={asset.id}
                href={`/${pillar}/${asset.slug}/${productType.slug}`}
                className="group block rounded-lg border border-border bg-white px-5 py-4 hover:border-primary transition-colors"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {asset.title}
                </span>
              </Link>
            ))}
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