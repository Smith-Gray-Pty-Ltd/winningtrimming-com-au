import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Booking, Invoice, ServiceType } from '@/payload-types'
import { Button } from '@/components/ui/button'

export const revalidate = 0 // always fresh — customer-specific data

const STATUS_COLOURS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800',
  'deposit-invoiced': 'bg-yellow-100 text-yellow-800',
  'overdue-deposit': 'bg-orange-100 text-orange-800',
  'deposit-paid': 'bg-green-100 text-green-800',
  'in-progress': 'bg-teal-100 text-teal-800',
  completed: 'bg-indigo-100 text-indigo-800',
  'final-invoiced': 'bg-yellow-100 text-yellow-800',
  'overdue-final': 'bg-orange-100 text-orange-800',
  'final-paid': 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default async function BookingDetailPage({
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

  const bookingRes = await payload.find({
    collection: 'bookings',
    where: { id: { equals: id }, 'customer.id': { equals: user.id } },
    depth: 2,
    limit: 1,
    overrideAccess: false,
  })

  const booking = bookingRes.docs?.[0] as unknown as Booking | undefined
  if (!booking) notFound()

  // Fetch invoices for this booking
  const invoicesRes = await payload.find({
    collection: 'invoices',
    where: { 'booking.id': { equals: booking.id } },
    depth: 1,
    limit: 50,
    sort: 'createdAt',
    overrideAccess: false,
  })
  const invoices = invoicesRes.docs as unknown as Invoice[]

  const serviceTypes = (booking.serviceTypes || []).filter(
    (st): st is ServiceType => typeof st === 'object' && st !== null,
  )

  return (
    <div>
      {/* Back link */}
      <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 inline-block">
        &larr; Back to account
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-medium">{booking.title}</h1>
          <p className="text-muted-foreground mt-1">{booking.subject}</p>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOURS[booking.status || ''] || ''}`}>
          {(booking.status || '').replace(/-/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {booking.description && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Description</h2>
              <p className="text-sm leading-relaxed">{booking.description}</p>
            </div>
          )}

          {/* Subject details */}
          {(booking.subjectDetails || booking.location || booking.preferredDates) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Details</h2>
              <dl className="space-y-2 text-sm">
                {booking.subjectDetails && (
                  <div>
                    <dt className="inline text-muted-foreground">Subject details: </dt>
                    <dd className="inline">{booking.subjectDetails}</dd>
                  </div>
                )}
                {booking.location && (
                  <div>
                    <dt className="inline text-muted-foreground">Location: </dt>
                    <dd className="inline">{booking.location}</dd>
                  </div>
                )}
                {booking.preferredDates && (
                  <div>
                    <dt className="inline text-muted-foreground">Preferred dates: </dt>
                    <dd className="inline">{booking.preferredDates}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Invoices */}
          {invoices.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Invoices</h2>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium capitalize">{inv.type}</span>
                      {inv.dueDate && (
                        <span className="text-muted-foreground ml-2">
                          Due {new Date(inv.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        ${(inv.amount || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[inv.status || ''] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {(booking.quotedAmount != null || booking.depositAmount != null) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Pricing</h2>
              <dl className="space-y-2 text-sm">
                {booking.quotedAmount != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Quoted</dt>
                    <dd className="font-medium">
                      ${(booking.quotedAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                )}
                {booking.depositAmount != null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Deposit</dt>
                    <dd className="font-medium">
                      ${(booking.depositAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Linked quote */}
          {typeof booking.quote === 'object' && booking.quote !== null && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Original Quote</h2>
              <Link href={`/account/quotes/${booking.quote.id}`} className="text-primary text-sm hover:underline">
                View quote details &rarr;
              </Link>
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