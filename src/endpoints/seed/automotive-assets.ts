/**
 * Seed script for automotive asset types.
 *
 * Creates asset types for the automotive pillar (which was missing from the
 * original seed), linking them to existing automotive service types:
 *   - Door Trims / Door Trim Repairs
 *   - Headlinings / Headlining Repairs
 *   - Seat Trim / Seat Trim Repairs
 *   - Tonneau Covers / Tonneau Cover Repairs
 *
 * Usage:
 *   npx tsx src/endpoints/seed/automotive-assets.ts
 *
 * Requires the dev server or production API running at WT_API_URL.
 */
const API_URL = process.env.WT_API_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function login(): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/users/login`, {
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
  const res = await fetch(`${API_URL}/api/service-types?where[pillar][equals]=${pillar}&limit=200&depth=0&sort=title`)
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

  const res = await fetch(`${API_URL}/api/asset-types`, {
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
// Automotive asset type data
// ---------------------------------------------------------------------------

type AssetTypeData = {
  title: string
  singular?: string
  intro: string
  seoContent: string
  products: string[] // service type titles to link
  imagePrompt: string
}

const automotiveAssets: AssetTypeData[] = [
  {
    title: 'Cars & Sedans',
    singular: 'Car',
    intro: 'Custom and repair trimming for cars, sedans and hatchbacks — seats, door trims, headlinings and tonneau covers.',
    seoContent: `Car trimming and upholstery for sedans, hatchbacks and passenger vehicles across Lake Macquarie, Newcastle, the Central Coast and the Hunter Valley. Our Toronto workshop handles everything from custom seat re-trims to headlining repairs, door trim replacement and tonneau covers for utes and sports cars.\n\nAutomotive trim takes a beating — sun, daily use and ageing materials. We use UV-stable automotive vinyl, premium fabrics and high-density foams that match or exceed OEM specifications. Every job is patterned on the vehicle for a precise fit, whether it's a single door trim or a full interior re-trim.\n\nCommon jobs include seat re-trimming, door card recovering, headlining replacement, tonneau cover fitting, and repair of worn or damaged trim. We work on everything from daily drivers to classic and show cars.`,
    products: ['Seat Trim', 'Door Trims', 'Headlinings', 'Tonneau Covers'],
    imagePrompt: 'A classic Australian sedan with custom reupholstered leather seats visible through the open door, workshop setting, professional photograph, realistic, warm lighting',
  },
  {
    title: 'Utes & Vans',
    singular: 'Ute',
    intro: 'Tonneau covers, seat trimming and door trims for utes, pickups and work vans.',
    seoContent: `Ute and van trimming for working vehicles across Lake Macquarie, Newcastle, the Central Coast and the Hunter Valley. Our Toronto workshop builds and repairs tonneau covers, seat trim, door trims and headlinings for utes, pickups and vans that work hard every day.\n\nTrade vehicle trim has to be tough — UV-stable vinyl, heavy-duty threads, and hardware that survives daily use on work sites. We custom-make tonneau covers to fit any tray, with reinforced corners and weatherproof seams. For seats we use high-wear vinyl and replace damaged foam to restore comfort.\n\nCommon jobs include tonneau cover repairs, seat re-trimming, door trim replacement, headlining fixes, and custom tool covers. Fast turnaround to keep your vehicle on the road.`,
    products: ['Tonneau Covers', 'Seat Trim', 'Door Trims', 'Headlinings'],
    imagePrompt: 'A tradesman ute with a custom black tonneau cover fitted to the tray, Australian work site background, professional photograph, realistic, dramatic lighting',
  },
  {
    title: 'Motorcycles',
    singular: 'Motorcycle',
    intro: 'Custom seat recovering and trim repairs for motorcycles, scooters and bikes.',
    seoContent: `Motorcycle trimming and seat recovering for bikes, scooters and motorcycles across Lake Macquarie, Newcastle, the Central Coast and the Hunter Valley. Our Toronto workshop builds custom motorcycle seats and repairs worn trim using UV-stable vinyl and marine-grade materials that withstand the Australian climate.\n\nMotorcycle seats take a beating — sun, rain and constant vibration. We use high-density foam and UV-stable vinyl that resists cracking and fading. Custom seat shaping for rider comfort, pillion seats, and dual-tone designs. We also handle scooter seat recovering and pillion pad repairs.\n\nCommon jobs include seat re-covering, foam replacement, custom seat shaping, pillion seat matching, and repair of torn or cracked vinyl. Fast turnaround to keep you on the road.`,
    products: ['Seat Trim'],
    imagePrompt: 'A custom motorcycle with a newly upholstered black vinyl seat, parked in a workshop, professional photograph, realistic, dramatic side lighting showing stitching detail',
  },
  {
    title: '4WDs & Off-Road',
    singular: '4WD',
    intro: 'Custom and repair trimming for 4WDs, off-road vehicles and adventure rigs — seats, door trims, headlinings and tonneau covers.',
    seoContent: `4WD and off-road vehicle trimming for four-wheel drives, adventure rigs and touring vehicles across Lake Macquarie, Newcastle, the Central Coast and the Hunter Valley. Our Toronto workshop builds and repairs seats, door trims, headlinings and tonneau covers for 4WDs that get used hard — on tracks, through creeks and across the outback.\n\nOff-road trim takes a beating — dust, mud, UV and constant vibration. We use marine-grade vinyl and UV-stable thread that shrugs off the elements, with high-density foam that holds its shape through years of corrugations. Custom seat builds for long-distance touring comfort, plus repair of worn door trims and sagging headlinings.\n\nCommon jobs include seat re-trimming with durable vinyl, door trim replacement, headlining repairs, tonneau and cargo covers, and custom seat foam reshaping. We work on everything from weekend trail rigs to full touring setups.`,
    products: ['Seat Trim', 'Door Trims', 'Headlinings', 'Tonneau Covers'],
    imagePrompt: 'A rugged Australian 4WD with custom black vinyl seats and door trims, parked on a dirt track with red dirt, professional photograph, realistic, golden hour lighting',
  },
  {
    title: 'Custom & Hot Rods',
    singular: 'Hot Rod',
    intro: 'Bespoke trimming for custom cars, hot rods, classics and show vehicles — full interiors, custom seats and one-off trim work.',
    seoContent: `Custom car and hot rod trimming for classics, street rods, restorations and show vehicles across Lake Macquarie, Newcastle, the Central Coast and the Hunter Valley. Our Toronto workshop builds bespoke interiors from scratch — custom seats, door trims, headlinings, boot trim and one-off pieces that make your build stand out.\n\nCustom trim is where craftsmanship matters most. We work with premium leather, vinyl, alcantara and period-correct materials to create interiors that match the character of your build — whether it's a traditional hot rod, a resto-mod, a classic restoration or a full custom. Every panel is patterned on the vehicle for a flawless fit.\n\nCommon jobs include full custom interiors, custom seat building and trimming, door panel fabrication, headlining and trim wrapping, boot and cargo trim, and steering wheel wrapping. Show-quality finishes with attention to every stitch.`,
    products: ['Seat Trim', 'Door Trims', 'Headlinings'],
    imagePrompt: 'A custom hot rod with a bespoke leather interior, stitched door panels and bucket seats, in a workshop with warm lighting, professional photograph, realistic, detailed stitching visible',
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function runSeed() {
  console.log(`\nSeeding automotive asset types (API: ${API_URL})\n`)

  console.log('Logging in...')
  authToken = await login()
  if (!authToken) {
    console.error('Could not authenticate. Check PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in .env')
    process.exit(1)
  }
  console.log('Authenticated ✓')

  const serviceTypes = await fetchServiceTypes('automotive')
  console.log(`Found ${serviceTypes.length} automotive service types`)
  if (serviceTypes.length === 0) {
    console.error('No automotive service types found — aborting')
    process.exit(1)
  }

  const imagePrompts: { asset: string; prompt: string }[] = []

  for (const asset of automotiveAssets) {
    const applicableProductIds = asset.products
      .map((title) => serviceTypes.find((st) => st.title === title)?.id)
      .filter((id): id is number => id !== undefined)

    if (applicableProductIds.length === 0) {
      console.warn(`  ⚠ No matching service types for "${asset.title}" — products: ${asset.products.join(', ')}`)
    }

    await createAssetType({
      title: asset.title,
      pillar: 'automotive',
      singular: asset.singular,
      intro: asset.intro,
      seoContent: asset.seoContent,
      applicableProductIds,
    })

    imagePrompts.push({ asset: asset.title, prompt: asset.imagePrompt })
  }

  // Print image prompts for Flux generation
  console.log('\n\n=== FLUX IMAGE PROMPTS ===\n')
  console.log('Generate these images with Flux and upload to /api/media, then link to asset types:\n')
  for (const { asset, prompt } of imagePrompts) {
    console.log(`[automotive] ${asset}:`)
    console.log(`  ${prompt}\n`)
  }

  console.log('Done.')
}

runSeed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
export {}
