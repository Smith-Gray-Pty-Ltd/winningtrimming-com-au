import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import PageClient from './page.client'
import {
  resolveMatrix,
  resolveRegionPage,
  resolveRegionSuburbPage,
  resolvePillarProduct,
  matrixH1,
  matrixDescription,
  matrixUrl,
  pillarProductH1,
  pillarProductDescription,
  regionSuburbH1,
  regionSuburbDescription,
  type MatrixData,
} from '@/Matrix/matrix'
import { MatrixTemplate } from '@/Matrix/MatrixTemplate'
import { RegionTemplate } from '@/Matrix/RegionTemplate'
import { RegionSuburbTemplate } from '@/Matrix/RegionSuburbTemplate'
import { PillarProductTemplate } from '@/Matrix/PillarProductTemplate'

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

  notFound()
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, matrix } = await paramsPromise

  // Vessel matrix
  const data = await resolveMatrix(slug, matrix)
  if (data) {
    const asset = data.assetType as { meta?: { title?: string; description?: string; image?: unknown } }
    const product = data.productType as { meta?: { title?: string; description?: string } } | null
    // SEO priority: product meta > asset meta > auto-generated
    const metaSource = product?.meta || asset.meta
    return {
      title: metaSource?.title || `${matrixH1(data)} | Winning Trimming`,
      description: metaSource?.description || matrixDescription(data),
      alternates: {
        canonical: matrixUrl(data.pillar, data.assetType.slug, data.productType?.slug, data.suburb?.slug),
      },
    }
  }

  // Pillar-product
  const productData = await resolvePillarProduct(slug, matrix)
  if (productData) {
    const product = productData.productType as { meta?: { title?: string; description?: string } }
    return {
      title: product.meta?.title || `${pillarProductH1(productData)} | Winning Trimming`,
      description: product.meta?.description || pillarProductDescription(productData),
      alternates: {
        canonical: `/${slug}/${matrix.join('/')}`,
      },
    }
  }

  // Region
  if (matrix.length === 1) {
    const regionData = await resolveRegionPage(slug, matrix[0])
    if (regionData) {
      const region = regionData.region as { meta?: { title?: string; description?: string } }
      const title = region.meta?.title || `${regionData.pillarLabel} services in ${regionData.region.title}`
      return {
        title: `${title} | Winning Trimming`,
        description: region.meta?.description || `${regionData.region.description || title}. Custom-made and repaired to last.`,
        alternates: { canonical: `/${slug}/${matrix[0]}` },
      }
    }
  }

  // Region + suburb
  if (matrix.length === 2) {
    const regionSuburbData = await resolveRegionSuburbPage(slug, matrix[0], matrix[1])
    if (regionSuburbData) {
      return {
        title: `${regionSuburbH1(regionSuburbData)} | Winning Trimming`,
        description: regionSuburbDescription(regionSuburbData),
        alternates: { canonical: `/${slug}/${matrix.join('/')}` },
      }
    }
  }

  return { title: 'Not found' }
}
