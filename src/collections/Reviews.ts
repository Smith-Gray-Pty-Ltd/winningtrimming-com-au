import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Customer reviews imported from Google (via Places API) or entered manually.
 * Powers the reviews widget on the homepage and other pages.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'rating', 'source', 'createdAt'],
    group: 'Content',
  },
  defaultPopulate: {
    authorName: true,
    rating: true,
    text: true,
    source: true,
  },
  fields: [
    {
      name: 'authorName',
      type: 'text',
      required: true,
      admin: {
        description: 'The reviewer\'s display name (e.g. "John Smith").',
      },
    },
    {
      name: 'authorPhoto',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional profile photo from Google.',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Star rating from 1 to 5.',
        step: 1,
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The review text.',
      },
    },
    {
      name: 'reviewDate',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'd MMM yyyy',
          pickerAppearance: 'dayOnly',
        },
        description: 'When the review was originally posted.',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'google',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Manual', value: 'manual' },
        { label: 'Facebook', value: 'facebook' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'googleReviewId',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Google\'s unique ID for this review — used for deduplication. Leave empty for manual reviews.',
        condition: (data) => data?.source === 'google',
      },
    },
    {
      name: 'googlePlaceUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Link to the review on Google Maps.',
        condition: (data) => data?.source === 'google',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pin this review to show it first.',
      },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Hide this review from the public site without deleting it.',
      },
    },
  ],
  timestamps: true,
}