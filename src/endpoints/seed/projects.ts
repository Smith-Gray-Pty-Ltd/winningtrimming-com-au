import type { Payload } from 'payload'

import { h, p, root } from './helpers'

type MediaMap = Record<string, string | number>

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Managed sub-category service types, grouped by pillar.
 * Marine product types match the SEO-matrix product list.
 */
const serviceTypeData: { title: string; pillar: string; intro?: string }[] = [
  // Marine product types
  { title: 'Weather Covers', pillar: 'marine', intro: 'Custom weather covers built to protect your vessel from sun, rain and salt.' },
  { title: 'Towing Covers', pillar: 'marine', intro: 'Heavy-duty towing covers that protect your boat on the road.' },
  { title: 'Bimini Tops', pillar: 'marine', intro: 'Custom bimini tops for shade and shelter on the water.' },
  { title: 'Dodgers', pillar: 'marine', intro: 'Front dodgers that block wind and spray at the helm.' },
  { title: 'Flybridge Enclosures', pillar: 'marine', intro: 'Flybridge enclosures for year-round comfort up top.' },
  { title: 'Cockpit Enclosures', pillar: 'marine', intro: 'Cockpit clear enclosures that extend your boating season.' },
  { title: 'Sail Covers', pillar: 'marine', intro: 'Sail covers and stack packs to protect your sails and rigging.' },
  { title: 'Sun Beds', pillar: 'marine', intro: 'Sunbed cushions for relaxing on the bow or deck.' },
  { title: 'Seats', pillar: 'marine', intro: 'Marine seat upholstery and re-trims built for comfort and durability.' },
  { title: 'Cushions', pillar: 'marine', intro: 'Custom marine cushions, from cockpit to cabin.' },
  { title: 'Mattresses', pillar: 'marine', intro: 'Boat mattresses made to fit awkward cabin berths.' },
  { title: 'Interior Panels', pillar: 'marine', intro: 'Interior headliner and panel trimming for a finished cabin.' },
  { title: 'Carpet', pillar: 'marine', intro: 'Marine-grade carpet and flooring solutions.' },
  { title: 'Hull Lining', pillar: 'marine', intro: 'Hull lining and insulation for a quieter, smarter cabin.' },
  // Automotive
  { title: 'Tonneau Covers', pillar: 'automotive', intro: 'Custom tonneau and tray covers for utes and trucks.' },
  { title: 'Seat Trim', pillar: 'automotive', intro: 'Seat re-trims and upholstery for cars, vans and 4x4s.' },
  { title: 'Headlinings', pillar: 'automotive', intro: 'Headlining repair and replacement.' },
  { title: 'Door Trims', pillar: 'automotive', intro: 'Door trim and panel upholstery.' },
  // Caravan & RV
  { title: 'Annexes', pillar: 'caravan-and-rv', intro: 'Annexes and shade walls for caravans and motorhomes.' },
  { title: 'Cushions & Mattresses', pillar: 'caravan-and-rv', intro: 'Cushions and mattresses for caravans and RVs.' },
  { title: 'Interior Trim', pillar: 'caravan-and-rv', intro: 'Interior trim and upholstery for vans and campers.' },
  // Trade & Industrial
  { title: 'Machinery Covers', pillar: 'trade-and-industrial', intro: 'Heavy-duty covers for machinery and plant.' },
  { title: 'Operator Seats', pillar: 'trade-and-industrial', intro: 'Operator seat trimming and repair.' },
  // Commercial
  { title: 'Booth Upholstery', pillar: 'commercial', intro: 'Booth seating upholstery for cafés and restaurants.' },
  { title: 'Office Chairs', pillar: 'commercial', intro: 'Office chair re-upholstery and repair.' },
]

type ProjectData = {
  title: string
  pillar: string
  summary: string
  location: string
  materials: string
  completed: string
  featuredImage: keyof MediaMap
  gallery?: { image: keyof MediaMap; caption?: string }[]
  beforeAfter?: { before: keyof MediaMap; after: keyof MediaMap; caption?: string }[]
  serviceTypes: string[]
  content: ReturnType<typeof root>
  featured?: boolean
}

const projects: ProjectData[] = [
  {
    title: 'Bayliner Bimini & Infill Refit',
    pillar: 'marine',
    summary:
      'A full replacement bimini top with matching infill panels for a family bowrider, built from marine-grade canvas to handle the Lake Macquarie sun.',
    location: 'Toronto, Lake Macquarie',
    materials: 'Sunbrella canvas, stainless frame fittings',
    completed: '2025-03-15',
    featuredImage: 'boats',
    gallery: [
      { image: 'marine', caption: 'Stitched and ready for fitting' },
      { image: 'boats', caption: 'Installed on the water' },
    ],
    serviceTypes: ['Bimini Tops', 'Cushions'],
    content: root([
      h('The brief', 'h2'),
      p('The original bimini was torn and faded after years on the water. The owner wanted a like-for-like replacement in a tougher, UV-stable canvas with a cleaner finish.'),
      h('What we did', 'h2'),
      p('We patterned a new three-bow bimini in Sunbrella, added front and rear infills for extra shade, and replaced all the fittings with stainless hardware for a long, corrosion-free life.'),
    ]),
    featured: true,
  },
  {
    title: 'Stacer Cockpit Clear Screen',
    pillar: 'marine',
    summary:
      'A new cockpit clear screen and side panels giving year-round weather protection without losing the open-boat feel.',
    location: 'Newcastle',
    materials: 'Heavy-duty clear PVC, marine canvas borders',
    completed: '2025-02-02',
    featuredImage: 'marine',
    serviceTypes: ['Cockpit Enclosures'],
    content: root([
      h('The brief', 'h2'),
      p('The owner wanted to extend their boating season with a clear screen that rolls up out of the way in summer.'),
      h('What we did', 'h2'),
      p('We built a three-piece clear screen with canvas borders that zips onto the existing bimini, giving wind and spray protection that can be rolled away when not needed.'),
    ]),
  },
  {
    title: 'Hilux Hard Tonneau Cover',
    pillar: 'automotive',
    summary:
      'A custom-fitted tonneau cover for a work ute, built tough enough for daily trade use while keeping the tray clean and secure.',
    location: 'Maitland',
    materials: 'Marine-grade vinyl, alloy framing',
    completed: '2025-04-10',
    featuredImage: 'utes',
    gallery: [{ image: 'trade', caption: 'Built for daily use' }],
    serviceTypes: ['Tonneau Covers'],
    content: root([
      h('The brief', 'h2'),
      p('A tradesperson needed a durable tonneau that would survive being loaded around every day and keep tools out of sight.'),
      h('What we did', 'h2'),
      p('We fabricated a vinyl tonneau over a lightweight alloy frame with tension buckles, giving a clean, weather-tight finish that is easy to roll back when carrying tall loads.'),
    ]),
  },
  {
    title: 'Commodore Front Seat Re-trim',
    pillar: 'automotive',
    summary:
      'Bolster repair and a full leather-look re-trim on worn front seats, bringing the interior back to better-than-new condition.',
    location: 'Central Coast',
    materials: 'Premium vinyl, high-density foam',
    completed: '2025-01-20',
    featuredImage: 'recreational',
    beforeAfter: [
      {
        before: 'recreational',
        after: 'utes',
        caption: 'Driver bolster rebuilt and re-trimmed (placeholder images — swap via the admin).',
      },
    ],
    serviceTypes: ['Seat Trim'],
    content: root([
      h('The brief', 'h2'),
      p('The driver bolster had collapsed and the vinyl was cracked. The owner wanted the seats restored rather than replaced.'),
      h('What we did', 'h2'),
      p('We rebuilt the foam in the worn bolsters, repaired the frames, and re-trimmed both front seats in a premium vinyl matched to the original finish.'),
    ]),
  },
  {
    title: 'Jayco Annexe & Shade Wall',
    pillar: 'caravan-and-rv',
    summary:
      'A replacement annexe room and shade wall for a pop-top caravan, made to measure for touring the Hunter and beyond.',
    location: 'Hunter Valley',
    materials: 'Canvas, weighted hem',
    completed: '2024-12-08',
    featuredImage: 'rvs',
    gallery: [{ image: 'rvs', caption: 'Made to measure on site' }],
    serviceTypes: ['Annexes'],
    content: root([
      h('The brief', 'h2'),
      p('The original annexe was showing its age after a decade of touring. The owners wanted a lighter, easier-to-erect replacement with a shade wall.'),
      h('What we did', 'h2'),
      p('We patterned a new annexe and shade wall in durable canvas, fitted to the van and tested on site before they headed off.'),
    ]),
  },
  {
    title: 'Excavator Cab Weather Cover',
    pillar: 'trade-and-industrial',
    summary:
      'A heavy-duty cab cover for a 20-tonne excavator, keeping the operator out of the wind and rain on site year-round.',
    location: 'Newcastle',
    materials: 'Heavy-duty PVC, clear window panels',
    completed: '2025-05-01',
    featuredImage: 'trade',
    serviceTypes: ['Machinery Covers', 'Operator Seats'],
    content: root([
      h('The brief', 'h2'),
      p('An earthworks contractor needed a weather cover for an excavator working through winter.'),
      h('What we did', 'h2'),
      p('We fabricated a heavy-duty PVC cab cover with clear window panels, patterned to the machine so it fits snugly and stays put in high winds.'),
    ]),
  },
  {
    title: 'Café Booth Re-upholstery',
    pillar: 'commercial',
    summary:
      'Re-upholstery of worn booth seating for a busy lakeside café, in a durable vinyl chosen to handle daily spills and heavy use.',
    location: 'Lake Macquarie',
    materials: 'Commercial-grade vinyl, fire-retardant foam',
    completed: '2025-03-28',
    featuredImage: 'recreational',
    gallery: [{ image: 'marine', caption: 'Fresh finish, ready for service' }],
    serviceTypes: ['Booth Upholstery'],
    content: root([
      h('The brief', 'h2'),
      p('A café\'s booth seating was cracked and stained from years of service. They wanted a durable refresh that would hold up to daily use.'),
      h('What we did', 'h2'),
      p('We re-foamed and re-covered the booth runs in a commercial-grade, easy-clean vinyl, replacing damaged panels and re-stitching seams to extend the life of the furniture.'),
    ]),
  },
]

export const seedProjects = async (payload: Payload, media: MediaMap) => {
  payload.logger.info(`— Seeding service types...`)
  const typeIds: Record<string, string | number> = {}
  for (const st of serviceTypeData) {
    const doc = await payload.create({
      collection: 'service-types',
      data: {
        title: st.title,
        pillar: st.pillar,
        intro: st.intro ?? '',
        slug: slugify(st.title),
        slugLock: false,
      },
    })
    typeIds[st.title] = doc.id
  }

  payload.logger.info(`— Seeding projects...`)
  for (const proj of projects) {
    await payload.create({
      collection: 'projects',
      data: {
        title: proj.title,
        slug: slugify(proj.title),
        slugLock: false,
        pillar: proj.pillar,
        summary: proj.summary,
        location: proj.location,
        materials: proj.materials,
        completedAt: proj.completed,
        featured: proj.featured ?? false,
        featuredImage: media[proj.featuredImage],
        gallery: (proj.gallery ?? []).map((g) => ({
          image: media[g.image],
          caption: g.caption ?? null,
        })),
        beforeAfter: (proj.beforeAfter ?? []).map((ba) => ({
          before: media[ba.before],
          after: media[ba.after],
          caption: ba.caption ?? null,
        })),
        serviceTypes: proj.serviceTypes.map((t) => typeIds[t]).filter(Boolean),
        content: proj.content,
        _status: 'published',
      },
    })
  }

  payload.logger.info(`— Seeded ${serviceTypeData.length} service types and ${projects.length} projects.`)

  return typeIds
}
