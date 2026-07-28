import type { Payload } from 'payload'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type RegionData = { title: string; description: string }

const regionsData: RegionData[] = [
  {
    title: 'Port Stephens',
    description:
      'A premier boating destination north of Newcastle with marinas at Nelson Bay, Corlette and Soldiers Point.',
  },
  {
    title: 'Newcastle & Hunter',
    description:
      "Newcastle Harbour and the broader Hunter region, home to Newcastle Cruising Yacht Club and extensive waterway access.",
  },
  {
    title: 'Lake Macquarie',
    description:
      "Australia's largest coastal saltwater lake with marinas at Marmong Point, Marks Point and Belmont.",
  },
  {
    title: 'Central Coast',
    description:
      'Brisbane Water and Tuggerah Lakes — boating from Gosford to Ettalong and beyond.',
  },
  {
    title: 'Pittwater & Hawkesbury',
    description:
      "One of Sydney's strongest boating areas, from Palm Beach to the Hawkesbury River.",
  },
  {
    title: 'Middle Harbour',
    description:
      'Separated by Spit Bridge, a distinct boating enclave with marinas from The Spit to Roseville.',
  },
  {
    title: 'Sydney Harbour',
    description:
      'The heart of Sydney boating — from Rushcutters Bay to Rose Bay and beyond.',
  },
  {
    title: 'Parramatta River',
    description:
      'Western harbour access with marinas at Cabarita, Gladesville and Drummoyne.',
  },
]

type SuburbData = { title: string; region: string; postcode?: number }

const suburbsData: SuburbData[] = [
  // Port Stephens
  { title: 'Nelson Bay', region: 'Port Stephens', postcode: 2316 },
  { title: 'Corlette', region: 'Port Stephens', postcode: 2315 },
  { title: 'Salamander Bay', region: 'Port Stephens', postcode: 2317 },
  { title: 'Soldiers Point', region: 'Port Stephens', postcode: 2317 },
  { title: 'Shoal Bay', region: 'Port Stephens', postcode: 2315 },
  { title: 'Anna Bay', region: 'Port Stephens', postcode: 2316 },
  { title: 'Lemon Tree Passage', region: 'Port Stephens', postcode: 2319 },
  { title: 'Tanilba Bay', region: 'Port Stephens', postcode: 2319 },
  { title: 'Karuah', region: 'Port Stephens', postcode: 2324 },
  // Newcastle & Hunter
  { title: 'Newcastle', region: 'Newcastle & Hunter', postcode: 2300 },
  { title: 'Wickham', region: 'Newcastle & Hunter', postcode: 2293 },
  { title: 'Carrington', region: 'Newcastle & Hunter', postcode: 2294 },
  { title: 'Stockton', region: 'Newcastle & Hunter', postcode: 2295 },
  { title: 'Hamilton', region: 'Newcastle & Hunter', postcode: 2303 },
  { title: 'Mayfield', region: 'Newcastle & Hunter', postcode: 2304 },
  { title: 'Maitland', region: 'Newcastle & Hunter', postcode: 2320 },
  { title: 'Cessnock', region: 'Newcastle & Hunter', postcode: 2325 },
  // Lake Macquarie
  { title: 'Toronto', region: 'Lake Macquarie', postcode: 2283 },
  { title: 'Belmont', region: 'Lake Macquarie', postcode: 2280 },
  { title: 'Marks Point', region: 'Lake Macquarie', postcode: 2282 },
  { title: 'Marmong Point', region: 'Lake Macquarie', postcode: 2284 },
  { title: 'Speers Point', region: 'Lake Macquarie', postcode: 2284 },
  { title: 'Warners Bay', region: 'Lake Macquarie', postcode: 2282 },
  { title: 'Swansea', region: 'Lake Macquarie', postcode: 2281 },
  { title: 'Coal Point', region: 'Lake Macquarie', postcode: 2283 },
  { title: 'Valentine', region: 'Lake Macquarie', postcode: 2280 },
  { title: 'Charlestown', region: 'Lake Macquarie', postcode: 2290 },
  // Central Coast
  { title: 'Gosford', region: 'Central Coast', postcode: 2250 },
  { title: 'Woy Woy', region: 'Central Coast', postcode: 2256 },
  { title: 'Ettalong', region: 'Central Coast', postcode: 2257 },
  { title: 'Booker Bay', region: 'Central Coast', postcode: 2257 },
  { title: 'Saratoga', region: 'Central Coast', postcode: 2251 },
  { title: 'Davistown', region: 'Central Coast', postcode: 2251 },
  { title: 'Killcare', region: 'Central Coast', postcode: 2257 },
  { title: 'Hardys Bay', region: 'Central Coast', postcode: 2257 },
  { title: 'Empire Bay', region: 'Central Coast', postcode: 2257 },
  { title: 'Koolewong', region: 'Central Coast', postcode: 2256 },
  { title: 'Terrigal', region: 'Central Coast', postcode: 2260 },
  { title: 'Wyong', region: 'Central Coast', postcode: 2259 },
  // Pittwater & Hawkesbury
  { title: 'Palm Beach', region: 'Pittwater & Hawkesbury', postcode: 2108 },
  { title: 'Avalon', region: 'Pittwater & Hawkesbury', postcode: 2107 },
  { title: 'Newport', region: 'Pittwater & Hawkesbury', postcode: 2106 },
  { title: 'Mona Vale', region: 'Pittwater & Hawkesbury', postcode: 2103 },
  { title: 'Bayview', region: 'Pittwater & Hawkesbury', postcode: 2104 },
  { title: 'Church Point', region: 'Pittwater & Hawkesbury', postcode: 2105 },
  { title: 'Clareville', region: 'Pittwater & Hawkesbury', postcode: 2084 },
  { title: 'Brooklyn', region: 'Pittwater & Hawkesbury', postcode: 2083 },
  { title: 'Bobbin Head', region: 'Pittwater & Hawkesbury' },
  { title: 'Akuna Bay', region: 'Pittwater & Hawkesbury' },
  { title: 'Berowra Waters', region: 'Pittwater & Hawkesbury', postcode: 2082 },
  // Middle Harbour
  { title: 'The Spit', region: 'Middle Harbour' },
  { title: 'Mosman', region: 'Middle Harbour', postcode: 2088 },
  { title: 'Clontarf', region: 'Middle Harbour' },
  { title: 'Seaforth', region: 'Middle Harbour', postcode: 2092 },
  { title: 'Balgowlah', region: 'Middle Harbour', postcode: 2093 },
  { title: 'Northbridge', region: 'Middle Harbour', postcode: 2063 },
  { title: 'Castlecrag', region: 'Middle Harbour', postcode: 2068 },
  { title: 'Roseville Chase', region: 'Middle Harbour', postcode: 2069 },
  { title: 'Killarney Heights', region: 'Middle Harbour', postcode: 2087 },
  // Sydney Harbour
  { title: 'Rushcutters Bay', region: 'Sydney Harbour', postcode: 2011 },
  { title: 'Rose Bay', region: 'Sydney Harbour', postcode: 2029 },
  { title: 'Double Bay', region: 'Sydney Harbour', postcode: 2028 },
  { title: 'Neutral Bay', region: 'Sydney Harbour', postcode: 2089 },
  { title: 'Mosman Bay', region: 'Sydney Harbour', postcode: 2088 },
  { title: 'Watsons Bay', region: 'Sydney Harbour', postcode: 2030 },
  { title: 'Balmain', region: 'Sydney Harbour', postcode: 2041 },
  // Parramatta River
  { title: 'Cabarita', region: 'Parramatta River', postcode: 2137 },
  { title: 'Concord', region: 'Parramatta River', postcode: 2137 },
  { title: 'Drummoyne', region: 'Parramatta River', postcode: 2047 },
  { title: 'Gladesville', region: 'Parramatta River', postcode: 2111 },
  { title: 'Putney', region: 'Parramatta River', postcode: 2112 },
  { title: 'Rhodes', region: 'Parramatta River', postcode: 2138 },
]

/**
 * Seed regions, suburbs for the SEO matrix.
 */
export const seedLocations = async (payload: Payload) => {
  payload.logger.info(`— Seeding regions...`)

  const regionIds: Record<string, string | number> = {}
  for (const r of regionsData) {
    const doc = await payload.create({
      collection: 'regions',
      data: { title: r.title, description: r.description, slug: slugify(r.title), slugLock: false },
    })
    regionIds[r.title] = doc.id
  }

  payload.logger.info(`— Seeding suburbs...`)

  const suburbIds: Record<string, string | number> = {}
  for (const s of suburbsData) {
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

  payload.logger.info(
    `— Seeded ${regionsData.length} regions and ${suburbsData.length} suburbs.`,
  )

  return { regionIds, suburbIds }
}
