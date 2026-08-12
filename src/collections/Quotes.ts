import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Quote status flow:
 *   requested → reviewing → quoted → accepted | declined | expired
 *
 * Customer creates a quote request via /quote. Staff review, set the
 * quoted amount, and send it. Customer accepts or declines. When accepted,
 * staff convert it to a Booking (which enters the job pipeline).
 */
export const QUOTE_STATUSES = [
  'requested',
  'reviewing',
  'quoted',
  'accepted',
  'declined',
  'expired',
] as const

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  access: {
    admin: authenticated,
    create: () => true, // customers + staff
    delete: authenticated,
    read: ({ req: { user } }) => {
      if (user && user.collection === 'users') return true
      if (user && user.collection === 'customers') {
        return { 'customer.id': { equals: user.id } }
      }
      return false
    },
    update: authenticated, // staff only — customers accept/decline via API endpoint
  },
  admin: {
    defaultColumns: ['title', 'status', 'pillar', 'customer', 'quotedAmount', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Bookings',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Short label, e.g. "Smith — Bimini refit".',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
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

    // ── Quoting (staff fills in) ──
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
      name: 'quoteNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Notes included in the quote sent to the customer.',
      },
    },

    // ── Status ──
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'requested',
      options: QUOTE_STATUSES.map((s) => ({ label: s, value: s })),
      admin: {
        position: 'sidebar',
        description: 'Quote stage. When accepted, convert to a Booking.',
      },
    },

    // ── Link to booking (created after acceptance) ──
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      admin: {
        position: 'sidebar',
        description: 'The booking created from this quote (if accepted & converted).',
      },
    },

    // ── Agent fields ──
    {
      name: 'nextAction',
      type: 'select',
      options: [
        { label: 'send_quote', value: 'send_quote' },
        { label: 'send_quote_reminder', value: 'send_quote_reminder' },
        { label: 'check_quote_accepted', value: 'check_quote_accepted' },
        { label: 'expire_quote', value: 'expire_quote' },
        { label: 'convert_to_booking', value: 'convert_to_booking' },
      ],
      admin: {
        position: 'sidebar',
        description: 'What the agent should do next on this quote.',
      },
    },
    {
      name: 'nextActionDue',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the next action should run.',
      },
    },
  ],
  timestamps: true,
}