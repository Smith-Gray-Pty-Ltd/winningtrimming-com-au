import type { Payload } from 'payload'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type RegionIds = Record<string, string | number>

type BusinessData = {
  title: string
  type: string
  region: string
  suburb: string
  description?: string
}

const businesses: BusinessData[] = [
  // ---- Port Stephens ----
  {
    title: "d'Albora Nelson Bay",
    type: 'marina',
    region: 'Port Stephens',
    suburb: 'Nelson Bay',
    description: 'Full-service marina in the heart of Nelson Bay with berths, fuel and facilities.',
  },
  {
    title: 'The Anchorage',
    type: 'marina',
    region: 'Port Stephens',
    suburb: 'Corlette',
    description: 'Marina and resort-style facility at Corlette on the southern shore of Port Stephens.',
  },
  {
    title: 'Soldiers Point Marina',
    type: 'marina',
    region: 'Port Stephens',
    suburb: 'Soldiers Point',
    description: 'Popular marina with berths, slipway and marine services at Soldiers Point.',
  },
  {
    title: 'Albatross Marina',
    type: 'marina',
    region: 'Port Stephens',
    suburb: 'Lemon Tree Passage',
    description: 'Boutique marina at Lemon Tree Passage on the Tilligerry Creek side of the port.',
  },

  // ---- Newcastle & Hunter ----
  {
    title: 'Newcastle Cruising Yacht Club',
    type: 'yacht-club',
    region: 'Newcastle & Hunter',
    suburb: 'Newcastle',
    description: "The key recreational boating hub on Newcastle Harbour, with marina berths and a active racing fleet.",
  },

  // ---- Lake Macquarie ----
  {
    title: 'Empire Marina Lake Macquarie',
    type: 'marina',
    region: 'Lake Macquarie',
    suburb: 'Marmong Point',
    description: 'The largest marina on Lake Macquarie at Marmong Point, with wet berths, dry storage and a boatyard.',
  },
  {
    title: 'Marks Point Marina',
    type: 'marina',
    region: 'Lake Macquarie',
    suburb: 'Marks Point',
    description: 'Long-established marina on the eastern shore of Lake Macquarie at Marks Point.',
  },
  {
    title: 'Lake Macquarie Yacht Club',
    type: 'yacht-club',
    region: 'Lake Macquarie',
    suburb: 'Belmont',
    description: 'Active sailing club and marina at Belmont on the south-eastern corner of the lake.',
  },

  // ---- Central Coast ----
  {
    title: 'Gosford Sailing Club',
    type: 'sailing-club',
    region: 'Central Coast',
    suburb: 'Gosford',
    description: 'Sailing club and marina on Brisbane Water at Gosford.',
  },
  {
    title: 'Central Coast Marina',
    type: 'marina',
    region: 'Central Coast',
    suburb: 'Booker Bay',
    description: 'Marina and boatyard at Booker Bay on Brisbane Water.',
  },

  // ---- Pittwater & Hawkesbury ----
  {
    title: 'Royal Prince Alfred Yacht Club',
    type: 'yacht-club',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Newport',
    description: 'One of Australia premier yacht clubs, with a large marina at Newport on Pittwater.',
  },
  {
    title: 'Holmeport Marinas',
    type: 'marina',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Church Point',
    description: 'Marina at Church Point serving the western Pittwater and Scotland Island community.',
  },
  {
    title: 'The Quays',
    type: 'marina',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Newport',
    description: 'Marina and dry-storage facility on Pittwater.',
  },
  {
    title: 'Gibson Marina',
    type: 'marina',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Bayview',
    description: 'Full-service marina at Bayview on Pittwater.',
  },
  {
    title: "d'Albora Akuna Bay",
    type: 'marina',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Akuna Bay',
    description: 'Marina in the protected waters of Akuna Bay, gateway to the Hawkesbury River.',
  },
  {
    title: 'Empire Marina Bobbin Head',
    type: 'marina',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Bobbin Head',
    description: 'Marina in Ku-ring-gai Chase National Park at Bobbin Head on the Hawkesbury.',
  },
  {
    title: 'Brooklyn Marina',
    type: 'marina',
    region: 'Pittwater & Hawkesbury',
    suburb: 'Brooklyn',
    description: 'Marina at Brooklyn, the gateway to the lower Hawkesbury River from Broken Bay.',
  },

  // ---- Middle Harbour ----
  {
    title: "d'Albora The Spit",
    type: 'marina',
    region: 'Middle Harbour',
    suburb: 'The Spit',
    description: 'Premium marina at The Spit (Spit Bridge), the gateway to Middle Harbour boating.',
  },
  {
    title: 'Clontarf Marina',
    type: 'marina',
    region: 'Middle Harbour',
    suburb: 'Clontarf',
    description: 'Marina near the Spit Bridge at Clontarf on Middle Harbour.',
  },
  {
    title: 'Middle Harbour Yacht Club',
    type: 'yacht-club',
    region: 'Middle Harbour',
    suburb: 'The Spit',
    description: 'Major yacht club and marina at The Spit on Middle Harbour.',
  },
  {
    title: 'Northbridge Marina',
    type: 'marina',
    region: 'Middle Harbour',
    suburb: 'Northbridge',
    description: 'Marina on the upper reaches of Middle Harbour at Northbridge.',
  },
  {
    title: 'Roseville Bridge Marina',
    type: 'marina',
    region: 'Middle Harbour',
    suburb: 'Roseville Chase',
    description: 'Marina at Roseville Bridge on the upper Middle Harbour.',
  },
  {
    title: 'Fergusons Boatshed',
    type: 'marina',
    region: 'Middle Harbour',
    suburb: 'The Spit',
    description: 'Historic boatshed and marina at The Spit, offering berths, slipway and repairs.',
  },

  // ---- Sydney Harbour ----
  {
    title: "d'Albora Rushcutters Bay",
    type: 'marina',
    region: 'Sydney Harbour',
    suburb: 'Rushcutters Bay',
    description: "Premium marina at Rushcutters Bay, home to the Cruising Yacht Club of Australia and the Sydney to Hobart start.",
  },
  {
    title: 'Rose Bay Marina',
    type: 'marina',
    region: 'Sydney Harbour',
    suburb: 'Rose Bay',
    description: 'Marina and ferry terminal on the southern shore of Sydney Harbour at Rose Bay.',
  },
  {
    title: 'Birkenhead Point Marina',
    type: 'marina',
    region: 'Sydney Harbour',
    suburb: 'Drummoyne',
    description: 'Marina at Birkenhead Point, serving the inner-west and Parramatta River entrance.',
  },

  // ---- Parramatta River ----
  {
    title: "d'Albora Cabarita Point",
    type: 'marina',
    region: 'Parramatta River',
    suburb: 'Cabarita',
    description: 'Marina at Cabarita Point on the Parramatta River, with berths and waterfront dining.',
  },
  {
    title: 'Gladesville Bridge Marina',
    type: 'marina',
    region: 'Parramatta River',
    suburb: 'Gladesville',
    description: 'Marina near the Gladesville Bridge on the Parramatta River.',
  },
]

export const seedBusinesses = async (payload: Payload, regionIds: RegionIds) => {
  payload.logger.info(`— Seeding businesses (marinas)...`)

  for (const biz of businesses) {
    await payload.create({
      collection: 'businesses',
      data: {
        title: biz.title,
        pillar: 'marine',
        type: biz.type,
        region: regionIds[biz.region],
        suburb: biz.suburb,
        description: biz.description ?? '',
        slug: slugify(biz.title),
        slugLock: false,
      },
    })
  }

  payload.logger.info(`— Seeded ${businesses.length} businesses.`)
}
