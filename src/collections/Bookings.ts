import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Booking status state machine.
 *
 * Valid transitions:
 *   new → quoted
 *   quoted → deposit-invoiced | declined
 *   deposit-invoiced → deposit-paid | overdue-deposit
 *   overdue-deposit → deposit-paid | declined
 *   deposit-paid → in-progress
 *   in-progress → completed
 *   completed → final-invoiced
 *   final-invoiced → final-paid | overdue-final
 *   overdue-final → final-paid
 *   final-paid → closed
 *   * → cancelled (terminal)
 *
 * The `nextAction` + `nextActionDue` fields tell the agent what to do next
 * and when. The agent queries bookings where nextActionDue <= now() and
 * processes them.
 */
export const BOOKING_STATUSES = [
  'new',
  'quoted',
  'deposit-invoiced',
  'overdue-deposit',
  'deposit-paid',
  'in-progress',
  'completed',
  'final-invoiced',
  'overdue-final',
  'final-paid',
  'closed',
  'declined',
  'cancelled',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

/** Valid forward transitions for each status. The agent and UI must respect these. */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ['quoted', 'cancelled'],
  quoted: ['deposit-invoiced', 'declined', 'cancelled'],
  'deposit-invoiced': ['deposit-paid', 'overdue-deposit', 'cancelled'],
  'overdue-deposit': ['deposit-paid', 'declined', 'cancelled'],
  'deposit-paid': ['in-progress', 'cancelled'],
  'in-progress': ['completed', 'cancelled'],
  completed: ['final-invoiced', 'cancelled'],
  'final-invoiced': ['final-paid', 'overdue-final', 'cancelled'],
  'overdue-final': ['final-paid', 'cancelled'],
  'final-paid': ['closed'],
  closed: [],
  declined: [],
  cancelled: [],
}

/** Actions the agent can take on a booking. Null means no action pending. */
export const BOOKING_ACTIONS = [
  'send_quote',
  'send_deposit_invoice',
  'check_deposit_paid',
  'send_deposit_reminder',
  'schedule_work',
  'send_final_invoice',
  'check_final_paid',
  'send_final_reminder',
  'create_portfolio_entry',
  'manual_review',
] as const

/**
 * Validates status transitions on Bookings. Throws if the transition is
 * not in the VALID_TRANSITIONS map, preventing invalid states.
 */
export const validateStatusTransition = (
  oldStatus: string | undefined,
  newStatus: string,
): void => {
  if (!oldStatus || oldStatus === newStatus) return
  const allowed = VALID_TRANSITIONS[oldStatus]
  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(
      `Invalid booking status transition: ${oldStatus} → ${newStatus}. ` +
      `Allowed: ${allowed?.join(', ') || 'none (terminal state)'}`,
    )
  }
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  access: {
    admin: authenticated,
    create: () => true, // customers + staff
    delete: authenticated,
    read: ({ req: { user } }) => {
      // Staff can read all
      if (user && user.collection === 'users') return true
      // Customers can read their own bookings
      if (user && user.collection === 'customers') {
        return { 'customer.id': { equals: user.id } }
      }
      return false
    },
    update: authenticated, // staff only — customers can't self-edit bookings
  },
  admin: {
    defaultColumns: ['title', 'status', 'pillar', 'customer', 'nextActionDue', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Bookings',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Short label for admin lists, e.g. "Smith — Bimini refit".',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'The customer who requested this booking.',
      },
    },
    {
      name: 'pillar',
      type: 'select',
      required: true,
      options: [
        { label: 'Marine', value: 'marine' },
        { label: 'Automotive', value: 'automotive' },
        { label: 'Caravan & RV', value: 'caravan-and-rv' },
        { label: 'Trade & Industrial', value: 'trade-and-industrial' },
        { label: 'Commercial', value: 'commercial' },
      ],
    },

    // ── Subject (the thing being worked on) ──
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'What is the job for? e.g. "Bayliner 175 bowrider", "Café booth seating", "CAT 320 excavator".',
      },
    },
    {
      name: 'subjectType',
      type: 'relationship',
      relationTo: 'asset-types',
      admin: {
        condition: (sibling) => sibling?.pillar === 'marine',
        description: 'Vessel type (marine jobs only).',
      },
    },
    {
      name: 'subjectDetails',
      type: 'textarea',
      admin: {
        description: 'Any details about the subject — length, model, stored at, etc.',
      },
    },
    {
      name: 'subjectPhotos',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
      admin: {
        initCollapsed: true,
        description: 'Photos of the subject / job site.',
      },
    },

    // ── Service types ──
    {
      name: 'serviceTypes',
      type: 'relationship',
      hasMany: true,
      relationTo: 'service-types',
      filterOptions: ({ siblingData }) => {
        const pillar = (siblingData as Record<string, unknown>)?.pillar
        return pillar ? { pillar: { equals: pillar } } : {}
      },
      admin: {
        description: 'Which services this job involves.',
      },
    },

    // ── Job details ──
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Customer\'s description of what they need.',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Where the work is, e.g. "Toronto, Lake Macquarie" or "Our workshop".',
      },
    },
    {
      name: 'preferredDates',
      type: 'text',
      admin: {
        description: 'Customer\'s preferred timing, free text.',
      },
    },

    // ── Pricing ──
    {
      name: 'quotedAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Total quoted amount in AUD (excl. GST if applicable).',
      },
    },
    {
      name: 'depositAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Deposit amount in AUD. Usually 50% of quoted.',
      },
    },
    {
      name: 'adjustments',
      type: 'array',
      fields: [
        { name: 'description', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'type', type: 'select', options: [
          { label: 'Additional charge', value: 'additional' },
          { label: 'Discount', value: 'discount' },
        ], defaultValue: 'additional' },
      ],
      admin: {
        initCollapsed: true,
        position: 'sidebar',
        description: 'Variations to the original quote (extra materials, scope changes).',
      },
    },

    // ── State machine ──
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: BOOKING_STATUSES.map((s) => ({ label: s.replace(/-/g, ' '), value: s })),
      admin: {
        position: 'sidebar',
        description: 'Current state in the booking pipeline.',
      },
    },
    {
      name: 'previousStatus',
      type: 'select',
      options: BOOKING_STATUSES.map((s) => ({ label: s.replace(/-/g, ' '), value: s })),
      admin: {
        hidden: true,
        position: 'sidebar',
      },
    },

    // ── Agent fields ──
    {
      name: 'nextAction',
      type: 'select',
      options: BOOKING_ACTIONS.map((a) => ({ label: a, value: a })),
      admin: {
        position: 'sidebar',
        description: 'What the agent should do next on this booking. Null = no action pending.',
      },
    },
    {
      name: 'nextActionDue',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the next action should run. Agent queries where this <= now().',
      },
    },
    {
      name: 'lastAgentRun',
      type: 'date',
      admin: {
        hidden: true,
        position: 'sidebar',
      },
    },
    {
      name: 'agentError',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Last error from the agent (if any). Cleared on successful run.',
      },
    },

    // ── Links ──
    {
      name: 'quote',
      type: 'relationship',
      relationTo: 'quotes',
      admin: {
        position: 'sidebar',
        description: 'The originating quote (if this booking was converted from one).',
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: {
        position: 'sidebar',
        description: 'Portfolio entry created from this booking (if any).',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Validate status transition
        const oldStatus = originalDoc?.status as string | undefined
        const newStatus = data?.status as string | undefined
        if (newStatus && oldStatus && newStatus !== oldStatus) {
          validateStatusTransition(oldStatus, newStatus)
          // Track previous status for audit
          data.previousStatus = oldStatus
        }
        return data
      },
    ],
  },
  timestamps: true,
}