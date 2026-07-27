import type { RequiredDataFromCollectionSlug } from 'payload'
import { h, p, root, QUOTE_CTA } from './helpers'

export const home: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'highImpact',
    links: [{ link: { ...QUOTE_CTA } }],
    // @ts-ignore
    media: '{{IMAGE_1}}',
    richText: root([
      h('Serving Lake Macquarie, the Central Coast, Newcastle and the Hunter Valley', 'h1'),
      p('Where quality meets craftsmanship and customer service shines.'),
    ]),
  },
  layout: [
    // ---- Intro to the service pillars -----------------------------------
    {
      blockName: 'Service overview',
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Marine, Automotive, Caravan & RV, Trade and Commercial', 'h2'),
            p('Winning Trimming crafts and repairs covers, canvas and upholstery across five service areas — built to handle the harsh Australian conditions. Explore each area below, or request a quote and we will help you find the right solution.'),
          ]),
        },
      ],
    },
    // ---- Teal band: the five pillars ------------------------------------
    {
      blockName: 'Service pillars',
      blockType: 'content',
      background: 'teal',
      columns: [
        {
          size: 'oneThird',
          richText: root([
            h('Marine'),
            p('Boats and watercraft — biminis, Dodgers, enclosures, sail covers, cushions and full refits.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Automotive'),
            p('Cars, vans, 4x4s and motorcycles / scooters — tonneaus, seats, trims and repairs.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Caravan & RV'),
            p('Caravans, motorhomes and campervans — annexes, cushions, mattresses and trim.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Trade & Industrial'),
            p('Utes, plant and machinery — covers, canopies and operator trim built tough.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Commercial'),
            p('Commercial upholstery for furniture, hospitality, office and contract work.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('See our work'),
            p('Browse recent projects across every service area.'),
            // @ts-ignore
          ]),
          // @ts-ignore
          image: '{{IMG_OUR_WORK}}',
          enableLink: true,
          // @ts-ignore
          link: { type: 'reference', label: 'View Our Work', reference: { relationTo: 'pages', value: '{{PAGE_OUR_WORK}}' } },
        },
        { size: 'full', enableLink: true, richText: root([]), link: { ...QUOTE_CTA } },
      ],
    },
  ],
  meta: {
    description:
      'Marine, automotive, caravan & RV, trade and commercial trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
    // @ts-ignore
    image: '{{IMAGE_1}}',
    title: 'Home',
  },
  title: 'Home',
}
