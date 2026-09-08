import type { GlobalConfig } from 'payload'

import { revalidateHomePage } from './hooks/revalidateHomePage'

/**
 * HomePage global — lets admin manage the pillar card images shown in the
 * "What We Do" section of the homepage. Each of the 5 service pillars gets
 * a configurable image. If no image is set, the homepage falls back to the
 * existing auto-derive logic (project featured image → asset type hero).
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'pillars',
      type: 'array',
      label: 'Pillar Card Images',
      admin: {
        description:
          'Override the images shown on the "What We Do" pillar cards on the homepage. ' +
          'If an image is left empty, the card falls back to the latest project photo for that pillar.',
      },
      maxRows: 5,
      defaultValue: [
        { pillar: 'marine' },
        { pillar: 'automotive' },
        { pillar: 'caravan-and-rv' },
        { pillar: 'trade-and-industrial' },
        { pillar: 'commercial' },
      ],
      fields: [
        {
          name: 'pillar',
          type: 'select',
          label: 'Pillar',
          required: true,
          options: [
            { label: 'Marine', value: 'marine' },
            { label: 'Automotive', value: 'automotive' },
            { label: 'Caravan & RV', value: 'caravan-and-rv' },
            { label: 'Trade & Industrial', value: 'trade-and-industrial' },
            { label: 'Commercial', value: 'commercial' },
          ],
        },
        {
          name: 'image',
          type: 'relationship',
          label: 'Card Image',
          relationTo: 'media',
          admin: {
            description:
              'The image displayed on this pillar card. Recommended aspect ratio 4:3 landscape.',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHomePage],
  },
}