import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { pillarSelectField } from '@/fields/pillars'
import { slugField } from '@/fields/slug'
import { seoTab } from '@/fields/seoTab'

/**
 * Businesses relevant to a pillar — marinas, shipwrights, yacht clubs, etc.
 * for Marine; mechanics, dealers, etc. for other pillars later.
 *
 * Each business belongs to a region and has a free-text suburb. Used for
 * local SEO context on matrix pages (e.g. "Nearby marinas") and can be
 * expanded to its own directory.
 */
export const Businesses: CollectionConfig = {
  slug: 'businesses',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'pillar', 'region', 'updatedAt'],
    group: 'SEO Matrix',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    pillarSelectField({
      admin: { position: 'sidebar' },
    }),
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Marina', value: 'marina' },
        { label: 'Shipwright', value: 'shipwright' },
        { label: 'Boatyard', value: 'boatyard' },
        { label: 'Yacht Club', value: 'yacht-club' },
        { label: 'Sailing Club', value: 'sailing-club' },
        { label: 'Chandlery', value: 'chandlery' },
        { label: 'Boat Ramp', value: 'boat-ramp' },
        { label: 'Slipway', value: 'slipway' },
        { label: 'Mechanic', value: 'mechanic' },
        { label: 'Dealer', value: 'dealer' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Type of business / facility.',
      },
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'suburb',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Suburb or locality where the business is located.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Full URL including https://',
      },
    },
    {
      type: 'tabs',
      tabs: [seoTab],
    },
    ...slugField(),
  ],
}
