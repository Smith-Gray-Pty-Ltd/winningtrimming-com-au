import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { pillarSelectField } from '@/fields/pillars'
import { slugField } from '@/fields/slug'

/**
 * Managed sub-category taxonomy for portfolio projects, e.g. "Biminis",
 * "Dodgers", "Tonneau Covers". Each is scoped to a pillar so the admin can
 * curate a clean, consistent list and the Our Work page can filter by it.
 */
export const ServiceTypes: CollectionConfig = {
  slug: 'service-types',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pillar', 'updatedAt'],
    group: 'Portfolio',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    pillarSelectField(),
    ...slugField(),
  ],
}
