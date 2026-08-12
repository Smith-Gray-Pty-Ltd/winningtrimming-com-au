import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Events — append-only audit trail for the booking pipeline.
 *
 * Every state transition, agent action, payment, email, or error gets
 * logged here. The agent uses this for:
 *   - Idempotency: "has a deposit reminder already been sent today?"
 *   - Recovery: "what happened before this error?"
 *   - Audit: "who moved this booking from quoted to declined?"
 *
 * Records are never updated or deleted — they are the source of truth
 * for what happened and when.
 */
export const EVENTS = [
  'booking_created',
  'status_changed',
  'quote_issued',
  'quote_declined',
  'deposit_invoice_sent',
  'deposit_paid',
  'deposit_reminder_sent',
  'work_scheduled',
  'work_completed',
  'final_invoice_sent',
  'final_paid',
  'final_reminder_sent',
  'booking_closed',
  'booking_cancelled',
  'invoice_created',
  'invoice_status_synced',
  'agent_action_executed',
  'agent_error',
  'manual_review_required',
] as const

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    admin: authenticated,
    create: authenticated, // staff + agent (via API key)
    delete: () => false, // never delete events
    read: authenticated,
    update: () => false, // never update events
  },
  admin: {
    defaultColumns: ['eventType', 'booking', 'actor', 'createdAt'],
    useAsTitle: 'eventType',
    group: 'Bookings',
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: EVENTS.map((e) => ({ label: e, value: e })),
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      admin: {
        description: 'The booking this event relates to.',
      },
    },
    {
      name: 'invoice',
      type: 'relationship',
      relationTo: 'invoices',
      admin: {
        description: 'The invoice this event relates to (if applicable).',
      },
    },
    {
      name: 'actor',
      type: 'select',
      required: true,
      defaultValue: 'system',
      options: [
        { label: 'Staff', value: 'staff' },
        { label: 'Customer', value: 'customer' },
        { label: 'Agent', value: 'agent' },
        { label: 'System', value: 'system' },
        { label: 'Xero webhook', value: 'xero_webhook' },
      ],
      admin: {
        description: 'Who or what triggered this event.',
      },
    },
    {
      name: 'actorId',
      type: 'text',
      admin: {
        description: 'ID of the user/agent that triggered this (if applicable).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Human-readable summary of what happened.',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Structured data for idempotency checks and debugging.',
      },
    },
  ],
  timestamps: true,
}