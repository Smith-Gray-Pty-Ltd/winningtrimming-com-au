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
          </div>

          {/* Right 1/3 — action card */}
          <div className="lg:col-span-1 flex lg:justify-end">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 w-full lg:max-w-xs">
              {/* CTA */}
              <div className="mb-5">
                {Array.isArray(links) && links.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {links.map(({ link }, i) => (
                      <CMSLink key={i} {...link} />
                    ))}
                  </div>
                ) : (
                  <CMSLink
                    {...{
                      type: 'custom',
                      label: 'Request a Quote',
                      url: '/contact',
                      appearance: 'default',
                    }}
                  />
                )}
              </div>

              {/* Phone */}
              <a
                href="tel:1300799882"
                className="block text-white text-lg font-medium hover:text-white/80 transition-colors mb-5"
              >
                1300 799 882
              </a>

              {/* Areas we serve */}
              <div className="pt-5 border-t border-white/20">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
                  Areas we serve
                </p>
                <p className="text-sm text-white/85 leading-relaxed">
                  Lake Macquarie &middot; Newcastle
                  <br />
                  Central Coast &middot; Hunter Valley
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
