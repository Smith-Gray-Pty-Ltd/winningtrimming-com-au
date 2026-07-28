import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import PageClient from './page.client'
import { resolveMatrix, matrixH1, matrixDescription, matrixUrl, type MatrixData } from '@/Matrix/matrix'
import { MatrixTemplate } from '@/Matrix/MatrixTemplate'

export const revalidate = 3600

type Args = {
  params: Promise<{
    slug: string
    matrix: string[]
  }>
}

export default async function MatrixPage({ params: paramsPromise }: Args) {
  const { slug, matrix } = await paramsPromise

  const data = await resolveMatrix(slug, matrix)

  if (!data) {
    notFound()
  }

  return (
    <>
      <PageClient />
      <MatrixTemplate data={data as MatrixData} />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, matrix } = await paramsPromise
  const data = await resolveMatrix(slug, matrix)

  if (!data) {
    return { title: 'Not found' }
  }

  const title = `${matrixH1(data)} | Winning Trimming`

  return {
    title,
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
