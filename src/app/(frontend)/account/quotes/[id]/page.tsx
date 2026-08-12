import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Quote, ServiceType } from '@/payload-types'
import { Button } from '@/components/ui/button'

const STATUS_COLOURS: Record<string, string> = {
  requested: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-purple-100 text-purple-800',
  quoted: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const headerList = await headers()
  const { user } = await payload.auth({ headers: headerList })

  if (!user || user.collection !== 'customers') {
    redirect('/account/login')
  }

  const quoteRes = await payload.find({
    collection: 'quotes',
    where: { id: { equals: id }, 'customer.id': { equals: user.id } },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })

  const quote = quoteRes.docs?.[0] as unknown as Quote | undefined
  if (!quote) notFound()

  const serviceTypes = (quote.serviceTypes || []).filter(
    (st): st is ServiceType => typeof st === 'object' && st !== null,
  )

  const canAccept = quote.status === 'quoted'

  return (
    <div>
      <Link href="/account?tab=quotes" className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-block">
        &larr; Back to quotes
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-medium">{quote.title}</h1>
          <p className="text-muted-foreground mt-1">{quote.subject}</p>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOURS[quote.status || ''] || ''}`}>
          {quote.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {quote.description && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Description</h2>
              <p className="text-sm leading-relaxed">{quote.description}</p>
            </div>
          )}

          {(quote.subjectDetails || quote.location || quote.preferredDates) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Details</h2>
              <dl className="space-y-2 text-sm">
                {quote.subjectDetails && (
                  <div>
                    <dt className="inline text-muted-foreground">Subject details: </dt>
                    <dd className="inline">{quote.subjectDetails}</dd>
                  </div>
                )}
                {quote.location && (
                  <div>
                    <dt className="inline text-muted-foreground">Location: </dt>
                    <dd className="inline">{quote.location}</dd>
                  </div>
                )}
                {quote.preferredDates && (
                  <div>
                    <dt className="inline text-muted-foreground">Preferred dates: </dt>
                    <dd className="inline">{quote.preferredDates}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Quote details from staff */}
          {quote.quoteNotes && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Quote Notes</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{quote.quoteNotes}</p>
            </div>
          )}

          {/* Linked booking */}
          {typeof quote.booking === 'object' && quote.booking !== null && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Booking</h2>
              <Link href={`/account/bookings/${quote.booking.id}`} className="text-primary text-sm hover:underline">
                View booking details &rarr;
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Pricing */}
          {(quote.quotedAmount != null || quote.depositAmount != null) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Pricing</h2>
              <dl className="space-y-2 text-sm">
                {quote.quotedAmount != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Quoted</dt>
                    <dd className="font-medium">
                      ${(quote.quotedAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                )}
                {quote.depositAmount != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Deposit (50%)</dt>
                    <dd className="font-medium">
                      ${(quote.depositAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Service types */}
          {serviceTypes.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Services</h2>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((st) => (
                  <span
                    key={st.id}
                    className="inline-block rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium"
                  >
                    {st.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}