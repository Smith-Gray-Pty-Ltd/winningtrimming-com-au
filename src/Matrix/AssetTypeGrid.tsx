import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { AssetType, ServiceType } from '@/payload-types'
import { pillarLabel } from '@/fields/pillars'

/**
 * Server component rendered on pillar landing pages (e.g. /marine). Queries
 * the AssetTypes collection for the current pillar and renders a grid of cards
 * linking into the SEO matrix. Returns null if no asset types exist for the
 * pillar, so it renders cleanly on pillars that haven't been set up yet.
 */
export const AssetTypeGrid: React.FC<{ pillar: string }> = async ({ pillar }) => {
  const payload = await getPayload({ config: configPromise })

  const res = await payload.find({
    collection: 'asset-types',
    where: { pillar: { equals: pillar } },
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })

  const assets = res.docs as AssetType[]
  if (assets.length === 0) return null

  const label = pillarLabel(pillar)

  return (
    <section className="container pt-16 pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-medium tracking-tight">
          How can we help?
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Covers, canvas, upholstery and trim — made to measure, built to last.
          Pick your {label.toLowerCase()} type below to see what we do.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => {
          const productCount = (asset.applicableProducts ?? []).filter(
            (p): p is ServiceType => typeof p === 'object' && p !== null,
          ).length

          return (
            <Link
              key={asset.id}
              href={`/${pillar}/${asset.slug}`}
              className="group block rounded-xl border border-border bg-white p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {asset.title}
                </h3>
                <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  →
                </span>
              </div>
              {asset.intro && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {asset.intro}
                </p>
              )}
              {productCount > 0 && (
                <span className="inline-block mt-4 text-xs font-medium text-primary">
                  {productCount} {productCount === 1 ? 'service' : 'services'} available
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
