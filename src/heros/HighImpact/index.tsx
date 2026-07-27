'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  })

  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden text-white"
      data-theme="dark"
    >
      {media && typeof media === 'object' && (
        <>
          <Media
            fill
            imgClassName="object-cover"
            priority={false}
            loading="lazy"
            resource={media}
          />
          {/* Opaque dark tint so the white hero text stays legible over the photo */}
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        </>
      )}
      <div className="container relative z-10 flex flex-col items-center py-24 text-center">
        <div className="max-w-[36.5rem]">
          {richText && <RichText className="mb-8" content={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
