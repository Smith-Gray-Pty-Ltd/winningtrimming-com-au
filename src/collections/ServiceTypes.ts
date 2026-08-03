import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { pillarSelectField } from '@/fields/pillars'
import { slugField } from '@/fields/slug'
import { seoTab } from '@/fields/seoTab'

/**
 * Product / service types used both as project tags AND as a dimension of the
 * SEO matrix (e.g. "Weather Covers", "Bimini Tops", "Tonneau Covers"). Each is
 * scoped to a pillar and carries its own SEO copy so matrix pages stay unique.
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
    {
      name: 'workType',
      type: 'select',
      defaultValue: 'custom',
      options: [
        { label: 'Custom & New Work', value: 'custom' },
        { label: 'Repairs & Restorations', value: 'repair' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Custom = new builds; Repair = repair/restoration work.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: '1–2 sentence SEO intro used on matrix pages.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Optional hero image for the pillar-level product page.',
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
            {
              name: 'keyFeatures',
              type: 'array',
              labels: { singular: 'Feature', plural: 'Key features' },
              admin: {
                initCollapsed: true,
                description: 'Bullet-point features shown on matrix pages.',
              },
              fields: [
                {
                  name: 'feature',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        seoTab,
      ],
    },
    ...slugField(),
  ],
}
