import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { Button } from '@/components/ui/button'

/**
 * Account layout — wraps all /account/* routes. Shows the account nav
 * (dashboard tabs, logout) only when a customer is logged in. For login
 * and register pages (no customer session), children render directly
 * so there's no circular redirect.
 *
 * Auth guarding (redirecting unauthenticated users) is handled in the
 * individual page components, not the layout.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const headerList = await headers()
  const { user } = await payload.auth({ headers: headerList })

  // Not a customer (not logged in, or staff) — render children bare
  // so login/register pages work without a circular redirect.
  if (!user || user.collection !== 'customers') {
    return <>{children}</>
  }

  // Customer is logged in — show account nav + children
  const customer = user

  return (
    <div className="container py-8 pb-24 min-h-[60vh]">
      {/* Account nav */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium">My Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {customer.name || customer.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/quote">
            <Button size="sm">Request a Quote</Button>
          </Link>
          <form action="/api/customers/logout" method="POST">
            <Button type="submit" variant="outline" size="sm">
              Log Out
            </Button>
          </form>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex gap-2 mb-8 border-b border-border pb-2 flex-wrap">
        <Link
          href="/account"
          className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-card transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/account?tab=quotes"
          className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-card transition-colors"
        >
          Quotes
        </Link>
        <Link
          href="/account?tab=bookings"
          className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-card transition-colors"
        >
          Bookings
        </Link>
        <Link
          href="/account?tab=invoices"
          className="px-3 py-1.5 rounded-full text-sm font-medium hover:bg-card transition-colors"
        >
          Invoices
        </Link>
      </nav>

      {children}
    </div>
  )
}