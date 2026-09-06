/**
 * Fetch Google reviews from the Places API (New) and sync them into the
 * Payload Reviews collection. Designed to run via cron on the Hostinger VPS.
 *
 * Required env vars (set in .env or pass at runtime):
 *   GOOGLE_PLACES_API_KEY  — API key with Places API (New) enabled
 *   GOOGLE_PLACE_ID         — The Place ID for your business listing
 *   PAYLOAD_URL             — Base URL of the Payload app (e.g. http://localhost:3000)
 *   PAYLOAD_ADMIN_EMAIL     — Admin login email
 *   PAYLOAD_ADMIN_PASSWORD  — Admin login password
 *
 * Usage:
 *   pnpm tsx src/scripts/fetch-google-reviews.ts
 *
 * Cron (daily at 6am):
 *   0 6 * * * cd /app && pnpm tsx src/scripts/fetch-google-reviews.ts >> /var/log/reviews-sync.log 2>&1
 *
 * Note: Google's Place Details endpoint returns up to 5 most relevant reviews
 * per request. To fetch all reviews, use the Google Business Profile API
 * (requires OAuth and a verified GBP account) and extend this script.
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID
const PAYLOAD_URL = process.env.PAYLOAD_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const PAYLOAD_ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL
const PAYLOAD_ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD

// Places API (New) — Place Details endpoint
const PLACE_DETAILS_URL = `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}`
const FIELD_MASK = 'reviews,rating,userRatingCount,displayName'

interface GoogleReview {
  authorAttribution?: {
    displayName: string
    photoUri?: string
    uri?: string
  }
  rating: number
  originalText: { text: string }
  publishTime: string
  name: string // e.g. "places/ChIJ.../reviews/Ci9DQUlR..."
}

interface PlaceResponse {
  reviews?: GoogleReview[]
  rating?: number
  userRatingCount?: number
  displayName?: string
}

async function main() {
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    console.error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID')
    process.exit(1)
  }
  if (!PAYLOAD_ADMIN_EMAIL || !PAYLOAD_ADMIN_PASSWORD) {
    console.error('Missing PAYLOAD_ADMIN_EMAIL or PAYLOAD_ADMIN_PASSWORD')
    process.exit(1)
  }

  // 1. Login to Payload
  console.log(`[reviews-sync] Logging into ${PAYLOAD_URL}...`)
  const loginRes = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: PAYLOAD_ADMIN_EMAIL,
      password: PAYLOAD_ADMIN_PASSWORD,
    }),
  })
  if (!loginRes.ok) {
    console.error(`[reviews-sync] Login failed: ${loginRes.status} ${await loginRes.text()}`)
    process.exit(1)
  }
  const setCookie = loginRes.headers.get('set-cookie')
  const cookie = setCookie ? setCookie.split(';')[0] : ''
  console.log('[reviews-sync] Logged in.')

  // 2. Fetch reviews from Google Places API (New)
  console.log(`[reviews-sync] Fetching reviews for Place ID ${GOOGLE_PLACE_ID}...`)
  const placesRes = await fetch(PLACE_DETAILS_URL, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
  })
  if (!placesRes.ok) {
    console.error(`[reviews-sync] Places API failed: ${placesRes.status} ${await placesRes.text()}`)
    process.exit(1)
  }
  const place: PlaceResponse = await placesRes.json()
  const reviews = place.reviews || []
  console.log(`[reviews-sync] Got ${reviews.length} reviews from Google. Business rating: ${place.rating} (${place.userRatingCount} reviews)`)

  if (reviews.length === 0) {
    console.log('[reviews-sync] No reviews to sync.')
    return
  }

  // 3. Fetch existing reviews to check for duplicates
  const existingRes = await fetch(`${PAYLOAD_URL}/api/reviews?limit=500&depth=0`, {
    headers: { Cookie: cookie },
  })
  if (!existingRes.ok) {
    console.error(`[reviews-sync] Failed to fetch existing reviews: ${existingRes.status}`)
    process.exit(1)
  }
  const existing = await existingRes.json() as { docs: { googleReviewId?: string }[] }
  const existingIds = new Set(
    (existing.docs || []).map((d) => d.googleReviewId).filter(Boolean),
  )

  // 4. Upload a photo if the review has one, then create the review
  let created = 0
  let skipped = 0

  for (const review of reviews) {
    const authorName = review.authorAttribution?.displayName || 'Anonymous'
    const photoUri = review.authorAttribution?.photoUri
    const authorUrl = '' // Don't use the reviewer's profile URL — use the business listing instead
    // Use the full `name` field as the dedup key — it's stable and unique
    const googleReviewId = review.name

    if (existingIds.has(googleReviewId)) {
      console.log(`[reviews-sync] Skipping duplicate: ${authorName}`)
      skipped++
      continue
    }

    // Upload the author photo if available
    let photoId: number | null = null
    if (photoUri) {
      try {
        const photoRes = await fetch(photoUri)
        if (photoRes.ok) {
          const photoBlob = await photoRes.blob()
          const formData = new FormData()
          formData.append('file', photoBlob, `${authorName.replace(/\s+/g, '-').toLowerCase()}.jpg`)
          formData.append('_payload', JSON.stringify({ alt: `${authorName} — Google review profile photo` }))

          const uploadRes = await fetch(`${PAYLOAD_URL}/api/media`, {
            method: 'POST',
            headers: { Cookie: cookie },
            body: formData,
          })
          if (uploadRes.ok) {
            const uploaded = await uploadRes.json() as { doc: { id: number } }
            photoId = uploaded.doc.id
            console.log(`[reviews-sync] Uploaded photo for ${authorName} → media ${photoId}`)
          }
        }
      } catch (e) {
        console.warn(`[reviews-sync] Could not upload photo for ${authorName}: ${e}`)
      }
    }

    // Create the review — link to the business listing, not the reviewer's profile
    const reviewData: Record<string, unknown> = {
      authorName,
      rating: review.rating,
      text: review.originalText.text,
      reviewDate: new Date(review.publishTime).toISOString(),
      source: 'google',
      googleReviewId,
      googlePlaceUrl: `https://www.google.com/maps/search/?api=1&query=Winning+Trimming+Toronto+NSW`,
      featured: false,
      hidden: false,
    }
    if (photoId) reviewData.authorPhoto = photoId

    const createRes = await fetch(`${PAYLOAD_URL}/api/reviews?overrideAccess=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify(reviewData),
    })
    if (createRes.ok) {
      console.log(`[reviews-sync] Created review: ${authorName} (${review.rating}★)`)
      created++
    } else {
      console.error(`[reviews-sync] Failed to create review for ${authorName}: ${createRes.status} ${await createRes.text()}`)
    }
  }

  console.log(`[reviews-sync] Done. Created: ${created}, Skipped (duplicates): ${skipped}`)
}

main().catch((err) => {
  console.error('[reviews-sync] Fatal error:', err)
  process.exit(1)
})