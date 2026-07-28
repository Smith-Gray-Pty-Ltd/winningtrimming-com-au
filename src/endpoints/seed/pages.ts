import type { RequiredDataFromCollectionSlug } from 'payload'
import { h, p, root, QUOTE_CTA, quoteLink } from './helpers'

type PageSeed = RequiredDataFromCollectionSlug<'pages'>

/**
 * Build a service-pillar page. Each is set up to later hold both a
 * "Custom & New Work" section and a "Repairs & Restorations" section.
 */
const servicePage = (args: {
  slug: string
  title: string
  hero: string // {{HERO_...}} placeholder
  tagline: string
  intro: string
  custom: string
  repairs: string
}): PageSeed => ({
  slug: args.slug,
  title: args.title,
  _status: 'published',
  hero: {
    type: 'highImpact',
    links: [{ link: { ...QUOTE_CTA } }],
    // @ts-ignore
    media: args.hero,
    richText: root([h(args.title, 'h1'), p(args.tagline)]),
  },
  layout: [
    // Intro
    {
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'full',
          richText: root([
            h(`${args.title} trimming, upholstery & covers`, 'h2'),
            p(args.intro),
          ]),
        },
      ],
    },
    // Custom & New Work
    {
      blockType: 'content',
      background: 'teal',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Custom & New Work', 'h2'),
            p(args.custom),
          ]),
        },
      ],
    },
    // Repairs & Restorations
    {
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Repairs & Restorations', 'h2'),
            p(args.repairs),
          ]),
        },
        { size: 'full', enableLink: true, richText: root([]), link: { ...QUOTE_CTA } },
      ],
    },
  ],
})

export const pillarPages: PageSeed[] = [
  servicePage({
    slug: 'marine',
    title: 'Marine',
    hero: '{{HERO_MARINE}}',
    tagline:
      'From runabouts to flybridge cruisers, we craft marine covers, canvas and upholstery built to handle the harsh Australian conditions.',
    intro:
      'From runabouts to flybridge cruisers, we craft marine covers, canvas and upholstery built to handle the harsh Australian conditions on Lake Macquarie, Newcastle and the coast.',
    custom:
      'Bespoke biminis, Dodgers, cockpit and flybridge enclosures, sail covers, sunbeds, cushions and full interior refits — designed and stitched from marine-grade materials.',
    repairs:
      'Zip repairs, re-stitching, re-covering damaged vinyl, replacing worn clears and canvas, and bringing tired trim back to life at a fraction of the replacement cost.',
  }),
  servicePage({
    slug: 'automotive',
    title: 'Automotive',
    hero: '{{HERO_AUTOMOTIVE}}',
    tagline: 'Cars, vans, 4x4s and motorcycles / scooters.',
    intro:
      'Custom trim, repairs and restorations for cars, vans, 4x4s and motorcycles / scooters — from a single seat repair to a full retrim.',
    custom:
      'Tonneau covers, custom seats, door trims, headlinings, motorcycle seats and scooter upholstery, all stitched to suit your vehicle and use.',
    repairs:
      'Bolster repairs, vinyl and leather repair, stitched seams, headlining sag fixes, and seat foam replacement to restore comfort and looks.',
  }),
  servicePage({
    slug: 'caravan-and-rv',
    title: 'Caravan & RV',
    hero: '{{HERO_CARAVAN}}',
    tagline: 'Caravans, motorhomes, campervans and off-road setups.',
    intro:
      'Keeping the touring fleet comfortable — storage covers, annexes, upholstery and interior trim for caravans, motorhomes, campervans and off-road setups.',
    custom:
      'Annexes, shade walls, pop-top seals, upgraded cushions, mattresses and interior panels, built to fit your van and your travels.',
    repairs:
      'Annex repairs, window and hatch seal replacement, re-stitching, cushion and mattress refurbishment, and water-damaged trim renewal.',
  }),
  servicePage({
    slug: 'trade-and-industrial',
    title: 'Trade & Industrial',
    hero: '{{HERO_TRADE}}',
    tagline: 'Utes, plant, machinery and equipment covers.',
    intro:
      'Hard-wearing covers, canopies and trim for utes, plant and machinery — built to take the knocks of daily work.',
    custom:
      'Tonneau and machinery covers, soft canopies, tool covers, custom trays and operator-seat trimming for trucks and equipment.',
    repairs:
      'Tonneau and cover repairs, seam re-stitching, replacement hardware, and refurbishing seats and trim on working vehicles.',
  }),
  servicePage({
    slug: 'commercial',
    title: 'Commercial',
    hero: '{{HERO_COMMERCIAL}}',
    tagline: 'Commercial upholstery — furniture, hospitality, office and contract work.',
    intro:
      'Commercial upholstery for furniture, hospitality venues, offices and contract projects — durable finishes that hold up to heavy use.',
    custom:
      'Custom seating and booth upholstery for cafés and restaurants, office chair re-upholstery, bench seating and contract runs to spec.',
    repairs:
      'Re-covering worn panels, replacing damaged vinyl, re-stitching seams and refreshing furniture to extend the life of your investment.',
  }),
]

export const ourWorkPage: PageSeed = {
  slug: 'our-work',
  title: 'Our Work',
  _status: 'published',
  hero: {
    type: 'highImpact',
    // @ts-ignore
    media: '{{HERO_OUR_WORK}}',
    richText: root([h('Our Work', 'h1'), p('A selection of recent trimming, upholstery and cover projects.')]),
  },
  layout: [
    {
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Recent projects', 'h2'),
            p('A selection of completed jobs across our five service areas — filter by service or work type below.'),
          ]),
        },
      ],
    },
  ],
}

export const aboutPage: PageSeed = {
  slug: 'about',
  title: 'About',
  _status: 'published',
  hero: { type: 'lowImpact', richText: root([h('About Winning Trimming', 'h1')]) },
  layout: [
    {
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Where quality meets craftsmanship', 'h2'),
            p('Winning Trimming is a marine, recreational and trade trimming, upholstery and covers specialist based in Toronto, on Lake Macquarie. We combine traditional craftsmanship with modern materials to build and repair covers, canvas and trim that last.'),
            p('Winning Trimming is a trading name of Smith & Gray Pty Ltd (ABN 92 655 426 707).'),
          ]),
        },
      ],
    },
    {
      blockType: 'content',
      background: 'teal',
      columns: [
        {
          size: 'full',
          richText: root([
            h('The area we serve', 'h2'),
            p('Serving Lake Macquarie, the Central Coast, Newcastle and the Hunter Valley. Drop in to the workshop or arrange an on-site inspection.'),
          ]),
        },
        { size: 'full', enableLink: true, richText: root([]), link: { ...QUOTE_CTA } },
      ],
    },
  ],
}

// Export the quoteLink for reuse in home/index
export { quoteLink }
