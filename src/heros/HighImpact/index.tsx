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
      className="relative flex min-h-[70vh] items-center overflow-hidden text-white"
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
          {/* Gradient tint — darker on the left so left-aligned text stays legible */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/25"
            aria-hidden="true"
          />
        </>
      )}
      <div className="container relative z-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left 2/3 — title + subtitle, left-aligned */}
          <div className="lg:col-span-2 max-w-2xl">
            {richText && <RichText className="mb-8" content={richText} enableGutter={false} />}
            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-wrap gap-4">
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
      </div>
    </section>
  )
}
