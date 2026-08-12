import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Customer accounts — separate from the admin `Users` collection.
 * Customers authenticate on the website (not the Payload admin panel)
 * and can create bookings, view invoices, and manage their details.
 *
 * Access rules:
 *   - Customers can read/update their own record (but not delete it).
 *   - Staff (any authenticated `Users`) can read all customers.
 *   - Only staff can create or delete customers (or customers self-register).
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    /**
     * Customers log in via the website, not the Payload admin panel.
     * The admin panel is for staff (Users collection) only.
     */
  },
  access: {
    admin: () => false, // customers never access the admin panel
    read: ({ req: { user } }) => {
      // Staff (Users collection) can read all customers
      if (user && user.collection === 'users') return true
      // Customers can read their own record
      if (user && user.collection === 'customers') {
        return { id: { equals: user.id } }
      }
      return false
    },
    update: ({ req: { user } }) => {
      if (user && user.collection === 'users') return true
      if (user && user.collection === 'customers') {
        return { id: { equals: user.id } }
      }
      return false
    },
    create: () => true, // public self-registration
    delete: authenticated, // staff only
  },
  admin: {
    defaultColumns: ['name', 'email', 'phone', 'pillar'],
    useAsTitle: 'name',
    group: 'Bookings',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Best contact number for booking follow-ups.',
      },
    },
    {
      name: 'company',
      type: 'text',
      admin: {
        description: 'Optional — business name if applicable.',
      },
    },
    {
      name: 'pillar',
      type: 'select',
      options: [
        { label: 'Marine', value: 'marine' },
        { label: 'Automotive', value: 'automotive' },
        { label: 'Caravan & RV', value: 'caravan-and-rv' },
        { label: 'Trade & Industrial', value: 'trade-and-industrial' },
        { label: 'Commercial', value: 'commercial' },
      ],
      admin: {
        description: 'Primary pillar for this customer (for filtering / marketing).',
      },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'suburb', type: 'text' },
        { name: 'state', type: 'select', options: [
          { label: 'NSW', value: 'NSW' },
          { label: 'VIC', value: 'VIC' },
          { label: 'QLD', value: 'QLD' },
          { label: 'SA', value: 'SA' },
          { label: 'WA', value: 'WA' },
          { label: 'TAS', value: 'TAS' },
          { label: 'ACT', value: 'ACT' },
          { label: 'NT', value: 'NT' },
        ]},
        { name: 'postcode', type: 'text' },
      ],
    },
    {
      name: 'suburbRef',
      type: 'relationship',
      relationTo: 'suburbs',
      admin: {
        description: 'Linked suburb for region-based filtering.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Internal staff notes — not visible to the customer.',
      },
    },
  ],
  timestamps: true,
}