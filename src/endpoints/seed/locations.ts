import type { Payload } from 'payload'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Regions + starter suburbs for the SEO matrix. The full suburb list will be
 * added later via the admin/API — this just gives the template something to
 * render against.
 */
export const seedLocations = async (payload: Payload) => {
  payload.logger.info(`— Seeding regions...`)

  const regions: { title: string; description: string }[] = [
    { title: 'Lake Macquarie', description: "Australia's largest coastal saltwater lake, west of Newcastle." },
    { title: 'Newcastle', description: 'The Hunter region capital and second-largest NSW city.' },
    { title: 'Central Coast', description: 'The coast between Sydney and Newcastle.' },
    { title: 'Hunter Valley', description: 'The Hunter region inland from Newcastle.' },
  ]

  const regionIds: Record<string, string | number> = {}
  for (const r of regions) {
    const doc = await payload.create({
      collection: 'regions',
      data: { title: r.title, description: r.description, slug: slugify(r.title), slugLock: false },
    })
    regionIds[r.title] = doc.id
  }

  payload.logger.info(`— Seeding starter suburbs...`)

  const suburbs: { title: string; region: string; postcode?: number }[] = [
    // Lake Macquarie
    { title: 'Toronto', region: 'Lake Macquarie', postcode: 2283 },
    { title: 'Belmont', region: 'Lake Macquarie', postcode: 2280 },
    { title: 'Warners Bay', region: 'Lake Macquarie', postcode: 2282 },
    { title: 'Speers Point', region: 'Lake Macquarie', postcode: 2284 },
    { title: 'Charlestown', region: 'Lake Macquarie', postcode: 2290 },
    { title: 'Swansea', region: 'Lake Macquarie', postcode: 2281 },
    // Newcastle
    { title: 'Newcastle', region: 'Newcastle', postcode: 2300 },
    { title: 'Hamilton', region: 'Newcastle', postcode: 2303 },
    { title: 'Mayfield', region: 'Newcastle', postcode: 2304 },
    // Central Coast
    { title: 'Gosford', region: 'Central Coast', postcode: 2250 },
    { title: 'Terrigal', region: 'Central Coast', postcode: 2260 },
    { title: 'Wyong', region: 'Central Coast', postcode: 2259 },
    // Hunter Valley
    { title: 'Maitland', region: 'Hunter Valley', postcode: 2320 },
    { title: 'Cessnock', region: 'Hunter Valley', postcode: 2325 },
  ]

  const suburbIds: Record<string, string | number> = {}
  for (const s of suburbs) {
    const doc = await payload.create({
      collection: 'suburbs',
      data: {
        title: s.title,
        region: regionIds[s.region],
        postcode: s.postcode ?? null,
        intro: '',
        slug: slugify(s.title),
        slugLock: false,
      },
    })
    suburbIds[s.title] = doc.id
  }

  payload.logger.info(`— Seeded ${regions.length} regions and ${suburbs.length} suburbs.`)

  return { regionIds, suburbIds }
}
