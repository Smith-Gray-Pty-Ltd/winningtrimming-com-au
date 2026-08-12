import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import type { Booking, Invoice, Quote } from '@/payload-types'

const QUOTE_STATUS_COLOURS: Record<string, string> = {
  requested: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-purple-100 text-purple-800',
  quoted: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
}

const BOOKING_STATUS_COLOURS: Record<string, string> = {
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

const INVOICE_STATUS_COLOURS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  void: 'bg-gray-100 text-gray-600',
}

export default async function AccountDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab || 'dashboard'

  const payload = await getPayload({ config: configPromise })
  const headerList = await headers()
  const { user } = await payload.auth({ headers: headerList })

  if (!user || user.collection !== 'customers') {
    redirect('/account/login')
  }

  const customerId = user.id

  const [quotesRes, bookingsRes, invoicesRes] = await Promise.all([
    payload.find({
      collection: 'quotes',
      where: { 'customer.id': { equals: customerId } },
      depth: 1,
      limit: 100,
      sort: '-updatedAt',
      overrideAccess: false,
    }),
    payload.find({
      collection: 'bookings',
      where: { 'customer.id': { equals: customerId } },
      depth: 1,
      limit: 100,
      sort: '-updatedAt',
      overrideAccess: false,
    }),
    payload.find({
      collection: 'invoices',
      where: { 'booking.customer.id': { equals: customerId } },
      depth: 1,
      limit: 100,
      sort: '-updatedAt',
      overrideAccess: false,
    }),
  ])

  const quotes = quotesRes.docs as unknown as Quote[]
  const bookings = bookingsRes.docs as unknown as Booking[]
  const invoices = invoicesRes.docs as unknown as Invoice[]

  // Stats
  const pendingQuotes = quotes.filter((q) =>
    ['requested', 'reviewing', 'quoted'].includes(q.status || ''),
  )
  const activeBookings = bookings.filter((b) =>
    !['closed', 'cancelled', 'declined'].includes(b.status || ''),
  )
  const unpaidInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue')
  const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0)

  return (
    <div>
      {/* Stats row */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Pending Quotes</p>
              <p className="text-2xl font-medium mt-1">{pendingQuotes.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Active Bookings</p>
              <p className="text-2xl font-medium mt-1">{activeBookings.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
              <p className="text-2xl font-medium mt-1">{unpaidInvoices.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-medium mt-1">
                ${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Recent quotes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recent Quotes</h2>
              <Link href="/account?tab=quotes" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <QuoteList quotes={quotes.slice(0, 5)} />
          </div>

          {/* Recent bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recent Bookings</h2>
              <Link href="/account?tab=bookings" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <BookingList bookings={bookings.slice(0, 5)} />
          </div>
        </>
      )}

      {/* Quotes tab */}
      {activeTab === 'quotes' && (
        <div>
          <h2 className="text-lg font-medium mb-4">All Quotes</h2>
          <QuoteList quotes={quotes} />
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <div>
          <h2 className="text-lg font-medium mb-4">All Bookings</h2>
          <BookingList bookings={bookings} />
        </div>
      )}

      {/* Invoices tab */}
      {activeTab === 'invoices' && (
        <div>
          <h2 className="text-lg font-medium mb-4">All Invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No invoices yet.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-card text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-card/50">
                      <td className="px-4 py-3 capitalize">{inv.type}</td>
                      <td className="px-4 py-3 font-medium">
                        ${(inv.amount || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_COLOURS[inv.status || ''] || ''}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QuoteList({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground text-sm">No quotes yet.</p>
        <Link href="/quote" className="inline-block mt-4 text-sm text-primary hover:underline">
          Request a quote &rarr;
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <Link
          key={q.id}
          href={`/account/quotes/${q.id}`}
          className="block rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{q.title}</p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {q.subject}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {q.quotedAmount != null && (
                <span className="text-sm font-medium">
                  ${(q.quotedAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </span>
              )}
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${QUOTE_STATUS_COLOURS[q.status || ''] || ''}`}>
                {q.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function BookingList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground text-sm">No bookings yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Bookings appear here once you accept a quote.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/account/bookings/${b.id}`}
          className="block rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{b.title}</p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {b.subject}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {b.quotedAmount != null && (
                <span className="text-sm font-medium">
                  ${(b.quotedAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </span>
              )}
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${BOOKING_STATUS_COLOURS[b.status || ''] || ''}`}>
                {(b.status || '').replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}