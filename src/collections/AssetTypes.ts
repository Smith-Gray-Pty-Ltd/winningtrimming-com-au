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
 * Asset types for the SEO matrix — the "thing" being worked on, scoped to a
 * pillar. For Marine: Yachts, Catamarans, RIBs, Jet Skis, etc.
 *
 * The `applicableProducts` relationship defines which service-types (product
 * types) are valid for this asset, controlling which matrix combinations exist.
 */
export const AssetTypes: CollectionConfig = {
  slug: 'asset-types',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pillar', 'updatedAt'],
    group: 'SEO Matrix',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Yachts", "Catamarans", "Jet Skis"',
      },
    },
    pillarSelectField({
      admin: {
        position: 'sidebar',
      },
    }),
    {
      name: 'singular',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Singular form for titles, e.g. "Yacht" (default: title minus trailing "s").',
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
        description: 'Optional hero image for the asset-type landing page.',
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
        {
          label: 'Products',
          fields: [
            {
              name: 'applicableProducts',
              type: 'relationship',
              hasMany: true,
              relationTo: 'service-types',
              admin: {
                description:
                  'Which product/service types apply to this asset type. Controls the valid matrix combinations.',
              },
              // Only offer service types that belong to this asset's pillar
              filterOptions: ({ siblingData }) => {
                const pillar = (siblingData as Record<string, unknown>)?.pillar
                return pillar ? { pillar: { equals: pillar } } : {}
              },
            },
          ],
        },
        seoTab,
      ],
    },
    ...slugField(),
  ],
}
