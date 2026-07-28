import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import PageClient from './page.client'
import {
  resolveMatrix,
  resolveRegionPage,
  resolvePillarProduct,
  matrixH1,
  matrixDescription,
  matrixUrl,
  pillarProductH1,
  pillarProductDescription,
  type MatrixData,
} from '@/Matrix/matrix'
import { MatrixTemplate } from '@/Matrix/MatrixTemplate'
import { RegionTemplate } from '@/Matrix/RegionTemplate'
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

  notFound()
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, matrix } = await paramsPromise

  // Vessel matrix
  const data = await resolveMatrix(slug, matrix)
  if (data) {
    return {
      title: `${matrixH1(data)} | Winning Trimming`,
      description: matrixDescription(data),
      alternates: {
        canonical: matrixUrl(data.pillar, data.assetType.slug, data.productType?.slug, data.suburb?.slug),
      },
    }
  }

  // Pillar-product
  const productData = await resolvePillarProduct(slug, matrix)
  if (productData) {
    return {
      title: `${pillarProductH1(productData)} | Winning Trimming`,
      description: pillarProductDescription(productData),
      alternates: {
        canonical: `/${slug}/${matrix.join('/')}`,
      },
    }
  }

  // Region
  if (matrix.length === 1) {
    const regionData = await resolveRegionPage(slug, matrix[0])
    if (regionData) {
      const title = `${regionData.pillarLabel} services in ${regionData.region.title}`
      return {
        title: `${title} | Winning Trimming`,
        description: `${regionData.region.description || title}. Custom-made and repaired to last.`,
        alternates: { canonical: `/${slug}/${matrix[0]}` },
      }
    }
  }

  return { title: 'Not found' }
}
