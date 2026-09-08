/**
 * Seed script for caravan-and-rv, trade-and-industrial, and commercial pillars.
 *
 * Creates:
 *  - Asset types for each pillar (with applicableProducts linked to existing service types)
 *  - SEO content for each asset type
 *  - Image prompts for Flux (printed to console — generate separately)
 *
 * Usage:
 *   npx tsx src/endpoints/seed/empty-pillars.ts
 *
 * Requires the dev server running at WT_API_URL (default http://localhost:3010).
 */

const EMPTY_API_URL = process.env.WT_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3010'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function emptyLogin(): Promise<string | null> {
  const res = await fetch(`${EMPTY_API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.PAYLOAD_ADMIN_EMAIL || 'admin@winningtrimming.com.au',
      password: process.env.PAYLOAD_ADMIN_PASSWORD || '',
    }),
  })
  if (!res.ok) {
    console.error('Login failed:', res.status)
    return null
  }
  const data = await res.json()
  return data.token || null
}

let authToken: string | null = null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function fetchServiceTypes(pillar: string): Promise<Array<{ id: number; title: string; slug: string }>> {
  const res = await fetch(`${EMPTY_API_URL}/api/service-types?where[pillar][equals]=${pillar}&limit=200&depth=0&sort=title`)
  const data = await res.json()
  return (data.docs || []).map((d: { id: number; title: string; slug: string }) => ({ id: d.id, title: d.title, slug: d.slug }))
}

async function createAssetType(data: {
  title: string
  pillar: string
  singular?: string
  intro: string
  seoContent: string
  applicableProductIds: number[]
}): Promise<number | null> {
  const body = {
    title: data.title,
    slug: slugify(data.title),
    pillar: data.pillar,
    singular: data.singular || data.title.replace(/s$/, ''),
    intro: data.intro,
    seoContent: data.seoContent,
    applicableProducts: data.applicableProductIds,
    _status: 'published',
  }

  const res = await fetch(`${EMPTY_API_URL}/api/asset-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `JWT ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error(`  ✗ Failed to create "${data.title}":`, err.errors?.[0]?.message || err.message || res.status)
    return null
  }

  const result = await res.json()
  console.log(`  ✓ Created asset type: ${data.title} (id: ${result.doc.id})`)
  return result.doc.id
}

// ---------------------------------------------------------------------------
// Asset type data
// ---------------------------------------------------------------------------

type AssetTypeData = {
  title: string
  singular?: string
  intro: string
  seoContent: string
  products: string[] // service type titles to link
  imagePrompt: string
}

const caravanAssets: AssetTypeData[] = [
  {
    title: 'Caravans',
    singular: 'Caravan',
    intro: 'Custom and repair work for caravan and travel trailer trim, canvas and upholstery.',
    seoContent: `Caravan trimming and upholstery specialists serving the Lake Macquarie, Newcastle, Central Coast and Hunter Valley regions. Whether you tour on weekends or live full-time in your van, we build and repair the canvas, cushions and trim that make caravan life comfortable.\n\nFrom pop-top seals that keep the weather out to custom mattresses that fit awkward berth shapes, our Toronto workshop handles every aspect of caravan and RV trimming. We use marine-grade materials that withstand the harsh Australian climate — UV-stable threads, mildew-resistant canvas and durable foams that hold their shape season after season.\n\nCommon caravan trimming jobs include annexe repairs, cushion and mattress upgrades, interior panel trimming, window and hatch seal replacement, and full interior refits. For larger jobs we can come to your van to measure and fit on-site.`,
    products: ['Annexes', 'Cushions & Mattresses', 'Interior Trim'],
    imagePrompt: 'A modern caravan parked at a lakeside campsite in Australia, golden hour lighting, canvas annexe extended, professional photograph, wide angle, realistic',
  },
  {
    title: 'Motorhomes',
    singular: 'Motorhome',
    intro: 'Motorhome and campervan trim, canvas, cushions and interior panels.',
    seoContent: `Motorhome trimming and upholstery for campervans, motorhomes and RVs across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop builds and repairs the canvas, cushions and interior trim that make life on the road comfortable and durable.\n\nMotorhome trim takes a beating — sun, road vibration, and constant use. We use UV-stable threads, marine-grade canvas and high-density foams that last. Common jobs include cab seat re-trimming, swivel seat covers, bunk cushions, over-cab bed mattresses, cab curtains, and interior panel refurbishment.\n\nFor full refits we can measure and fit on-site at your storage yard or home. Custom mattresses made to fit any berth shape, with removable covers for easy cleaning.`,
    products: ['Cushions & Mattresses', 'Interior Trim'],
    imagePrompt: 'A modern motorhome interior with custom upholstered cab seats and cushions, warm natural lighting through windscreen, professional photograph, realistic, detailed stitching visible',
  },
  {
    title: 'Campervans',
    singular: 'Campervan',
    intro: 'Campervan canvas, cushions and interior trim — custom and repairs.',
    seoContent: `Campervan trimming and upholstery in Toronto, Lake Macquarie. Serving campervan owners across Newcastle, the Central Coast and Hunter Valley with custom canvas, cushions and interior trim built for the Australian road.\n\nCampervans pack a lot of living into a small space, and the trim has to work hard. We build custom seat cushions that convert to beds, privacy curtains, cab window covers, and storage covers. For repairs we handle worn cushion covers, torn canvas, damaged headlinings, and water-damaged interior panels.\n\nOur materials are chosen for durability — UV-stable threads, mildew-resistant canvas, and high-density foams that keep their shape through years of folding and unfolding.`,
    products: ['Annexes', 'Cushions & Mattresses', 'Interior Trim'],
    imagePrompt: 'A VW-style campervan with the side door open showing custom cushion upholstery, parked at a coastal lookout, afternoon light, professional photograph, realistic',
  },
]

const tradeAssets: AssetTypeData[] = [
  {
    title: 'Utes & Trucks',
    singular: 'Ute',
    intro: 'Tonneau covers, seat trimming and canopies for utes and light trucks.',
    seoContent: `Ute and truck trimming for trade vehicles across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop builds and repairs tonneau covers, operator seat trim, and soft canopies for working vehicles that take a beating every day.\n\nTrade vehicle trim has to be tough — UV-stable vinyl, heavy-duty threads, and hardware that survives daily use on work sites. We custom-make tonneau covers to fit any tray, with reinforced corners and weatherproof seams. For operator seats we use high-wear vinyl and replace damaged foam to restore comfort.\n\nCommon jobs include tonneau cover repairs, seat re-trimming, door trim replacement, headlining fixes, and custom tool covers. Fast turnaround to keep your vehicle on the road.`,
    products: ['Machinery Covers', 'Operator Seats'],
    imagePrompt: 'A tradesman ute with a custom black tonneau cover in a Australian work site, dust and tools visible, professional photograph, realistic, dramatic lighting',
  },
  {
    title: 'Machinery & Plant',
    singular: 'Machinery',
    intro: 'Covers and operator seat trimming for excavators, loaders and plant equipment.',
    seoContent: `Machinery and plant trimming for construction, agriculture and earthmoving equipment across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop builds custom machinery covers and repairs operator seat trim for excavators, loaders, skid steers and tractors.\n\nPlant equipment works in the harshest conditions — sun, dust, rain and abrasion. We use heavy-duty PVC and UV-stable materials for machinery covers that protect hydraulics, engines and cabs from the elements. For operator seats we use industrial-grade vinyl and high-density foam that withstands long hours in the seat.\n\nCommon jobs include excavator cab covers, hydraulic hose covers, operator seat re-trimming, and custom equipment covers. On-site measuring available for large machinery that can't be transported.`,
    products: ['Machinery Covers', 'Operator Seats'],
    imagePrompt: 'A yellow excavator with a custom black vinyl cab cover and reupholstered operator seat, construction site background, professional photograph, realistic, overcast day',
  },
  {
    title: 'Trailers',
    singular: 'Trailer',
    intro: 'Covers and trim for box trailers, plant trailers and custom trailers.',
    seoContent: `Trailer trimming and covers for box trailers, plant trailers, boat trailers and custom trailers across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop builds custom trailer covers and repairs trim for working and recreational trailers.\n\nTrailer covers protect your gear, materials or equipment from weather, dust and theft. We make custom-fit covers in heavy-duty PVC or canvas, with reinforced tie-down points and weatherproof seams. For enclosed trailers we also handle interior lining, bench upholstery and custom padding.\n\nFast turnaround to keep your trailer on the road. Common jobs include trailer cover repairs, replacement tie-downs, custom fit covers for irregular trailer shapes, and interior padding for enclosed trailers.`,
    products: ['Machinery Covers'],
    imagePrompt: 'A box trailer with a custom fitted black canvas cover on an Australian road, clear blue sky, professional photograph, realistic, side angle showing cover detail',
  },
]

const commercialAssets: AssetTypeData[] = [
  {
    title: 'Cafés & Restaurants',
    singular: 'Venue',
    intro: 'Booth upholstery, bench seating and chair re-covering for hospitality venues.',
    seoContent: `Commercial upholstery for cafés, restaurants and hospitality venues across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop builds and repairs booth seating, bench seating, bar stools, and dining chair upholstery for venues that need durable, stylish trim.\n\nHospitality upholstery takes a beating — spills, constant use, and cleaning chemicals. We use commercial-grade vinyls and fabrics that are easy to wipe down and built to last. Custom booth seating built to fit any space, with high-density foam that keeps its shape through years of service.\n\nCommon jobs include booth re-upholstery, bench seat recovering, bar stool re-covering, dining chair seats, and full venue refits. Fast turnaround available to minimise downtime — we can work after hours or in stages for venues that can't close.`,
    products: ['Booth Upholstery', 'Office Chairs'],
    imagePrompt: 'A modern café interior with custom upholstered booth seating in dark green vinyl, warm lighting, professional interior photograph, realistic, detailed stitching visible',
  },
  {
    title: 'Offices',
    singular: 'Office',
    intro: 'Office chair re-upholstery and commercial seating for workplaces.',
    seoContent: `Office and commercial upholstery for workplaces across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop re-upholsters office chairs, builds custom bench seating for reception areas, and handles contract seating runs for commercial fit-outs.\n\nOffice furniture takes daily wear — re-upholstering quality chairs costs a fraction of replacement and keeps them out of landfill. We use commercial-grade fabrics and vinyls that meet workplace standards, with foam replacement to restore comfort and support.\n\nCommon jobs include executive chair re-upholstery, task chair seat and back replacement, reception bench seating, boardroom chair refits, and contract runs for multi-site fit-outs. Pickup and delivery available for larger quantities.`,
    products: ['Office Chairs'],
    imagePrompt: 'A modern office with reupholstered task chairs in blue fabric, clean desk, natural light through window, professional interior photograph, realistic',
  },
  {
    title: 'Marine & Auto Trade',
    singular: 'Trade',
    intro: 'Contract upholstery services for marine and automotive trade businesses.',
    seoContent: `Contract upholstery services for marine and automotive trade businesses across Lake Macquarie, Newcastle, the Central Coast and Hunter Valley. Our Toronto workshop provides outsourced trimming and upholstery services for boat builders, marine mechanics, automotive trim shops, and dealerships that need overflow capacity or specialist skills.\n\nWe work to your specs — materials, stitching patterns, and turnaround times. Send us the job and we'll handle the trim. Common contract work includes marine cushion and canvas production, automotive seat re-trims, tonneau cover production runs, and custom one-off pieces for specialist vehicles or vessels.\n\nTrade pricing available for regular work. Pickup and delivery across the region. NDA and white-label service available — we can deliver unbranded or branded to your business.`,
    products: ['Booth Upholstery'],
    imagePrompt: 'A professional trimming workshop interior with sewing machines, rolls of vinyl and canvas, workbench with a half-finished boat cushion, professional photograph, realistic, warm work lighting',
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function runSeed() {
  console.log(`\nSeeding empty pillars (API: ${EMPTY_API_URL})\n`)

  console.log('Logging in...')
  authToken = await emptyLogin()
  if (!authToken) {
    console.error('Could not authenticate. Check PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in .env')
    process.exit(1)
  }
  console.log('Authenticated ✓')

  const pillars = [
    { slug: 'caravan-and-rv', label: 'Caravan & RV', assets: caravanAssets },
    { slug: 'trade-and-industrial', label: 'Trade & Industrial', assets: tradeAssets },
    { slug: 'commercial', label: 'Commercial', assets: commercialAssets },
  ]

  const imagePrompts: { pillar: string; asset: string; prompt: string }[] = []

  for (const pillar of pillars) {
    console.log(`\n=== ${pillar.label} ===`)
    const serviceTypes = await fetchServiceTypes(pillar.slug)
    console.log(`Found ${serviceTypes.length} service types`)

    for (const asset of pillar.assets) {
      // Match service type IDs by title
      const applicableProductIds = asset.products
        .map((title) => serviceTypes.find((st) => st.title === title)?.id)
        .filter((id): id is number => id !== undefined)

      if (applicableProductIds.length === 0) {
        console.warn(`  ⚠ No matching service types for "${asset.title}" — products: ${asset.products.join(', ')}`)
      }

      await createAssetType({
        title: asset.title,
        pillar: pillar.slug,
        singular: asset.singular,
        intro: asset.intro,
        seoContent: asset.seoContent,
        applicableProductIds,
      })

      imagePrompts.push({ pillar: pillar.slug, asset: asset.title, prompt: asset.imagePrompt })
    }
  }

  // Print image prompts for Flux generation
  console.log('\n\n=== FLUX IMAGE PROMPTS ===\n')
  console.log('Generate these images with Flux and upload to /api/media, then link to asset types:\n')
  for (const { pillar, asset, prompt } of imagePrompts) {
    console.log(`[${pillar}] ${asset}:`)
    console.log(`  ${prompt}\n`)
  }

  console.log('Done.')
}

runSeed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
export {}
