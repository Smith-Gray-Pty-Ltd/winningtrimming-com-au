import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { pillarSelectField } from '@/fields/pillars'
import { slugField } from '@/fields/slug'
import { generatePreviewPath } from '../utilities/generatePreviewPath'
import { getServerSideURL } from '../utilities/getURL'

/**
 * Portfolio projects — each represents a completed job and powers the
 * filterable /our-work gallery plus per-project detail pages.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    pillar: true,
    summary: true,
    location: true,
    featuredImage: true,
  },
  admin: {
    defaultColumns: ['title', 'pillar', '_status', 'featured', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Portfolio',
    livePreview: {
      url: ({ data }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'projects',
        })
        return `${getServerSideURL()}${path}`
      },
    },
    preview: (data) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'projects',
      })
      return `${getServerSideURL()}${path}`
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    pillarSelectField(),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One or two sentences shown on the project card.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Images',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Card thumbnail and detail-page hero image.',
              },
            },
            {
              name: 'gallery',
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
                description: 'Additional photos shown on the detail page.',
              },
            },
            {
              name: 'beforeAfter',
              type: 'array',
              label: 'Before & After Pairs',
              labels: { singular: 'Pair', plural: 'Pairs' },
              fields: [
                {
                  name: 'before',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'after',
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
                description: 'Optional — only add pairs where you have both photos.',
              },
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'serviceTypes',
      type: 'relationship',
      hasMany: true,
      relationTo: 'service-types',
      admin: {
        position: 'sidebar',
        description: 'Sub-category tags relevant to this project.',
      },
      // Only offer service types that belong to this project's pillar
      filterOptions: ({ siblingData }) => {
        const pillar = (siblingData as Record<string, unknown>)?.pillar
        return pillar ? { pillar: { equals: pillar } } : {}
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'materials',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'e.g. "Marine-grade vinyl, Sunbrella canvas"',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'MMMM yyyy',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pin to the front of the Our Work gallery.',
      },
    },
    ...slugField(),
  ],
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
