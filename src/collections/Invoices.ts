import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Invoices — a thin mirror of Xero invoices.
 *
 * Each invoice links to a booking and stores just enough for the admin UI
 * and agent to operate without a Xero API call on every read:
 *   - Xero invoice ID (the source of truth)
 *   - Type (deposit / adjustment / final)
 *   - Amount, due date, status (synced from Xero)
 *   - Direct link to the Xero invoice for staff
 *
 * Payments are reconciled in Xero (CBA bank feed or Stripe via Xero).
 * A Xero webhook updates the status here when an invoice is paid.
 */
export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
] as const

export const INVOICE_TYPES = [
  'deposit',
  'adjustment',
  'final',
] as const

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: ({ req: { user } }) => {
      // Staff can read all
      if (user && user.collection === 'users') return true
      // Customers can read invoices on their own bookings
      if (user && user.collection === 'customers') {
        return { 'booking.customer.id': { equals: user.id } }
      }
      return false
    },
    update: authenticated, // staff + webhook only
  },
  admin: {
    defaultColumns: ['booking', 'type', 'amount', 'status', 'dueDate', 'xeroInvoiceId'],
    useAsTitle: 'booking',
    group: 'Bookings',
  },
  fields: [
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
      admin: {
        description: 'The booking this invoice belongs to.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: INVOICE_TYPES.map((t) => ({ label: t, value: t })),
      admin: {
        description: 'Deposit (50%), adjustment (variation), or final (remaining balance).',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Invoice amount in AUD.',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When payment is due.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: INVOICE_STATUSES.map((s) => ({ label: s, value: s })),
      admin: {
        position: 'sidebar',
        description: 'Synced from Xero via webhook.',
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: {
        hidden: true,
        position: 'sidebar',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Bank transfer', value: 'bank_transfer' },
        { label: 'Card (Stripe)', value: 'card' },
        { label: 'Cash', value: 'cash' },
        { label: 'Cheque', value: 'cheque' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'How the customer paid (synced from Xero).',
      },
    },

    // ── Xero link ──
    {
      name: 'xeroInvoiceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Xero invoice ID — the source of truth for this invoice.',
      },
    },
    {
      name: 'xeroInvoiceNumber',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Xero invoice number (e.g. INV-0123).',
      },
    },
    {
      name: 'xeroUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Direct link to the invoice in Xero (for staff).',
      },
    },

    // ── Adjustment detail ──
    {
      name: 'adjustmentDescription',
      type: 'text',
      admin: {
        condition: (sibling) => sibling?.type === 'adjustment',
        description: 'What this adjustment covers (e.g. "Extra marine vinyl — 3m").',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Internal staff notes for this invoice.',
      },
    },
  ],
  timestamps: true,
}