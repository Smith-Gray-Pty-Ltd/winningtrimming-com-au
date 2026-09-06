'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

export default function QuoteForm() {
  const router = useRouter()
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Photos
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Honeypot — bots fill this, humans don't
  const [honeypot, setHoneypot] = useState('')

  const [form, setForm] = useState({
    title: '',
    pillar: '',
    subject: '',
    subjectDetails: '',
    description: '',
    location: '',
    preferredDates: '',
    serviceTypeIds: [] as string[],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
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

    // Validate files
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
      // Upload each file to /api/media
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
      // Reset file input so the same file can be selected again
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

    // Honeypot check — if filled, silently "succeed" but don't submit
    if (honeypot) {
      router.push('/quote/success')
      return
    }

    // Validate contact details
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
      // Auto-generate title from contact name + subject
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
          subjectPhotos: photos.map((p) => ({ image: p.mediaId })),
          status: 'requested',
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || data.errors?.[0]?.message || 'Quote request failed')
        setLoading(false)
        return
      }

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

  return (
    <div className="container py-8 pb-24 min-h-[60vh]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-medium mb-1">Request a Quote</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Tell us about your job and we&apos;ll send you a quote.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot — hidden from humans */}
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

          {/* Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                id="contactName"
                type="text"
                required
                placeholder="John Smith"
                value={form.contactName}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium mb-1">
                Phone
              </label>
              <input
                id="contactPhone"
                type="tel"
                required
                placeholder="0400 123 456"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="contactEmail"
              type="email"
              required
              placeholder="john@example.com"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Pillar */}
          <div>
            <label className="block text-sm font-medium mb-2">What do you need?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Marine', value: 'marine' },
                { label: 'Automotive', value: 'automotive' },
                { label: 'Caravan & RV', value: 'caravan-and-rv' },
                { label: 'Trade & Industrial', value: 'trade-and-industrial' },
                { label: 'Commercial', value: 'commercial' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, pillar: p.value, serviceTypeIds: [] }))}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                    form.pillar === p.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {!form.pillar && (
              <p className="mt-2 text-xs text-muted-foreground">Please select one</p>
            )}
          </div>

          {/* Service types */}
          {form.pillar && pillarServiceTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Which services? <span className="text-muted-foreground">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {pillarServiceTypes.map((st) => {
                  const selected = form.serviceTypeIds.includes(st.id)
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleServiceType(st.id)}
                      className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                        selected
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background border-border hover:border-accent'
                      }`}
                    >
                      {st.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Title — optional, auto-generated from name + subject */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Job Title <span className="text-muted-foreground">(optional — we&apos;ll auto-generate if left blank)</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Bimini replacement for Bayliner 175"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              What is it for?
            </label>
            <input
              id="subject"
              type="text"
              required
              placeholder="e.g. Bayliner 175 bowrider, café booth seating, CAT 320 excavator"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Describe the job
            </label>
            <textarea
              id="description"
              required
              rows={4}
              placeholder="Tell us what you need done..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Location + preferred dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Toronto, Lake Macquarie"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="preferredDates" className="block text-sm font-medium mb-1">
                Preferred Timing
              </label>
              <input
                id="preferredDates"
                type="text"
                placeholder="e.g. Before October"
                value={form.preferredDates}
                onChange={(e) => setForm((f) => ({ ...f, preferredDates: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Subject details */}
          <div>
            <label htmlFor="subjectDetails" className="block text-sm font-medium mb-1">
              Additional details <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="subjectDetails"
              rows={2}
              placeholder="Length, model, stored at, colour preferences, etc."
              value={form.subjectDetails}
              onChange={(e) => setForm((f) => ({ ...f, subjectDetails: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Photos <span className="text-muted-foreground">(optional, up to {MAX_PHOTOS})</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Add photos of the job so we can give you a more accurate quote. JPG, PNG, WebP or HEIC. Max 10MB per image.
            </p>

            {/* Thumbnail grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {photos.map((photo) => (
                  <div key={photo.mediaId} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                    {photo.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Uploaded</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.mediaId)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {photos.length < MAX_PHOTOS ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <p className="text-sm text-muted-foreground">
                  {uploadingPhotos
                    ? 'Uploading...'
                    : `Click to add photos (${photos.length}/${MAX_PHOTOS})`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Maximum {MAX_PHOTOS} photos reached.
              </p>
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
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading || uploadingPhotos} size="lg" className="w-full">
            {loading ? 'Submitting...' : 'Request Quote'}
          </Button>
        </form>
      </div>
    </div>
  )
}