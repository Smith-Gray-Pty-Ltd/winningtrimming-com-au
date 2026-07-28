import type { Payload } from 'payload'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type TypeIds = Record<string, string | number>

/**
 * Marine vessel types for the SEO matrix, each with the product types that
 * apply to it (controlling valid combinations).
 *
 * `applicableProducts` values must match service-type titles created by
 * seedProjects. Other pillars will be added the same way.
 */
const marineAssets: {
  title: string
  singular?: string
  intro: string
  products: string[]
}[] = [
  {
    title: 'Yachts',
    singular: 'Yacht',
    intro: 'From trailer-sailers to cruising yachts, we craft covers, canvas and upholstery built for life on the water.',
    products: [
      'Weather Covers', 'Bimini Tops', 'Dodgers', 'Flybridge Enclosures',
      'Sail Covers', 'Sun Beds', 'Seats', 'Cushions', 'Mattresses',
      'Interior Panels', 'Carpet', 'Hull Lining',
    ],
  },
  {
    title: 'Catamarans',
    singular: 'Catamaran',
    intro: 'Wide decks and open cockpits — we build covers and upholstery that suit the catamaran layout.',
    products: ['Weather Covers', 'Bimini Tops', 'Dodgers', 'Cockpit Enclosures', 'Seats', 'Cushions', 'Mattresses'],
  },
  {
    title: 'Inflatable Boats (RIBs)',
    singular: 'Inflatable Boat',
    intro: 'RIBs take a beating — tough covers and seat trim that stand up to the abuse.',
    products: ['Weather Covers', 'Towing Covers', 'Seats', 'Cushions'],
  },
  {
    title: 'Jet Skis',
    singular: 'Jet Ski',
    intro: 'Compact weather and towing covers plus seat re-trims for personal watercraft.',
    products: ['Weather Covers', 'Towing Covers', 'Seats'],
  },
  {
    title: 'Outboard Motors',
    singular: 'Outboard Motor',
    intro: 'Protect your outboard with a custom weather or towing cover.',
    products: ['Weather Covers', 'Towing Covers'],
  },
  {
    title: 'Pontoons',
    singular: 'Pontoon',
    intro: 'Pontoon tops, seating and flooring built for entertaining on the water.',
    products: ['Weather Covers', 'Bimini Tops', 'Seats', 'Cushions', 'Carpet'],
  },
  {
    title: 'Power Boats',
    singular: 'Power Boat',
    intro: 'Biminis, clears and upholstery for runabouts, bowriders and sport boats.',
    products: ['Weather Covers', 'Towing Covers', 'Bimini Tops', 'Dodgers', 'Cockpit Enclosures', 'Seats', 'Cushions'],
  },
  {
    title: 'Row Boats',
    singular: 'Row Boat',
    intro: 'Simple, durable covers and seating for dinghies and row boats.',
    products: ['Weather Covers', 'Towing Covers'],
  },
  {
    title: 'Sail Boats',
    singular: 'Sail Boat',
    intro: 'Sail covers, biminis and cockpit canvas for the sailing fleet.',
    products: ['Sail Covers', 'Bimini Tops', 'Dodgers', 'Cockpit Enclosures', 'Cushions', 'Seats'],
  },
  {
    title: 'Fishing Boats',
    singular: 'Fishing Boat',
    intro: 'Hard-wearing covers, clears and upholstery for fishing boats that work hard.',
    products: ['Weather Covers', 'Towing Covers', 'Bimini Tops', 'Cockpit Enclosures', 'Seats', 'Cushions'],
  },
  {
    title: 'Tenders',
    singular: 'Tender',
    intro: 'Tender covers and cushions that pack down small and last.',
    products: ['Weather Covers', 'Towing Covers', 'Seats', 'Cushions'],
  },
  {
    title: 'Tinnies',
    singular: 'Tinnie',
    intro: 'Tough, practical covers and seats for aluminium tinnies.',
    products: ['Weather Covers', 'Towing Covers', 'Seats'],
  },
  {
    title: 'Super Yachts',
    singular: 'Super Yacht',
    intro: 'For super yacht owners and captains, we deliver premium covers, canvas and upholstery that meet the highest standards of finish and durability.',
    products: [
      'Weather Covers', 'Bimini Tops', 'Dodgers', 'Flybridge Enclosures',
      'Sail Covers', 'Sun Beds', 'Seats', 'Cushions', 'Mattresses',
      'Interior Panels', 'Carpet', 'Hull Lining',
    ],
  },
]

export const seedMatrix = async (payload: Payload, typeIds: TypeIds) => {
  payload.logger.info(`— Seeding asset types (Marine)...`)

  for (const asset of marineAssets) {
    await payload.create({
      collection: 'asset-types',
      data: {
        title: asset.title,
        singular: asset.singular ?? '',
        pillar: 'marine',
        intro: asset.intro,
        applicableProducts: asset.products.map((t) => typeIds[t]).filter(Boolean),
        slug: slugify(asset.title),
        slugLock: false,
      },
    })
  }

  payload.logger.info(`— Seeded ${marineAssets.length} Marine asset types.`)
}
