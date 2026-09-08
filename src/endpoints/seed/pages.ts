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
  seoContent: string
  metaTitle: string
  metaDescription: string
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
  seoContent: args.seoContent,
  layout: [
    // Minimal CTA — just the quote button, no band/heading
    {
      blockType: 'content',
      background: 'default',
      columns: [
        { size: 'full', enableLink: true, richText: root([]), link: { ...QUOTE_CTA } },
      ],
    },
  ],
  meta: {
    title: args.metaTitle,
    description: args.metaDescription,
    // @ts-ignore
    image: args.hero,
  },
})

export const pillarPages: PageSeed[] = [
  servicePage({
    slug: 'marine',
    title: 'Marine',
    hero: '{{HERO_MARINE}}',
    tagline:
      'From runabouts to Super Yachts, we craft marine covers, canvas and upholstery built to handle the harsh Australian conditions.',
    intro:
      'From runabouts to Super Yachts, we craft marine covers, canvas and upholstery built to handle the harsh Australian conditions on Lake Macquarie, Newcastle and the coast.',
    custom:
      'Bespoke biminis, Dodgers, cockpit and flybridge enclosures, sail covers, sunbeds, cushions and full interior refits — designed and stitched from marine-grade materials.',
    repairs:
      'Zip repairs, re-stitching, re-covering damaged vinyl, replacing worn clears and canvas, and bringing tired trim back to life at a fraction of the replacement cost.',
    seoContent: `Winning Trimming is the Lake Macquarie and Newcastle region's specialist marine trimming, canvas and upholstery workshop. From our workshop in Toronto on Lake Macquarie, we serve boat owners across the Hunter Valley, Central Coast and wider New South Wales coastline — building, repairing and re-trimming marine covers, canvas and upholstery that stand up to the harsh Australian marine environment.\n\nWe work on all types of vessels, from tinnies and runabouts to super yachts and flybridge cruisers. Our services include custom bimini tops, dodgers, cockpit and flybridge enclosures, sail covers and stack packs, weather covers and towing covers, sunbed cushions, marine seats, boat mattresses, interior panels, hull lining and marine carpet. Every job is patterned on the boat for a precise fit, using marine-grade fabrics like Sunbrella and WeatherMax, UV-stable thread, stainless steel fasteners and premium clear vinyl from Strataglass.\n\nWhether you need a new bimini for your runabout, a full flybridge enclosure for your cruiser, or a re-trim of tired cockpit seating, we build marine canvas and upholstery that lasts. Drop in to our Toronto workshop or arrange an on-site inspection at your marina — we cover Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.`,
    metaTitle: 'Marine Trimming, Canvas & Upholstery — Lake Macquarie, Newcastle | Winning Trimming',
    metaDescription: 'Custom marine covers, biminis, dodgers, enclosures, sail covers, cushions and upholstery. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
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
    seoContent: `Winning Trimming provides custom automotive trimming, upholstery and restoration services from our workshop in Toronto on Lake Macquarie. We serve car, van, 4x4 and motorcycle owners across Newcastle, the Hunter Valley and the Central Coast — from a single seat repair to a full interior re-trim.\n\nOur automotive services include tonneau and tray covers for utes, seat re-trims in leather, vinyl or fabric, headlining repair and replacement, door trim and panel upholstery, motorcycle and scooter seat trimming, and carpet replacement. We use automotive-grade materials — UV-stable leather and vinyl, high-density foam, and OEM-quality fasteners and hog rings — for results that look and feel factory-fresh.\n\nWhether you're restoring a classic, refreshing a daily driver, or need a tonneau cover for your work ute, we build automotive trim that lasts. We also handle insurance and accident repairs.`,
    metaTitle: 'Automotive Trimming & Upholstery — Lake Macquarie, Newcastle | Winning Trimming',
    metaDescription: 'Custom seat re-trims, tonneau covers, headlinings, door trims and repairs for cars, vans, 4x4s and motorcycles. Serving Lake Macquarie, Newcastle and the Hunter.',
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
    seoContent: `Winning Trimming keeps the touring fleet comfortable with custom caravan, motorhome and RV trimming, upholstery and canvas work. From our workshop in Toronto on Lake Macquarie, we serve caravan and RV owners across Newcastle, the Hunter Valley, the Central Coast and beyond — building and repairing the canvas and upholstery that make life on the road comfortable.\n\nOur caravan and RV services include annexes and shade walls, custom cushions and mattresses, interior trim and upholstery, pop-top seals and canvas replacements, window and hatch seal replacement, and water-damaged trim renewal. We use UV-stable, waterproof canvas, marine-grade zips, high-density foam, and mildew-resistant materials that hold up to the Australian touring life.\n\nWhether you need a new annex for the big lap, replacement cushions for a tired dinette, or a full interior refit for a camper build, we build caravan and RV trim that makes life on the road better.`,
    metaTitle: 'Caravan & RV Trimming, Annexes & Upholstery — Lake Macquarie | Winning Trimming',
    metaDescription: 'Custom annexes, cushions, mattresses, interior trim and repairs for caravans, motorhomes and campervans. Serving Lake Macquarie, Newcastle and the Hunter.',
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
    seoContent: `Winning Trimming builds hard-wearing covers, canopies and trim for utes, plant, machinery and equipment — made to take the knocks of daily work. From our workshop in Toronto on Lake Macquarie, we serve trades, contractors and plant operators across Newcastle, the Hunter Valley and the Central Coast.\n\nOur trade and industrial services include tonneau and tray covers for utes, machinery and equipment covers, soft canopies, tool covers, operator seat trimming and repair, and custom canvas for any application. We use industrial-grade PVC and canvas, UV-stable and waterproof, with reinforced edges, stainless steel D-rings and heavy-duty fasteners.\n\nWhether you need a tonneau for your work ute, a cover for an excavator between jobs, or operator seats re-trimmed for a fleet, we build trade and industrial covers and trim that protect your investment and keep you working.`,
    metaTitle: 'Trade & Industrial Covers, Canopies & Trimming — Lake Macquarie | Winning Trimming',
    metaDescription: 'Tonneau covers, machinery covers, operator seats and custom canvas for utes, plant and equipment. Serving Lake Macquarie, Newcastle and the Hunter.',
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
    seoContent: `Winning Trimming provides commercial upholstery for furniture, hospitality venues, offices and contract projects — durable finishes that hold up to heavy use. From our workshop in Toronto on Lake Macquarie, we serve businesses across Newcastle, the Hunter Valley and the Central Coast.\n\nOur commercial services include booth and banquette seating for cafés and restaurants, office chair re-upholstery, boardroom and executive seating, bench seating, and contract runs to specification. We use commercial-grade, fire-rated, stain-resistant vinyl and fabric, with high-density commercial foam, reinforced stitching, and options for quilted panels, button tufting, contrast piping and custom branding.\n\nWhether you're fitting out a new venue, refreshing tired furniture, or need a contract run of chairs re-upholstered, we build commercial upholstery that meets commercial compliance standards and holds up to daily use.`,
    metaTitle: 'Commercial Upholstery — Cafés, Offices & Contract — Lake Macquarie | Winning Trimming',
    metaDescription: 'Booth seating, office chair re-upholstery, bench seating and contract commercial upholstery. Fire-rated, durable. Serving Lake Macquarie and Newcastle.',
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
  seoContent: `Browse recent projects from Winning Trimming — a selection of completed marine, automotive, caravan & RV, trade and commercial trimming, upholstery and cover work from our workshop in Toronto on Lake Macquarie. Each project shows the brief, what we built, and the result, with photos of the finished work.\n\nOur portfolio spans the full range of our services: marine covers, biminis and enclosures for boats on Lake Macquarie and the coast; automotive re-trims and tonneau covers for utes and cars; caravan annexes and cushion refurbs for the touring fleet; machinery covers and operator seats for trade and plant; and commercial booth seating and office chair re-upholstery for Newcastle businesses.\n\nFilter by service area to see projects relevant to your needs, or request a quote and we'll help you find the right solution. We serve Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.`,
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
  meta: {
    title: 'Our Work — Marine, Auto & Commercial Trimming Projects | Winning Trimming',
    description: 'A selection of recent trimming, upholstery and cover projects across marine, automotive, caravan, trade and commercial. Lake Macquarie, Newcastle and the Hunter.',
    // @ts-ignore
    image: '{{HERO_OUR_WORK}}',
  },
}

export const aboutPage: PageSeed = {
  slug: 'about',
  title: 'About',
  _status: 'published',
  hero: { type: 'lowImpact', richText: root([h('About Winning Trimming', 'h1')]) },
  seoContent: `Winning Trimming is a marine, recreational and trade trimming, upholstery and covers specialist based in Toronto, on Lake Macquarie. We combine traditional craftsmanship with modern materials to build and repair covers, canvas and trim that last — serving boat owners, drivers, caravanners, trades and businesses across Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.\n\nFounded by Smith & Gray Pty Ltd (ABN 92 655 426 707), Winning Trimming has built a reputation for quality workmanship, honest advice and materials that stand up to the harsh Australian conditions. Every job is patterned and measured on site for a precise fit, whether it's a bimini for a runabout, a tonneau for a ute, or a booth re-upholstery for a café.\n\nWe work from a fully equipped workshop in Toronto and offer on-site inspections for marine and commercial work. Drop in, call us on 1300 799 882, or request a quote online — we'll help you find the right solution for your trimming, upholstery or cover needs.`,
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
  meta: {
    title: 'About Winning Trimming — Lake Macquarie Trimming Specialists',
    description: 'Marine, automotive, caravan, trade and commercial trimming specialists based in Toronto, Lake Macquarie. Serving Newcastle, the Hunter Valley and the Central Coast.',
  },
}

// Export the quoteLink for reuse in home/index
export { quoteLink }
