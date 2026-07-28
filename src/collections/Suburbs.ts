import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'
import { seoTab } from '@/fields/seoTab'

/**
 * Suburbs/localities for the SEO matrix. Each belongs to a region.
 * Matrix pages at the suburb level (e.g. /marine/yachts/weather-covers/belmont)
 * pull their local copy from the suburb's intro field.
 */
export const Suburbs: CollectionConfig = {
  slug: 'suburbs',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'region', 'postcode', 'updatedAt'],
    group: 'SEO Matrix',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Suburb name, e.g. "Belmont"',
      },
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'postcode',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description:
          'Local SEO copy for this suburb, used on suburb-level matrix pages.',
      },
    },
    {
      type: 'tabs',
      tabs: [seoTab],
    },
    ...slugField(),
  ],
}
