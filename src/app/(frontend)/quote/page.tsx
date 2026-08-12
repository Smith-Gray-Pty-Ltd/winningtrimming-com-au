'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type ServiceType = { id: string; title: string; pillar: string }

export default function QuoteForm() {
  const router = useRouter()
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    pillar: '',
    subject: '',
    subjectDetails: '',
    description: '',
    location: '',
    preferredDates: '',
    serviceTypeIds: [] as string[],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First ensure the customer is logged in
      const meRes = await fetch('/api/customers/me')
      if (!meRes.ok) {
        router.push('/account/login')
        return
      }
      const meData = await meRes.json()
      const customerId = meData?.user?.id

      if (!customerId) {
        router.push('/account/login')
        return
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          customer: customerId,
          pillar: form.pillar,
          subject: form.subject,
          subjectDetails: form.subjectDetails,
          description: form.description,
          location: form.location,
          preferredDates: form.preferredDates,
          serviceTypes: form.serviceTypeIds,
          status: 'requested',
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || data.errors?.[0]?.message || 'Quote request failed')
        setLoading(false)
        return
      }

      router.push('/account?tab=quotes')
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

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Job Title
            </label>
            <input
              id="title"
              type="text"
              required
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Submitting...' : 'Request Quote'}
          </Button>
        </form>
      </div>
    </div>
  )
}