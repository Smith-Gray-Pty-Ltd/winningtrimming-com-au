'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

type ServiceType = { id: string; title: string; pillar: string }

const MAX_PHOTOS = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per image
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

type UploadedPhoto = {
  mediaId: string
  filename: string
  thumbnailUrl: string
}

/**
 * Facebook Pixel tracking helper.
 *
 * Event name must match the server-side Conversions API event (META_CAPI_EVENT_NAME,
 * default `LeadSubmitted` — the event the pixel's dataset is configured for).
 *
 * Pass the created quote id so the browser event shares its event_id with the
 * server-side Conversions API event (``quote-<id>``) — Meta then de-duplicates
 * the pair instead of counting two leads.
 */
const LEAD_EVENT = process.env.NEXT_PUBLIC_META_LEAD_EVENT || 'LeadSubmitted'

function trackLead(quoteId?: number | string) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq(
      'track',
      LEAD_EVENT,
      {},
      quoteId ? { eventID: `quote-${quoteId}` } : undefined,
    )
  }
}

function trackInitiateCheckout() {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', 'InitiateCheckout')
  }
}

const PILLAR_OPTIONS = [
  { label: 'Marine', value: 'marine' },
  { label: 'Automotive', value: 'automotive' },
  { label: 'Caravan & RV', value: 'caravan-and-rv' },
  { label: 'Trade & Industrial', value: 'trade-and-industrial' },
  { label: 'Commercial', value: 'commercial' },
]

function FacebookQuoteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Photos
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Honeypot
  const [honeypot, setHoneypot] = useState('')

  // Pre-select pillar from URL param (?pillar=marine)
  const initialPillar = searchParams.get('pillar') || ''

  // Prefill subject/location from ad deep links (?subject=...&location=...)
  const initialSubject = searchParams.get('subject') || ''
  const initialLocation = searchParams.get('location') || ''

  // Ad attribution: utm_source / utm_campaign / fbclid are saved on the quote
  const attribution = {
    source: searchParams.get('utm_source') || '',
    campaign: searchParams.get('utm_campaign') || '',
    fbclid: searchParams.get('fbclid') || '',
  }

  const [form, setForm] = useState({
    title: '',
    pillar: initialPillar,
    subject: initialSubject,
    subjectDetails: '',
    description: '',
    location: initialLocation,
    preferredDates: '',
    serviceTypeIds: [] as string[],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    source: attribution.source,
    campaign: attribution.campaign,
    fbclid: attribution.fbclid,
  })

  useEffect(() => {
    fetch('/api/service-types?limit=200&depth=0&sort=title')
      .then((r) => r.json())
      .then((data) => setServiceTypes(data.docs || []))
      .catch(() => {})
  }, [])

  const pillarServiceTypes = serviceTypes.filter(
    (st) => !form.pillar || st.pillar === form.pillar,
  )

  // -- Photo upload ----------------------------------------------------------

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos per quote.`)
      return
    }

    const toUpload = files.slice(0, remaining)

    for (const file of toUpload) {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
        setError(`"${file.name}" is not a supported image format. Please use JPG, PNG, WebP or HEIC.`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is too large. Maximum 10MB per image.`)
        return
      }
    }

    setError('')
    setUploadingPhotos(true)

    try {
      const uploaded: UploadedPhoto[] = []
      for (const file of toUpload) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('_payload', JSON.stringify({ alt: `Quote photo: ${file.name}` }))

        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || `Failed to upload ${file.name}`)
        }

        const data = await res.json()
        const doc = data.doc || data
        uploaded.push({
          mediaId: String(doc.id),
          filename: doc.filename || file.name,
          thumbnailUrl: doc.url || doc.thumbnailURL || doc.sizes?.thumbnail?.url || '',
        })
      }

      setPhotos((prev) => [...prev, ...uploaded])
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos. Please try again.')
    } finally {
      setUploadingPhotos(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removePhoto = (mediaId: string) => {
    setPhotos((prev) => prev.filter((p) => p.mediaId !== mediaId))
  }

  // -- Form submission -------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (honeypot) {
      router.push('/quote/success')
      return
    }

    if (!form.contactName.trim() || !form.contactEmail.trim() || !form.contactPhone.trim()) {
      setError('Please provide your name, email and phone number so we can contact you.')
      return
    }

    if (!form.pillar) {
      setError('Please select what you need — Marine, Automotive, Caravan & RV, etc.')
      return
    }

    setLoading(true)

    try {
      const autoTitle = form.title || `${form.contactName} — ${form.subject}`

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          pillar: form.pillar,
          subject: form.subject,
          subjectDetails: form.subjectDetails,
          description: form.description,
          location: form.location,
          preferredDates: form.preferredDates,
          serviceTypes: form.serviceTypeIds,
          subjectPhotos: photos.map((p) => ({ image: Number(p.mediaId) })),
          status: 'requested',
          // Ad attribution — recorded so staff know which campaign the enquiry came from
          source: form.source || null,
          campaign: form.campaign || null,
          fbclid: form.fbclid || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || data.errors?.[0]?.message || 'Quote request failed')
        setLoading(false)
        return
      }

      // Track Facebook Pixel Lead event (same event_id as the server CAPI event)
      trackLead(data?.doc?.id)
      router.push('/quote/success')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const toggleServiceType = (id: string) => {
    setForm((f) => ({
      ...f,
      serviceTypeIds: f.serviceTypeIds.includes(id)
        ? f.serviceTypeIds.filter((s) => s !== id)
        : [...f.serviceTypeIds, id],
    }))
  }

  const handleFieldFocus = () => {
    // Track InitiateCheckout when user starts interacting
    if (!loading) trackInitiateCheckout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2e0a] via-black to-[#0a1a05] text-white">
      {/* Facebook Pixel — loaded via MetaPixel component in layout */}
      <div className="container py-8 pb-24 max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium tracking-tight">
            Get Your Free Quote
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Custom covers, canvas &amp; upholstery — built to last.
            <br />
            Lake Macquarie · Newcastle · Central Coast
          </p>
        </div>

        {/* Attribution notice shown when arriving from an ad */}
        {form.source && (
          <p className="text-center text-[11px] text-white/30 mb-4">
            You came from a Winning Trimming ad — thanks for enquiring!
          </p>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mb-8 text-xs text-white/60">
          <span>★★★★★ Google Reviews</span>
          <span>·</span>
          <span>Same-day phone quotes</span>
          <span>·</span>
          <span>Mon–Fri 7am–3pm</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" onFocus={handleFieldFocus}>
          {/* Honeypot */}
          <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website (leave blank)</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Contact details — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                required
                placeholder="Your name"
                value={form.contactName}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00]"
              />
            </div>
            <div>
              <input
                type="tel"
                required
                placeholder="Phone number"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00]"
              />
            </div>
          </div>

          <div>
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00]"
            />
          </div>

          {/* Pillar — visual buttons */}
          <div>
            <p className="text-sm font-medium mb-2 text-white/80">What do you need?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PILLAR_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, pillar: p.value, serviceTypeIds: [] }))}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors ${
                    form.pillar === p.value
                      ? 'bg-[#607A00] text-white border-[#607A00]'
                      : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service types — only show if pillar selected */}
          {form.pillar && pillarServiceTypes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-white/80">
                Which services? <span className="text-white/40">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {pillarServiceTypes.map((st) => {
                  const selected = form.serviceTypeIds.includes(st.id)
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleServiceType(st.id)}
                      className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                        selected
                          ? 'bg-white/20 text-white border-white/40'
                          : 'bg-white/5 border-white/15 text-white/60 hover:border-white/30'
                      }`}
                    >
                      {st.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <input
              type="text"
              required
              placeholder="What is it for? (e.g. Bayliner 175, café booth, excavator seat)"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00]"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              required
              rows={3}
              placeholder="Tell us what you need done..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00] resize-none"
            />
          </div>

          {/* Location + preferred dates — compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00]"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Preferred timing (optional)"
                value={form.preferredDates}
                onChange={(e) => setForm((f) => ({ ...f, preferredDates: e.target.value }))}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#607A00]"
              />
            </div>
          </div>

          {/* Photo upload — compact */}
          <div>
            <p className="text-sm font-medium mb-2 text-white/80">
              Photos <span className="text-white/40">(optional, up to {MAX_PHOTOS})</span>
            </p>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-2">
                {photos.map((photo) => (
                  <div key={photo.mediaId} className="relative group rounded-lg overflow-hidden border border-white/20 aspect-square">
                    {photo.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={photo.thumbnailUrl} alt={photo.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <span className="text-xs text-white/40">Uploaded</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.mediaId)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < MAX_PHOTOS ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-white/40 transition-colors"
              >
                <p className="text-sm text-white/50">
                  {uploadingPhotos ? 'Uploading...' : `Add photos (${photos.length}/${MAX_PHOTOS})`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-white/50">Maximum {MAX_PHOTOS} photos reached.</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploadingPhotos}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || uploadingPhotos}
            size="lg"
            className="w-full bg-[#607A00] hover:bg-[#4e6600] text-white"
          >
            {loading ? 'Submitting...' : 'Get My Free Quote'}
          </Button>

          {/* Privacy reassurance */}
          <p className="text-xs text-white/40 text-center">
            Your details are only used to provide your quote.
            <br />
            See our <Link href="/privacy-policy" className="underline hover:text-white/60">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function FacebookQuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <FacebookQuoteForm />
    </Suspense>
  )
}