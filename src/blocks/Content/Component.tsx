import { cn } from 'src/utilities/cn'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { background, columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  // Teal band: brand teal background with white text. Reuses the data-theme="dark"
  // scoping so RichText (prose-invert) and dark: utilities render light-on-teal.
  const isTeal = background === 'teal'

  return (
    <div
      className={cn('py-16', isTeal && 'bg-accent text-white')}
      {...(isTeal ? { 'data-theme': 'dark' } : {})}
    >
      <div className="container">
        <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                  })}
                  key={index}
                >
                  {richText && <RichText content={richText} enableGutter={false} />}

                  {enableLink && <CMSLink {...link} />}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
