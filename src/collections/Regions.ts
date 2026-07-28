import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { pillarOptions } from '@/fields/pillars'
import { slugField } from '@/fields/slug'
import { seoTab } from '@/fields/seoTab'

/**
 * Geographic regions used by the SEO matrix (e.g. Lake Macquarie, Newcastle).
 * Suburbs belong to a region; the matrix uses regions in page titles/schema.
 */
export const Regions: CollectionConfig = {
  slug: 'regions',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'SEO Matrix',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short description used in matrix page copy and schema.',
      },
    },
    {
      name: 'pillars',
      type: 'select',
      hasMany: true,
      options: pillarOptions.map((o) => ({ label: o.label, value: o.value })),
      admin: {
        position: 'sidebar',
        description:
          'Which pillars this region is relevant to. Leave empty if it applies to all pillars.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'content',
          label: 'Content',
          fields: [
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
          ],
        },
        seoTab,
      ],
    },
    ...slugField(),
  ],
}
