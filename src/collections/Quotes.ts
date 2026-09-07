import type { CollectionConfig, Where } from 'payload'

import { authenticated } from '../access/authenticated'
import { notifyStaffOfQuote, notifyCustomerOfQuote } from '../utilities/email'

/**
 * Simple in-memory rate limiter for quote submissions.
 * Limits to maxSubmissions per IP per windowMs. Resets after the window.
 * This is a basic guardrail — for production you may want Redis or a
 * middleware-based approach, but this catches casual abuse.
 */
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 3 // 3 quotes per hour per IP
const rateLimitMap = new Map<string, { count: number; firstAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.firstAt > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstAt: now })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// Clean up old entries every 10 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.firstAt > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip)
    }
  }
}, 10 * 60 * 1000)

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
      admin: {
        description: 'Short label, auto-generated from contact name + subject if left blank.',
      },
    },
    // ── Contact details (for anonymous submissions) ──
    // When a customer is logged in these are auto-filled by the form;
    // when submitting anonymously the customer fills them in directly.
    {
      name: 'contactName',
      type: 'text',
      required: true,
      admin: {
        description: 'Customer name.',
        condition: (data) => !data?.customer,
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Customer email.',
        condition: (data) => !data?.customer,
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: true,
      admin: {
        description: 'Customer phone.',
        condition: (data) => !data?.customer,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        description: 'Linked customer account (if they were logged in when submitting).',
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
      maxRows: 10,
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
        description: 'Photos of the subject / job site. Maximum 10 photos.',
      },
    },

    // ── Service types ──
    {
      name: 'serviceTypes',
      type: 'relationship',
      hasMany: true,
      relationTo: 'service-types',
      filterOptions: ({ siblingData }): Where => {
        const pillar = (siblingData as Record<string, unknown>)?.pillar as string | undefined
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

    // ── Honeypot (anti-spam) ──
    // A hidden field on the frontend that bots fill in but humans don't.
    // The beforeChange hook silently rejects submissions where this is filled.
    {
      name: 'website',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Honeypot check — if the hidden "website" field is filled, it's a bot.
        // Silently reject by throwing an error that looks like success to the bot.
        if (data?.website) {
          throw new Error('Quote submitted successfully.')
        }

        // Rate limiting — check IP address
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          || req.headers.get('x-real-ip')
          || 'unknown'

        if (ip !== 'unknown' && !checkRateLimit(ip)) {
          throw new Error('Too many quote requests. Please try again later.')
        }

        // Auto-create or link a customer from contact details (for anonymous
        // submissions). If the submitter is already logged in as a customer,
        // the customer field is already set by the form.
        if (!data?.customer && data?.contactEmail) {
          try {
            const email = data.contactEmail.toLowerCase().trim()

            // Find existing customer by email (overrideAccess bypasses read rules)
            const existing = await req.payload.find({
              collection: 'customers',
              where: { email: { equals: email } },
              limit: 1,
              overrideAccess: true,
              depth: 0,
            })

            if (existing.docs && existing.docs.length > 0) {
              data.customer = (existing.docs[0] as any).id
            } else {
              // Create a new customer from the contact details
              // Note: password is auto-generated — the customer can reset it later
              const newCustomer = await req.payload.create({
                collection: 'customers',
                data: {
                  name: data.contactName,
                  email,
                  phone: data.contactPhone || undefined,
                  // Generate a random password so the account is secure
                  // The customer can use "forgot password" to set their own
                  password: Math.random().toString(36).slice(2) + Date.now().toString(36),
                },
                overrideAccess: true,
              })
              data.customer = (newCustomer as any).id
            }
          } catch (e: any) {
            // If customer creation fails, don't block the quote — it will
            // still have the contact details fields for staff to follow up.
            req.payload.logger?.error?.('[quotes] Failed to auto-create customer: ' + (e?.message || String(e)))
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only send emails on new quote creation (not updates)
        if (operation !== 'create') return

        const quote = doc as any

        // Notify staff + customer in parallel (don't block the response)
        Promise.all([
          notifyStaffOfQuote(req.payload, quote),
          notifyCustomerOfQuote(req.payload, quote),
        ]).catch(() => {
          // Errors are already logged inside the functions
        })
      },
    ],
  },
  timestamps: true,
}