import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import PageClient from './page.client'
import {
  resolveMatrix,
  resolveRegionPage,
  matrixH1,
  matrixDescription,
  matrixUrl,
  type MatrixData,
} from '@/Matrix/matrix'
import { MatrixTemplate } from '@/Matrix/MatrixTemplate'
import { RegionTemplate } from '@/Matrix/RegionTemplate'

export const revalidate = 3600

type Args = {
  params: Promise<{
    slug: string
    matrix: string[]
  }>
}

export default async function MatrixPage({ params: paramsPromise }: Args) {
  const { slug, matrix } = await paramsPromise

  // Try vessel/product/suburb matrix first
  const data = await resolveMatrix(slug, matrix)

  if (data) {
    return (
      <>
        <PageClient />
        <MatrixTemplate data={data as MatrixData} />
      </>
    )
  }

  // Try region page (single segment only: /marine/lake-macquarie)
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
  const data = await resolveMatrix(slug, matrix)

  if (data) {
    return {
      title: `${matrixH1(data)} | Winning Trimming`,
      description: matrixDescription(data),
      alternates: {
        canonical: matrixUrl(
          data.pillar,
          data.assetType.slug,
          data.productType?.slug,
          data.suburb?.slug,
        ),
      },
    }
  }

  // Region page metadata
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
