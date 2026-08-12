import Link from 'next/link'
import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import type { RegionPageData } from './matrix'
import { singularOf } from './matrix'

export const RegionTemplate: React.FC<{ data: RegionPageData }> = ({ data }) => {
  const { pillar, pillarLabel, region, suburbs, businesses, assetTypes } = data

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
          <li>
            <span className="text-foreground font-medium">{region.title}</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="container mt-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
          {pillarLabel} services in {region.title}
        </h1>
        {region.description && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            {region.description}
          </p>
        )}
      </header>

      <div className="container">
        {/* Region body */}
        {region.content?.body && (
          <div className="prose dark:prose-invert max-w-3xl mb-12">
            <RichText content={region.content.body} enableGutter={false} />
          </div>
        )}

        {/* Vessel / asset types */}
        {assetTypes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-medium tracking-tight mb-5">
              Browse by type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assetTypes.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/${pillar}/${asset.slug}`}
                  className="group block rounded-lg border border-border bg-white px-5 py-4 hover:border-primary transition-colors"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {asset.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

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
                <span
                  key={s.id}
                  className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-foreground"
                >
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="container mt-16">
        <div className="rounded-2xl bg-accent text-white px-8 py-12 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-medium">
            Need {pillarLabel.toLowerCase()} services in {region.title}?
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
