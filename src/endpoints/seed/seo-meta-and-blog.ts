/**
 * Generate SEO meta for all matrix collections + create blog posts.
 *
 * Usage:
 *   npx tsx src/endpoints/seed/seo-meta-and-blog.ts
 */

const SEO_API_URL = process.env.WT_API_URL || 'http://localhost:3010'

async function seoLogin(): Promise<string> {
  const res = await fetch(`${SEO_API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@winningtrimming.com.au',
      password: 'Winning!Trimming2026',
    }),
  })
  const data = await res.json()
  return data.token
}

let token: string = ''

async function patch(collection: string, id: number, body: Record<string, unknown>) {
  const res = await fetch(`${SEO_API_URL}/api/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    console.error(`  ✗ ${collection}/${id}: ${res.status} ${err.slice(0, 100)}`)
    return false
  }
  return true
}

async function createPost(collection: string, body: Record<string, unknown>) {
  const res = await fetch(`${SEO_API_URL}/api/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    console.error(`  ✗ ${collection}: ${res.status} ${err.slice(0, 100)}`)
    return null
  }
  const data = await res.json()
  return data.doc?.id ?? null
}

async function fetchAll(collection: string, depth = 0) {
  const res = await fetch(`${SEO_API_URL}/api/${collection}?limit=200&depth=${depth}`)
  const data = await res.json()
  return data.docs || []
}

// ---------------------------------------------------------------------------
// SEO meta generators
// ---------------------------------------------------------------------------

const pillarLabel: Record<string, string> = {
  marine: 'Marine',
  automotive: 'Automotive',
  'caravan-and-rv': 'Caravan & RV',
  'trade-and-industrial': 'Trade & Industrial',
  commercial: 'Commercial',
}

function assetTypeMeta(asset: { title: string; pillar: string; intro?: string; slug: string }) {
  const label = pillarLabel[asset.pillar] || asset.pillar
  const title = `${asset.title} Trimming & Upholstery | Winning Trimming — Lake Macquarie`
  const desc = asset.intro
    ? `${asset.intro} ${label} trimming specialists in Toronto, Lake Macquarie. Custom-made and repaired to last. Serving Newcastle, Central Coast and Hunter Valley.`
    : `${label} trimming for ${asset.title.toLowerCase()} in Lake Macquarie. Custom covers, canvas and upholstery. Repairs and new work. Serving Newcastle, Central Coast and Hunter Valley.`
  return { title, description: desc.slice(0, 160) }
}

function serviceTypeMeta(service: { title: string; pillar: string; workType?: string; intro?: string; slug: string }) {
  const label = pillarLabel[service.pillar] || service.pillar
  const workType = service.workType === 'repair' ? 'Repairs' : 'Custom'
  const title = `${service.title} — ${label} ${workType} | Winning Trimming`
  const desc = service.intro
    ? `${service.intro} ${label} trimming specialists in Toronto, Lake Macquarie. Serving Newcastle, Central Coast and Hunter Valley.`
    : `${workType} ${service.title.toLowerCase()} for ${label.toLowerCase()} in Lake Macquarie. Custom-made and repaired to last. Serving Newcastle, Central Coast and Hunter Valley.`
  return { title, description: desc.slice(0, 160) }
}

function regionMeta(region: { title: string; description?: string; slug: string }, pillar?: string) {
  const label = pillar ? `${pillarLabel[pillar]} ` : ''
  const title = `${label}Trimming in ${region.title} | Winning Trimming`
  const desc = region.description
    ? `${region.description} Winning Trimming — Toronto, Lake Macquarie. Custom covers, canvas and upholstery. Serving ${region.title} and surrounding areas.`
    : `${label}trimming services in ${region.title}. Custom-made covers, canvas and upholstery. Repairs and new work. Based in Toronto, Lake Macquarie.`
  return { title, description: desc.slice(0, 160) }
}

function suburbMeta(suburb: { title: string; region?: { title?: string } | string; intro?: string; slug: string }, pillar?: string) {
  const regionTitle = typeof suburb.region === 'object' ? suburb.region?.title : ''
  const label = pillar ? `${pillarLabel[pillar]} ` : ''
  const title = `${label}Trimming in ${suburb.title}${regionTitle ? ', ' + regionTitle : ''} | Winning Trimming`
  const desc = suburb.intro
    ? `${suburb.intro} Winning Trimming — Toronto, Lake Macquarie. Custom covers, canvas and upholstery.`
    : `${label}trimming services in ${suburb.title}${regionTitle ? ', ' + regionTitle : ''}. Custom-made covers, canvas and upholstery. Repairs and new work.`
  return { title, description: desc.slice(0, 160) }
}

// ---------------------------------------------------------------------------
// Blog post content
// ---------------------------------------------------------------------------

const blogPosts = [
  {
    title: 'How to Choose the Right Bimini Top for Your Boat',
    slug: 'how-to-choose-the-right-bimini-top',
    category: 'Marine',
    excerpt: 'A bimini top is essential for comfortable boating in Australia. Here\'s what to consider when choosing one — fabric, frame, height and fit.',
    content: `A bimini top is one of the most practical additions you can make to your boat. It protects you from the harsh Australian sun, keeps spray off when you're underway, and makes long days on the water far more comfortable. But not all biminis are created equal — here's what to consider.

## Fabric

The fabric you choose determines how long your bimini lasts and how well it performs. The three main options are:

- **Sunbrella (solution-dyed acrylic)** — the gold standard. UV-stable, fade-resistant, breathable (won't trap heat), and comes with a 10-year warranty. More expensive but worth it.
- **WeatherMAX (solution-dyed polyester)** — excellent UV resistance, slightly stiffer than Sunbrella, great for structural applications. 5-7 year lifespan.
- **Marine vinyl** — waterproof and cheaper, but it gets hot in the sun and degrades faster. Fine for budget builds or temporary use.

## Frame

Stainless steel frames are standard for good reason. Look for:
- **316-grade stainless** — resists corrosion in saltwater
- **Wall thickness** — 1.2mm or thicker for durability
- **Welded joints** — stronger than pressed fittings
- **2-bow vs 3-bow vs 4-bow** — more bows = more coverage and stability, but more weight and windage

## Height

Your bimini needs to be tall enough to stand under comfortably but low enough not to interfere with bridges, boat ramps or towing. Measure your boat's beam and the height from the deck to where you want the top to sit. A good trimmer will custom-make the frame to your exact height.

## Fit

A custom-fitted bimini is always better than an off-the-shelf one. It follows your boat's lines, covers exactly what you need, and doesn't flap or billow in the wind. At Winning Trimming, we measure on-site for larger boats and build in the workshop for smaller ones.

## Conclusion

The right bimini top makes every trip more comfortable and protects your boat's interior from UV damage. If you're in the Lake Macquarie, Newcastle or Central Coast area, give us a call — we'll help you choose the right fabric, frame and configuration for your boat.`,
  },
  {
    title: 'When to Repair vs Replace Marine Canvas',
    slug: 'when-to-repair-vs-replace-marine-canvas',
    category: 'Marine',
    excerpt: 'A torn clear or a faded bimini — should you repair or replace? Here\'s how to tell when a repair will save you money and when replacement is the better call.',
    content: `Marine canvas takes a beating — UV, salt, wind, and constant movement. Eventually every bimini, dodger or set of clears needs attention. But should you repair or replace? Here's how to decide.

## When to Repair

Repair is the right call when:
- **The fabric is sound** — no widespread UV degradation, just a localised tear or seam failure
- **Zips are failing but the canvas is fine** — replacing zips costs a fraction of new canvas
- **A small tear from impact** — caught on a cleat or poked by a fishing rod
- **Stitching has failed** — re-stitching is quick and affordable
- **One panel is damaged** — we can replace just that panel rather than the whole enclosure

Repairs typically cost 20-30% of a full replacement, so they're worth trying first if the fabric still has life in it.

## When to Replace

Replacement is the better call when:
- **The fabric is brittle or faded** — UV degradation makes the fabric crack and tear easily. If it tears by hand, it's done.
- **Multiple seams are failing** — if more than 2-3 seams need re-stitching, the fabric is probably past it
- **The canvas has shrunk** — older canvas can shrink, making it impossible to refit properly
- **You're upgrading** — moving from vinyl to Strataglass, or from a standard bimini to a full enclosure
- **The frame is corroded** — rust on the frame will stain new canvas and eventually fail

## The Middle Ground

Sometimes the answer is "repair now, plan to replace later." If your clears have one torn zip but the rest are okay, fix the zip now and start budgeting for a full replacement next season. This keeps you on the water without a big upfront cost.

## Cost Comparison

As a rough guide:
- Zip replacement: $50-150 per zip
- Seam re-stitching: $100-300 depending on length
- Small patch: $80-200
- Single panel replacement: $200-500
- Full bimini replacement: $800-2,500
- Full enclosure replacement: $1,500-5,000

Every job is different — give us a call and we'll assess whether a repair will hold or if replacement is the smarter investment.

## Conclusion

When in doubt, bring it in. We'll give you an honest assessment — if a repair will last, we'll say so. If replacement is the better call, we'll tell you that too. No point charging you for a repair that'll fail in six months.`,
  },
  {
    title: 'Caravan Cushion Upgrade: What You Need to Know',
    slug: 'caravan-cushion-upgrade-guide',
    category: 'Caravan & RV',
    excerpt: 'Uncomfortable caravan cushions can ruin a trip. Here\'s what to consider when upgrading — foam density, fabric choice, and how to get custom cushions that actually fit.',
    content: `If you've ever woken up with a sore back in your caravan, your cushions are probably the culprit. Standard caravan cushions are often made with low-density foam that flattens after a season or two. Here's how to upgrade them properly.

## Foam Density

The foam is the most important part. Look for:
- **High-density foam (30-35 kg/m³)** — holds its shape, supports your back, lasts 5-8 years
- **Medium-density (25-30 kg/m³)** — softer, fine for occasional use, 3-5 year lifespan
- **Memory foam top layer** — adds comfort without sacrificing support. We often layer 25mm of memory foam on top of high-density base foam.

For seat cushions that convert to beds, you want firmness that's comfortable to sit on but not too hard to sleep on. We typically recommend a 35kg/m³ base with a 25mm memory foam topper.

## Fabric

Caravan cushion fabrics need to handle:
- **UV exposure** — if near windows, choose UV-stable fabrics
- **Spills** — consider stain-resistant or wipeable vinyl for eating areas
- **Wear** — high-density woven fabrics last longer than knits
- **Washability** — removable covers with zips make cleaning easy

Popular choices include Sunbrella for outdoor feel, marine vinyl for easy cleaning, and commercial upholstery fabric for durability.

## Custom Shapes

Caravans have irregular berth shapes — rounded corners, cut-outs for wheel arches, tapered ends. Off-the-shelf cushions never fit properly. Custom-made cushions follow the exact shape of your berths, maximising sleeping area and eliminating gaps.

We measure your berths on-site (if you're in the Lake Macquarie, Newcastle or Hunter Valley area) and build the cushions in our Toronto workshop.

## Cost

Custom caravan cushions typically cost:
- **Single berth cushion** — $150-350 depending on size and foam
- **Double bed (2 cushions)** — $400-700
- **Full van refit (4-6 cushions)** — $800-2,000
- **Dinette seat cushions** — $200-400 per seat

All our cushions come with removable, washable covers and a 2-year warranty on the foam.

## Conclusion

Good cushions make the difference between loving your caravan and dreading the sleep. If yours have gone flat, give us a call — we'll measure up, recommend the right foam and fabric, and build cushions that fit perfectly.`,
  },
  {
    title: '5 Signs Your Boat Seats Need Re-Upholstering',
    slug: '5-signs-your-boat-seats-need-reupholstering',
    category: 'Tips & Guides',
    excerpt: 'Boat seats cop a lot of abuse. Here are the 5 clear signs it\'s time to re-upholster — before the foam gets damaged and the cost doubles.',
    content: `Boat seats take more punishment than almost any other upholstery. Salt, sun, spray, sunscreen, and people climbing all over them — it's no wonder they eventually need attention. Here are the 5 signs it's time to re-upholster.

## 1. The Vinyl is Cracking or Peeling

This is the most obvious sign. Marine vinyl has a protective top layer that degrades with UV exposure. Once it starts cracking, water gets into the foam underneath and the damage accelerates. Small cracks can be patched, but once it's widespread, re-covering is the only real fix.

## 2. The Foam Has Gone Flat

If you sink into the seat and can feel the frame or base through the foam, it's time. Flat foam isn't just uncomfortable — it means the seat isn't supporting you properly, which leads to fatigue on long days on the water. We replace the foam at the same time as re-covering, so you get the full comfort back.

## 3. Stitching is Coming Undone

UV doesn't just damage the vinyl — it breaks down the thread too. If you see loose threads or seams opening up, the rest of the stitching isn't far behind. Re-stitching is an option if the vinyl is still good, but if the thread has failed due to UV, the vinyl is probably close to failing too.

## 4. Mould or Mildew Stains

Black or green stains that won't wash off usually mean mould has penetrated the vinyl. This is common on boats that are stored outdoors or in humid environments. Mould-infested vinyl is impossible to fully clean and will keep coming back — replacement is the solution.

## 5. The Colour Has Faded Significantly

If your once-vibrant blue seats are now a washed-out grey-blue, the UV has broken down the pigment in the vinyl. Faded vinyl is also more brittle, so cracks are coming soon. If you're re-covering anyway, this is the time to consider a colour change or upgrade to a higher-grade vinyl.

## What Does It Cost?

Boat seat re-upholstering typically costs:
- **Single bolster seat** — $150-350
- **Captain's chair** — $250-500
- **Full bench seat** — $400-800
- **Complete boat (4-8 seats)** — $1,000-3,000

All our re-upholstering includes new high-density foam, marine-grade vinyl (or fabric of your choice), and UV-stable thread.

## Conclusion

The key is catching it early. If you wait until the foam is damaged, you're looking at replacing foam AND vinyl — which costs more. If you re-cover when the vinyl first starts to fail, you save the foam and halve the cost. Give us a call if any of these signs sound familiar.`,
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function lexicalRichText(html: string): any {
  // Convert plain text with ## headings, paragraphs, and **bold** into Lexical JSON
  // Bold format flag: 1 = bold in Lexical

  function parseTextNodes(text: string): any[] {
    // Split on **bold** markers and create formatted text nodes
    const nodes: any[] = []
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    for (const part of parts) {
      if (!part) continue
      if (part.startsWith('**') && part.endsWith('**')) {
        nodes.push({ type: 'text', format: 1, text: part.slice(2, -2), version: 1 })
      } else {
        nodes.push({ type: 'text', format: 0, text: part, version: 1 })
      }
    }
    return nodes
  }

  const lines = html.split('\n')
  const children: any[] = []
  let inList = false
  let listItems: any[] = []

  const flushList = () => {
    if (inList && listItems.length > 0) {
      children.push({
        tag: 'ul', type: 'list', format: '', indent: 0, version: 1,
        listType: 'bullet', children: listItems,
      })
      listItems = []
      inList = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      children.push({
        tag: 'h2', type: 'heading', format: '', indent: 0, version: 3,
        children: parseTextNodes(trimmed.slice(3)),
      })
    } else if (trimmed.startsWith('- ')) {
      inList = true
      listItems.push({
        tag: 'li', type: 'listitem', format: '', indent: 0, version: 1,
        children: parseTextNodes(trimmed.slice(2)),
      })
    } else {
      flushList()
      children.push({
        tag: 'p', type: 'paragraph', format: '', indent: 0, version: 1,
        children: parseTextNodes(trimmed),
      })
    }
  }
  flushList()

  return { root: { type: 'root', format: '', indent: 0, version: 1, children } }
}

async function run() {
  console.log('Logging in...')
  token = await seoLogin()
  if (!token) { console.error('Login failed'); process.exit(1) }
  console.log('Authenticated ✓\n')

  // --- Asset Types ---
  console.log('=== Asset Types ===')
  const assets = await fetchAll('asset-types', 0)
  let count = 0
  for (const a of assets) {
    const meta = assetTypeMeta(a as any)
    if (await patch('asset-types', a.id, { meta })) count++
  }
  console.log(`  ✓ Updated ${count}/${assets.length} asset types\n`)

  // --- Service Types ---
  console.log('=== Service Types ===')
  const services = await fetchAll('service-types', 0)
  count = 0
  for (const s of services) {
    const meta = serviceTypeMeta(s as any)
    if (await patch('service-types', s.id, { meta })) count++
  }
  console.log(`  ✓ Updated ${count}/${services.length} service types\n`)

  // --- Regions ---
  console.log('=== Regions ===')
  const regions = await fetchAll('regions', 0)
  count = 0
  for (const r of regions) {
    const meta = regionMeta(r as any)
    if (await patch('regions', r.id, { meta })) count++
  }
  console.log(`  ✓ Updated ${count}/${regions.length} regions\n`)

  // --- Suburbs ---
  console.log('=== Suburbs ===')
  const suburbs = await fetchAll('suburbs', 1) // depth 1 for region relationship
  count = 0
  for (const s of suburbs) {
    const meta = suburbMeta(s as any)
    if (await patch('suburbs', s.id, { meta })) count++
  }
  console.log(`  ✓ Updated ${count}/${suburbs.length} suburbs\n`)

  // --- Blog Posts ---
  console.log('=== Blog Posts ===')

  // Fetch category IDs
  const categories = await fetchAll('categories', 0)
  const catMap: Record<string, number> = {}
  for (const c of categories) {
    catMap[c.title] = c.id
  }

  // Fetch admin user for author
  const users = await fetchAll('users', 0)
  const authorId = users[0]?.id

  // Delete existing posts first
  const existingPosts = await fetchAll('posts', 0)
  for (const p of existingPosts) {
    await fetch(`${SEO_API_URL}/api/posts/${p.id}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    })
  }
  console.log(`  Deleted ${existingPosts.length} existing posts`)

  for (const post of blogPosts) {
    const catId = catMap[post.category]
    if (!catId) {
      console.error(`  ⚠ Category "${post.category}" not found, skipping`)
      continue
    }

    const body = {
      title: post.title,
      slug: post.slug,
      _status: 'published',
      categories: [catId],
      authors: authorId ? [authorId] : [],
      content: { root: lexicalRichText(post.content).root },
      meta: {
        title: `${post.title} | Winning Trimming`,
        description: post.excerpt,
      },
    }

    const id = await createPost('posts', body)
    if (id) {
      console.log(`  ✓ Created: ${post.title} (id: ${id})`)
    }
  }

  console.log('\nDone.')
}

run().catch((err) => { console.error('Failed:', err); process.exit(1) })