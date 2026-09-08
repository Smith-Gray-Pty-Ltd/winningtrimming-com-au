import type { GlobalConfig } from 'payload'

import { revalidateHomePage } from './hooks/revalidateHomePage'

/**
 * HomePage global — lets admin manage the pillar card images shown in the
 * "What We Do" section of the homepage. Each of the 5 service pillars gets
 * a named upload field (media picker). If an image is left empty, the
 * homepage falls back to the existing auto-derive logic (project featured
 * image → asset type hero).
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Globals',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Pillar Card Images',
          description:
            'Override the images shown on the "What We Do" pillar cards on the homepage. ' +
            'Leave blank to auto-use the latest project photo for that pillar.',
          fields: [
            {
              name: 'marineImage',
              type: 'upload',
              label: 'Marine',
              relationTo: 'media',
              admin: {
                description: 'Card image for the Marine pillar (4:3 landscape recommended).',
              },
            },
            {
              name: 'automotiveImage',
              type: 'upload',
              label: 'Automotive',
              relationTo: 'media',
              admin: {
                description: 'Card image for the Automotive pillar (4:3 landscape recommended).',
              },
            },
            {
              name: 'caravanRvImage',
              type: 'upload',
              label: 'Caravan & RV',
              relationTo: 'media',
              admin: {
                description: 'Card image for the Caravan & RV pillar (4:3 landscape recommended).',
              },
            },
            {
              name: 'tradeIndustrialImage',
              type: 'upload',
              label: 'Trade & Industrial',
              relationTo: 'media',
              admin: {
                description:
                  'Card image for the Trade & Industrial pillar (4:3 landscape recommended).',
              },
            },
            {
              name: 'commercialImage',
              type: 'upload',
              label: 'Commercial',
              relationTo: 'media',
              admin: {
                description: 'Card image for the Commercial pillar (4:3 landscape recommended).',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHomePage],
  },
}