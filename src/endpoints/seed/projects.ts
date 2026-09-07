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
const serviceTypeData: { title: string; pillar: 'marine' | 'automotive' | 'caravan-and-rv' | 'trade-and-industrial' | 'commercial'; intro?: string }[] = [
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

export const seedProjects = async (payload: Payload, media: MediaMap) => {
  payload.logger.info(`— Seeding service types...`)
  const typeIds: Record<string, string | number> = {}
  for (const st of serviceTypeData) {
    const slug = slugify(st.title)
    const heroKey = `${slug}-hero`
    const heroImage = media[heroKey] ?? null
    const doc = await payload.create({
      collection: 'service-types',
      data: {
        title: st.title,
        pillar: st.pillar,
        intro: st.intro ?? '',
        heroImage: heroImage as number | null,
        slug,
        slugLock: false,
      },
    })
    typeIds[st.title] = doc.id
  }

  // Generate repair variants for each custom service type
  payload.logger.info(`— Seeding repair service types...`)
  for (const st of serviceTypeData) {
    const singular = st.title.endsWith('s') && !st.title.endsWith('ss')
      ? st.title.slice(0, -1)
      : st.title
    const repairTitle = `${singular} Repairs`
    const repairIntro = `Repair, re-stitch or re-cover your ${st.title.toLowerCase()}. Bring tired trim back to life at a fraction of the replacement cost.`
    const repairSlug = slugify(repairTitle)
    const repairHeroKey = `${repairSlug}-hero`
    const repairHeroImage = media[repairHeroKey] ?? null
    const doc = await payload.create({
      collection: 'service-types',
      data: {
        title: repairTitle,
        pillar: st.pillar,
        workType: 'repair',
        intro: repairIntro,
        heroImage: repairHeroImage as number | null,
        slug: repairSlug,
        slugLock: false,
      },
    })
    typeIds[repairTitle] = doc.id
  }

  payload.logger.info(
    `— Seeded ${serviceTypeData.length} custom + ${serviceTypeData.length} repair service types (projects are imported via the publish pipeline, not seeded).`,
  )

  return typeIds
}
