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
  seoContent?: string
  products: string[]
}[] = [
  {
    title: 'Yachts',
    singular: 'Yacht',
    intro: 'From trailer-sailers to cruising yachts, we craft covers, canvas and upholstery built for life on the water.',
    seoContent: `Winning Trimming builds and repairs custom covers, canvas and upholstery for yachts of all sizes — from trailer-sailers to cruising yachts. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we understand the unique demands of yacht ownership and deliver trimming that stands up to salt, sun and long passages.\n\nOur yacht services include weather covers, bimini tops, dodgers, flybridge enclosures, sail covers and stack packs, sunbed cushions, marine seats, cockpit cushions, cabin mattresses, interior panels, marine carpet and hull lining. We pattern every job on the boat for a precise fit, using marine-grade Sunbrella and WeatherMax canvas, UV-stable thread, stainless steel fasteners and Strataglass clear vinyl.\n\nWhether you're cruising the coast, racing on the lake, or living aboard, we build yacht canvas and upholstery that protects your investment and makes every trip more comfortable. Drop in to our Toronto workshop or arrange an on-site inspection at your marina.`,
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
    seoContent: `Winning Trimming builds custom covers, canvas and upholstery for catamarans — both power and sail. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we understand the wide-beam, open-cockpit layout of modern catamarans and build trimming that maximises comfort and protection.\n\nOur catamaran services include weather covers, bimini tops, dodgers, cockpit enclosures, seats, cushions and mattresses. We pattern every job on the boat for a precise fit, using marine-grade canvas, UV-stable thread and stainless steel fasteners. Catamarans have unique canvas requirements — wider spans, more shade area, and different helm configurations — and we build accordingly.\n\nWhether you're coastal cruising or living aboard, we build catamaran canvas and upholstery that makes the most of your boat's space and keeps you comfortable in all conditions.`,
    products: ['Weather Covers', 'Bimini Tops', 'Dodgers', 'Cockpit Enclosures', 'Seats', 'Cushions', 'Mattresses'],
  },
  {
    title: 'Inflatable Boats (RIBs)',
    singular: 'Inflatable Boat',
    intro: 'RIBs take a beating — tough covers and seat trim that stand up to the abuse.',
    seoContent: `Winning Trimming builds tough covers and seat trim for inflatable boats and RIBs. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build weather covers, towing covers and seat upholstery that stand up to the abuse that RIBs endure — beach landings, high-speed turns, sun and salt.\n\nOur RIB services include weather covers, towing covers, and seat re-trims. We use heavy-duty, UV-stable materials with reinforced stitching and stainless fasteners, patterned on the boat for a precise fit. Whether your RIB is a tender, a dive boat or a rescue vessel, we build covers and trim that last.`,
    products: ['Weather Covers', 'Towing Covers', 'Seats', 'Cushions'],
  },
  {
    title: 'Jet Skis',
    singular: 'Jet Ski',
    intro: 'Compact weather and towing covers plus seat re-trims for personal watercraft.',
    seoContent: `Winning Trimming builds compact weather and towing covers and seat re-trims for jet skis and personal watercraft. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build covers that protect your PWC from sun, rain and road grime, and seat trim that's comfortable and durable.\n\nOur jet ski services include weather covers, towing covers, and seat re-trims. We use UV-stable, waterproof materials with reinforced edges and quick-release fasteners, patterned on the ski for a precise fit. Whether you're a weekend warrior or a competitive rider, we build PWC covers and trim that protect your investment.`,
    products: ['Weather Covers', 'Towing Covers', 'Seats'],
  },
  {
    title: 'Outboard Motors',
    singular: 'Outboard Motor',
    intro: 'Protect your outboard with a custom weather or towing cover.',
    seoContent: `Winning Trimming builds custom weather and towing covers for outboard motors. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build covers that protect your outboard from UV, salt and road grime — extending the life of your engine's cowling, wiring and hydraulics.\n\nOur outboard motor covers are made from UV-stable, waterproof materials with reinforced edges and elastic or buckle fasteners, patterned on the motor for a precise fit. Whether you have a single 15hp or twin 300s, we build outboard covers that protect your investment.`,
    products: ['Weather Covers', 'Towing Covers'],
  },
  {
    title: 'Pontoons',
    singular: 'Pontoon',
    intro: 'Pontoon tops, seating and flooring built for entertaining on the water.',
    seoContent: `Winning Trimming builds pontoon tops, seating and flooring for entertaining on the water. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build bimini tops, seating and carpet that make your pontoon the perfect platform for family days out and entertaining.\n\nOur pontoon services include weather covers, bimini tops, seats, cushions and carpet. We use UV-stable marine vinyl, high-density foam and solution-dyed marine carpet, all patterned on the boat for a precise fit. Whether you're cruising the lake or hosting a party, we build pontoon trim that's comfortable, durable and stylish.`,
    products: ['Weather Covers', 'Bimini Tops', 'Seats', 'Cushions', 'Carpet'],
  },
  {
    title: 'Power Boats',
    singular: 'Power Boat',
    intro: 'Biminis, clears and upholstery for runabouts, bowriders and sport boats.',
    seoContent: `Winning Trimming builds biminis, clears and upholstery for power boats — from runabouts and bowriders to sport boats and cruisers. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build canvas and trim that enhances your time on the water.\n\nOur power boat services include weather covers, towing covers, bimini tops, dodgers, cockpit enclosures, seats and cushions. We use marine-grade canvas, UV-stable vinyl and premium clear vinyl, all patterned on the boat for a precise fit. Whether you're skiing, fishing or cruising, we build power boat canvas and upholstery that lasts.`,
    products: ['Weather Covers', 'Towing Covers', 'Bimini Tops', 'Dodgers', 'Cockpit Enclosures', 'Seats', 'Cushions'],
  },
  {
    title: 'Row Boats',
    singular: 'Row Boat',
    intro: 'Simple, durable covers and seating for dinghies and row boats.',
    seoContent: `Winning Trimming builds simple, durable covers and seating for row boats and dinghies. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build weather covers, towing covers and seat cushions that are practical, affordable and built to last.\n\nOur row boat services include weather covers and towing covers using heavy-duty, UV-stable materials with reinforced edges and simple fasteners. We also build replacement seat cushions using marine-grade vinyl and high-density foam. Whether your dinghy is a tender, a fishing boat or a lake cruiser, we build covers and trim that do the job.`,
    products: ['Weather Covers', 'Towing Covers'],
  },
  {
    title: 'Sail Boats',
    singular: 'Sail Boat',
    intro: 'Sail covers, biminis and cockpit canvas for the sailing fleet.',
    seoContent: `Winning Trimming builds sail covers, biminis and cockpit canvas for sail boats of all sizes. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build canvas that protects your sails and rigging while keeping the cockpit comfortable in all conditions.\n\nOur sail boat services include sail covers and stack packs, bimini tops, dodgers, cockpit enclosures, cushions and seats. We use marine-grade Sunbrella canvas, UV-stable thread and stainless steel fittings, all patterned on the boat for a precise fit. Whether you're a weekend racer or a coastal cruiser, we build sail boat canvas that lasts.`,
    products: ['Sail Covers', 'Bimini Tops', 'Dodgers', 'Cockpit Enclosures', 'Cushions', 'Seats'],
  },
  {
    title: 'Fishing Boats',
    singular: 'Fishing Boat',
    intro: 'Hard-wearing covers, clears and upholstery for fishing boats that work hard.',
    seoContent: `Winning Trimming builds hard-wearing covers, clears and upholstery for fishing boats that work hard. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build canvas and trim that stands up to blood, bait, sun and salt — keeping you comfortable and protected on the water.\n\nOur fishing boat services include weather covers, towing covers, bimini tops, cockpit enclosures, seats and cushions. We use marine-grade vinyl that's easy to clean, UV-stable canvas, and reinforced stitching at stress points. Whether you're a tournament angler or a weekend fisher, we build fishing boat canvas and upholstery that takes the knocks.`,
    products: ['Weather Covers', 'Towing Covers', 'Bimini Tops', 'Cockpit Enclosures', 'Seats', 'Cushions'],
  },
  {
    title: 'Tenders',
    singular: 'Tender',
    intro: 'Tender covers and cushions that pack down small and last.',
    seoContent: `Winning Trimming builds tender covers and cushions that pack down small and last. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build practical, compact covers and cushions for tenders and dinghies that stow on board or on deck.\n\nOur tender services include weather covers, towing covers, seats and cushions. We use UV-stable, waterproof materials that fold compactly for stowage, with reinforced edges and simple fasteners. Whether your tender is a RIB, a tinny or a nesting dinghy, we build covers and trim that protect it and keep it comfortable.`,
    products: ['Weather Covers', 'Towing Covers', 'Seats', 'Cushions'],
  },
  {
    title: 'Tinnies',
    singular: 'Tinnie',
    intro: 'Tough, practical covers and seats for aluminium tinnies.',
    seoContent: `Winning Trimming builds tough, practical covers and seats for aluminium tinnies. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build no-nonsense covers and seat trim that do the job without breaking the budget.\n\nOur tinny services include weather covers, towing covers and seat re-trims. We use UV-stable, waterproof materials with reinforced edges and buckle fasteners, patterned on the boat for a precise fit. Whether your tinny is a fishing boat, a tender or a family runabout, we build covers and trim that are practical and affordable.`,
    products: ['Weather Covers', 'Towing Covers', 'Seats'],
  },
  {
    title: 'Super Yachts',
    singular: 'Super Yacht',
    intro: 'For super yacht owners and captains, we deliver premium covers, canvas and upholstery that meet the highest standards of finish and durability.',
    seoContent: `Winning Trimming delivers premium covers, canvas and upholstery for super yachts, meeting the highest standards of finish and durability. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we work with owners, captains and crew to deliver trimming that meets super yacht specifications.\n\nOur super yacht services include weather covers, bimini tops, dodgers, flybridge enclosures, sail covers, sunbed cushions, seats, cushions, mattresses, interior panels, carpet and hull lining. We use premium marine-grade fabrics — Sunbrella, WeatherMax, Strataglass — with UV-stable thread, stainless steel fasteners, and meticulous attention to detail.\n\nWhether your super yacht is visiting Australian waters or based locally, we deliver canvas and upholstery that meets the highest standards.`,
    products: [
      'Weather Covers', 'Bimini Tops', 'Dodgers', 'Flybridge Enclosures',
      'Sail Covers', 'Sun Beds', 'Seats', 'Cushions', 'Mattresses',
      'Interior Panels', 'Carpet', 'Hull Lining',
    ],
  },
  {
    title: 'Houseboats',
    singular: 'Houseboat',
    intro: 'Houseboats need to feel like home on the water — we craft covers, upholstery and trim that make life aboard comfortable and lasting.',
    seoContent: `Winning Trimming crafts covers, upholstery and trim for houseboats, making life aboard comfortable and lasting. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build houseboat canvas and trim that turns the vessel into a true home on the water.\n\nOur houseboat services include weather covers, bimini tops, seats, cushions, mattresses, interior panels, carpet and hull lining. We use marine-grade vinyl, UV-stable canvas, high-density foam and mildew-resistant materials, all patterned on the boat for a precise fit. Houseboats have unique requirements — more living space, more interior trim, and more wear from full-time use — and we build accordingly.\n\nWhether your houseboat is on Lake Macquarie, the Hawkesbury or the Murray, we build houseboat trim that makes life aboard comfortable and durable.`,
    products: [
      'Weather Covers', 'Bimini Tops', 'Seats', 'Cushions', 'Mattresses',
      'Interior Panels', 'Carpet', 'Hull Lining',
    ],
  },
]

/**
 * Expand a product title list to include both the custom AND repair variants.
 * e.g. ['Weather Covers'] → ['Weather Covers', 'Weather Cover Repairs']
 */
const withRepairs = (products: string[]): string[] => {
  const result: string[] = []
  for (const p of products) {
    result.push(p)
    const singular = p.endsWith('s') && !p.endsWith('ss') ? p.slice(0, -1) : p
    result.push(`${singular} Repairs`)
  }
  return result
}

export const seedMatrix = async (payload: Payload, typeIds: TypeIds, media?: Record<string, string | number>) => {
  payload.logger.info(`— Seeding asset types (Marine)...`)

  for (const asset of marineAssets) {
    // Assign hero image if available (key: '{slug}-hero')
    const heroKey = `${slugify(asset.title)}-hero`
    const heroImage = media?.[heroKey] ?? null

    await payload.create({
      collection: 'asset-types',
      data: {
        title: asset.title,
        singular: asset.singular ?? '',
        pillar: 'marine',
        intro: asset.intro,
        seoContent: asset.seoContent ?? '',
        heroImage: heroImage as number | null,
        applicableProducts: withRepairs(asset.products)
          .map((t) => typeIds[t])
          .filter(Boolean) as number[],
        meta: {
          title: `${asset.title} Trimming, Covers & Upholstery — Lake Macquarie | Winning Trimming`,
          description: asset.intro,
        },
        slug: slugify(asset.title),
        slugLock: false,
      },
    })
  }

  payload.logger.info(`— Seeded ${marineAssets.length} Marine asset types.`)
}
