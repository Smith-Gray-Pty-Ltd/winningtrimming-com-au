import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import PageClient from './page.client'
import {
  resolveMatrix,
  resolveRegionPage,
  resolveRegionSuburbPage,
  resolveAllPillarSuburb,
  resolvePillarProduct,
  matrixH1,
  matrixDescription,
  matrixUrl,
  pillarProductH1,
  pillarProductDescription,
  regionSuburbH1,
  regionSuburbDescription,
  allPillarSuburbH1,
  allPillarSuburbDescription,
  type MatrixData,
} from '@/Matrix/matrix'
import { MatrixTemplate } from '@/Matrix/MatrixTemplate'
import { RegionTemplate } from '@/Matrix/RegionTemplate'
import { RegionSuburbTemplate } from '@/Matrix/RegionSuburbTemplate'
import { AllPillarSuburbTemplate } from '@/Matrix/AllPillarSuburbTemplate'
import { PillarProductTemplate } from '@/Matrix/PillarProductTemplate'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 3600

type Args = {
  params: Promise<{
    slug: string
    matrix: string[]
  }>
}

export default async function MatrixPage({ params: paramsPromise }: Args) {
  const { slug, matrix } = await paramsPromise

  // 1. Try vessel/product/suburb matrix
  const data = await resolveMatrix(slug, matrix)
  if (data) {
    return (
      <>
        <PageClient />
        <MatrixTemplate data={data as MatrixData} />
      </>
    )
  }

  // 2. Try pillar-level product page: /{pillar}/{product} or /{pillar}/{product}/{suburb}
  const productData = await resolvePillarProduct(slug, matrix)
  if (productData) {
    return (
      <>
        <PageClient />
        <PillarProductTemplate data={productData} />
      </>
    )
  }

  // 3. Try region page (single segment: /marine/lake-macquarie)
  if (matrix.length === 1) {
    const regionData = await resolveRegionPage(slug, matrix[0])
    if (regionData) {
      return (
        <>
          <PageClient />
          <RegionTemplate data={regionData} />
        </>
      )
    }
  }

  // 4. Try region + suburb page (two segments: /marine/lake-macquarie/toronto)
  if (matrix.length === 2) {
    const regionSuburbData = await resolveRegionSuburbPage(slug, matrix[0], matrix[1])
    if (regionSuburbData) {
      return (
        <>
          <PageClient />
          <RegionSuburbTemplate data={regionSuburbData} />
        </>
      )
    }
  }

  // 4. Try all-pillar region + suburb page (one segment: /lake-macquarie/toronto)
  //     Here slug is the region (e.g. "lake-macquarie") and matrix[0] is the suburb.
  if (matrix.length === 1) {
    const allPillarSuburbData = await resolveAllPillarSuburb(slug, matrix[0])
    if (allPillarSuburbData) {
      return (
        <>
          <PageClient />
          <AllPillarSuburbTemplate data={allPillarSuburbData} />
        </>
      )
    }
  }

  notFound()
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, matrix } = await paramsPromise
  const host = getServerSideURL()
  const canonical = `/${slug}/${matrix.join('/')}`

  // Helper: build full Metadata with OG tags
  const buildMeta = (title: string, description: string, url: string): Metadata => ({
    title: `${title} | Winning Trimming`,
    description,
    alternates: { canonical: url },
    openGraph: mergeOpenGraph({
      title: `${title} | Winning Trimming`,
      description,
      url: `${host}${url}`,
    }),
  })

  // Vessel matrix
  const data = await resolveMatrix(slug, matrix)
  if (data) {
    const asset = data.assetType as { meta?: { title?: string; description?: string; image?: unknown } }
    const product = data.productType as { meta?: { title?: string; description?: string } } | null
    const metaSource = product?.meta || asset.meta
    const title = metaSource?.title || matrixH1(data)
    const desc = metaSource?.description || matrixDescription(data)
    const url = matrixUrl(data.pillar, data.assetType.slug, data.productType?.slug, data.suburb?.slug)
    return buildMeta(title, desc, url)
  }

  // Pillar-product
  const productData = await resolvePillarProduct(slug, matrix)
  if (productData) {
    const product = productData.productType as { meta?: { title?: string; description?: string } }
    const title = product.meta?.title || pillarProductH1(productData)
    const desc = product.meta?.description || pillarProductDescription(productData)
    return buildMeta(title, desc, canonical)
  }

  // Region
  if (matrix.length === 1) {
    const regionData = await resolveRegionPage(slug, matrix[0])
    if (regionData) {
      const region = regionData.region as { meta?: { title?: string; description?: string } }
      const title = region.meta?.title || `${regionData.pillarLabel} services in ${regionData.region.title}`
      const desc = region.meta?.description || `${regionData.region.description || title}. Custom-made and repaired to last.`
      return buildMeta(title, desc, canonical)
    }
  }

  // Region + suburb (pillar-scoped)
  if (matrix.length === 2) {
    const regionSuburbData = await resolveRegionSuburbPage(slug, matrix[0], matrix[1])
    if (regionSuburbData) {
      return buildMeta(regionSuburbH1(regionSuburbData), regionSuburbDescription(regionSuburbData), canonical)
    }
  }

  // All-pillar region + suburb (e.g. /lake-macquarie/toronto)
  if (matrix.length === 1) {
    const allPillarSuburbData = await resolveAllPillarSuburb(slug, matrix[0])
    if (allPillarSuburbData) {
      return buildMeta(allPillarSuburbH1(allPillarSuburbData), allPillarSuburbDescription(allPillarSuburbData), canonical)
    }
  }

  return { title: 'Not found' }
}
