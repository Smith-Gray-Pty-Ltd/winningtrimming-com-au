import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { AssetType, ServiceType } from '@/payload-types'
import { pillarLabel } from '@/fields/pillars'

/**
 * Full-bleed teal band rendered below the AssetTypeGrid on pillar pages.
 * Shows the product/service types for the pillar (e.g. Weather Covers, Bimini
 * Tops) as compact cards. Each links to the first vessel (alphabetically) that
 * offers it, dropping the user into the SEO matrix.
 *
 * Returns null if no service types exist for the pillar.
 */
export const ServiceTypeGrid: React.FC<{ pillar: string }> = async ({ pillar }) => {
  const payload = await getPayload({ config: configPromise })

  const [typesRes, assetsRes] = await Promise.all([
    payload.find({
      collection: 'service-types',
      where: { pillar: { equals: pillar } },
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
    payload.find({
      collection: 'asset-types',
      where: { pillar: { equals: pillar } },
      depth: 2,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
  ])

  const serviceTypes = typesRes.docs as ServiceType[]
  if (serviceTypes.length === 0) return null

  const assets = assetsRes.docs as AssetType[]

  // First vessel (alphabetically) that offers this product — for the link
  const vesselForProduct = (productSlug: string): AssetType | undefined =>
    assets.find((a) =>
      (a.applicableProducts ?? [])
        .filter((p): p is ServiceType => typeof p === 'object' && p !== null)
        .some((p) => p.slug === productSlug),
    )

  const label = pillarLabel(pillar)

  return (
    <section className="bg-accent text-white py-16" data-theme="dark">
      <div className="container">
        <div className="mb-8">
          <h2 className="text-3xl font-medium tracking-tight">
            What we do
          </h2>
          <p className="mt-2 text-white/80 max-w-2xl">
            Every cover stitched to fit, every panel pulled tight — built tough
            for Australian conditions. See something you need? Get a quote.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceTypes.map((st) => {
            const vessel = vesselForProduct(st.slug)
            const href = vessel
              ? `/${pillar}/${vessel.slug}/${st.slug}`
              : null

            const inner = (
              <>
                <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                  {st.title}
                </h3>
                {st.intro && (
                  <p className="text-sm text-white/70 mt-1 line-clamp-2">
                    {st.intro}
                  </p>
                )}
              </>
            )

            const className =
              'group block rounded-lg bg-white/10 hover:bg-white/20 transition-colors p-5 h-full'

            return href ? (
              <Link key={st.id} href={href} className={className}>
                {inner}
              </Link>
            ) : (
              <div key={st.id} className={className}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
