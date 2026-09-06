import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'
import type { Review } from '@/payload-types'

// -- Star rating ------------------------------------------------------------

export const Stars: React.FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-current opacity-20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// -- Review card -------------------------------------------------------------

const ReviewCard: React.FC<{ review: Review; onTeal?: boolean }> = ({ review, onTeal }) => {
  const cardClass = onTeal
    ? 'rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-6 flex flex-col h-full'
    : 'rounded-2xl border border-border bg-white p-6 flex flex-col h-full'

  const nameClass = onTeal ? 'font-medium text-white' : 'font-medium text-foreground'
  const textClass = onTeal ? 'text-white/85 leading-relaxed flex-1' : 'text-muted-foreground leading-relaxed flex-1'
  const dateClass = onTeal ? 'text-white/50 text-sm' : 'text-muted-foreground/70 text-sm'

  const card = (
    <div className={cardClass}>
      <div className="flex items-start gap-3 mb-3">
        {review.authorPhoto && typeof review.authorPhoto === 'object' ? (
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <Media
              imgClassName="w-full h-full object-cover"
              resource={review.authorPhoto}
            />
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${onTeal ? 'bg-white/20' : 'bg-muted'}`}>
            <span className={`text-sm font-medium ${onTeal ? 'text-white' : 'text-muted-foreground'}`}>
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className={nameClass}>{review.authorName}</p>
          <Stars rating={review.rating} className={onTeal ? 'text-white' : 'text-foreground'} />
        </div>
        {review.source === 'google' && (
          <span className="ml-auto shrink-0 text-xs">
            <span className={onTeal ? 'text-white/50' : 'text-muted-foreground/60'}>Google</span>
          </span>
        )}
      </div>
      <p className={textClass}>{review.text}</p>
      {review.reviewDate && (
        <p className={`${dateClass} mt-4`}>
          {new Date(review.reviewDate).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  )

  if (review.googlePlaceUrl) {
    return (
      <a
        href={review.googlePlaceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block transition-shadow hover:shadow-md rounded-2xl h-full ${onTeal ? 'hover:bg-white/15' : ''}`}
      >
        {card}
      </a>
    )
  }

  return card
}

// -- Compact review card (for sidebars) -------------------------------------

export const CompactReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const card = (
    <div className="rounded-2xl border border-border bg-white p-5 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        {review.authorPhoto && typeof review.authorPhoto === 'object' ? (
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <Media
              imgClassName="w-full h-full object-cover"
              resource={review.authorPhoto}
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
            <span className="text-xs font-medium text-muted-foreground">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm">{review.authorName}</p>
          <Stars rating={review.rating} className="text-foreground" />
        </div>
        {review.source === 'google' && (
          <span className="shrink-0 text-xs text-muted-foreground/60">Google</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-4">
        {review.text}
      </p>
    </div>
  )

  if (review.googlePlaceUrl) {
    return (
      <a
        href={review.googlePlaceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-shadow hover:shadow-md rounded-2xl h-full"
      >
        {card}
      </a>
    )
  }

  return card
}

// -- Section -----------------------------------------------------------------

export const ReviewsSection: React.FC<{
  /** Use teal background to match other sections on the page. */
  onTeal?: boolean
  /** Max number of reviews to show. */
  limit?: number
  /** Optional heading override. */
  heading?: string
}> = async ({ onTeal = true, limit = 4, heading = 'What our customers say' }) => {
  const payload = await getPayload({ config: configPromise })

  const res = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        { hidden: { not_equals: true } },
        { rating: { equals: 5 } },
      ],
    },
    depth: 1,
    limit,
    overrideAccess: false,
    sort: '-featured,-reviewDate',
  })

  const reviews = res.docs as Review[]
  if (reviews.length === 0) return null

  return (
    <div className={onTeal ? 'text-white' : 'text-foreground'}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-medium tracking-tight">{heading}</h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Stars rating={5} className={onTeal ? 'text-yellow-400' : 'text-yellow-500'} />
          <span className={`text-sm ${onTeal ? 'text-white/70' : 'text-muted-foreground'}`}>
            Rated 5 stars on Google
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onTeal={onTeal} />
        ))}
      </div>
    </div>
  )
}