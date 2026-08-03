import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'
import fs from 'fs'
import path from 'path'

import { contactForm as enquiryFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { pillarPages, ourWorkPage, aboutPage } from './pages'
import { seedProjects } from './projects'
import { seedLocations } from './locations'
import { seedBusinesses } from './businesses'
import { seedMatrix } from './matrix'
import { image2 } from './image-2'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'projects',
  'service-types',
  'asset-types',
  'businesses',
  'regions',
  'suburbs',
  'forms',
  'form-submissions',
  'search',
]
const globals: GlobalSlug[] = ['header', 'footer']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info(`— Clearing collections (raw TRUNCATE)...`)
  // Use raw SQL TRUNCATE instead of payload.delete() to avoid the
  // transaction-abort cascade caused by deleteUserPreferences hooks.
  // Fast, reliable, and skips all afterDelete hook overhead.
  const pool = (payload.db as any).pool
  const tableRes = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'
     AND tablename NOT IN ('payload_migrations', 'users')`,
  )
  const tableNames = tableRes.rows.map((r: any) => `"${r.tablename}"`).join(', ')
  if (tableNames) {
    await pool.query(`TRUNCATE TABLE ${tableNames} CASCADE`)
  }

  // ---- Media -------------------------------------------------------------
  payload.logger.info(`— Seeding media...`)
  const heroBuffer = readLocalFile('public/winning-trimming-hero.webp', 'image/webp')
  const heroDoc = await payload.create({ collection: 'media', data: image2, file: heroBuffer })

  payload.logger.info(`— Seeding category photos...`)
  const categoryImages = [
    ['boats', 'public/wt-cat-boats.webp'],
    ['rvs', 'public/wt-cat-rvs.webp'],
    ['utes', 'public/wt-cat-utes.webp'],
    ['marine', 'public/wt-cat-marine.webp'],
    ['recreational', 'public/wt-cat-recreational.webp'],
    ['trade', 'public/wt-cat-trade.webp'],
  ] as const
  const media: Record<string, (typeof heroDoc)['id']> = { hero: heroDoc.id }
  for (const [key, file] of categoryImages) {
    const doc = await payload.create({
      collection: 'media',
      data: image2,
      file: readLocalFile(file, 'image/webp'),
    })
    media[key] = doc.id
  }

  // Vessel hero images (generated via FLUX)
  const vesselHeroImages: [string, string][] = [
    ['yachts-hero', 'public/yachts-hero.webp'],
    ['catamarans-hero', 'public/catamaran-hero.webp'],
    ['inflatable-boats-ribs-hero', 'public/inflatable-boats-ribs-hero.webp'],
    ['jet-skis-hero', 'public/jet-skis-hero.webp'],
    ['outboard-motors-hero', 'public/outboard-motors-hero.webp'],
    ['pontoons-hero', 'public/pontoons-hero.webp'],
    ['power-boats-hero', 'public/power-boats-hero.webp'],
    ['row-boats-hero', 'public/row-boats-hero.webp'],
    ['sail-boats-hero', 'public/sail-boats-hero.webp'],
    ['fishing-boats-hero', 'public/fishing-boats-hero.webp'],
    ['tenders-hero', 'public/tenders-hero.webp'],
    ['tinnies-hero', 'public/tinnies-hero.webp'],
    ['super-yachts-hero', 'public/super-yachts-hero.webp'],
    ['houseboats-hero', 'public/houseboats-hero.webp'],
  ]
  for (const [key, file] of vesselHeroImages) {
    const doc = await payload.create({
      collection: 'media',
      data: image2,
      file: readLocalFile(file, 'image/webp'),
    })
    media[key] = doc.id
  }

  // Service-type hero images (generated via FLUX)
  // Keys are {serviceTypeSlug}-hero to match the slugs created by seedProjects.
  const serviceHeroImages: [string, string][] = [
    ['weather-covers-hero', 'public/service-weather-covers-hero.webp'],
    ['towing-covers-hero', 'public/service-towing-covers-hero.webp'],
    ['bimini-tops-hero', 'public/service-bimini-tops-hero.webp'],
    ['dodgers-hero', 'public/service-dodgers-hero.webp'],
    ['flybridge-enclosures-hero', 'public/service-flybridge-enclosures-hero.webp'],
    ['cockpit-enclosures-hero', 'public/service-cockpit-enclosures-hero.webp'],
    ['sail-covers-hero', 'public/service-sail-covers-hero.webp'],
    ['sun-beds-hero', 'public/service-sun-beds-hero.webp'],
    ['seats-hero', 'public/service-seats-hero.webp'],
    ['cushions-hero', 'public/service-cushions-hero.webp'],
    ['mattresses-hero', 'public/service-mattresses-hero.webp'],
    ['interior-panels-hero', 'public/service-interior-panels-hero.webp'],
    ['carpet-hero', 'public/service-carpet-hero.webp'],
    ['hull-lining-hero', 'public/service-hull-lining-hero.webp'],
    ['tonneau-covers-hero', 'public/service-tonneau-covers-hero.webp'],
    ['seat-trim-hero', 'public/service-seat-trim-hero.webp'],
    ['headlinings-hero', 'public/service-headlinings-hero.webp'],
    ['door-trims-hero', 'public/service-door-trims-hero.webp'],
    ['annexes-hero', 'public/service-annexes-hero.webp'],
    ['cushions-mattresses-hero', 'public/service-cushions-mattresses-hero.webp'],
    ['interior-trim-hero', 'public/service-interior-trim-hero.webp'],
    ['machinery-covers-hero', 'public/service-machinery-covers-hero.webp'],
    ['operator-seats-hero', 'public/service-operator-seats-hero.webp'],
    ['booth-upholstery-hero', 'public/service-booth-upholstery-hero.webp'],
    ['office-chairs-hero', 'public/service-office-chairs-hero.webp'],
    // Repair variants
    ['weather-cover-repairs-hero', 'public/service-weather-cover-repairs-hero.webp'],
    ['towing-cover-repairs-hero', 'public/service-towing-cover-repairs-hero.webp'],
    ['bimini-top-repairs-hero', 'public/service-bimini-top-repairs-hero.webp'],
    ['dodger-repairs-hero', 'public/service-dodger-repairs-hero.webp'],
    ['flybridge-enclosure-repairs-hero', 'public/service-flybridge-enclosure-repairs-hero.webp'],
    ['cockpit-enclosure-repairs-hero', 'public/service-cockpit-enclosure-repairs-hero.webp'],
    ['sail-cover-repairs-hero', 'public/service-sail-cover-repairs-hero.webp'],
    ['sun-bed-repairs-hero', 'public/service-sun-bed-repairs-hero.webp'],
    ['seat-repairs-hero', 'public/service-seat-repairs-hero.webp'],
    ['cushion-repairs-hero', 'public/service-cushion-repairs-hero.webp'],
    ['mattresse-repairs-hero', 'public/service-mattresse-repairs-hero.webp'],
    ['interior-panel-repairs-hero', 'public/service-interior-panel-repairs-hero.webp'],
    ['carpet-repairs-hero', 'public/service-carpet-repairs-hero.webp'],
    ['hull-lining-repairs-hero', 'public/service-hull-lining-repairs-hero.webp'],
    ['tonneau-cover-repairs-hero', 'public/service-tonneau-cover-repairs-hero.webp'],
    ['seat-trim-repairs-hero', 'public/service-seat-trim-repairs-hero.webp'],
    ['headlining-repairs-hero', 'public/service-headlining-repairs-hero.webp'],
    ['door-trim-repairs-hero', 'public/service-door-trim-repairs-hero.webp'],
    ['annexe-repairs-hero', 'public/service-annexe-repairs-hero.webp'],
    ['cushions-mattresse-repairs-hero', 'public/service-cushions-mattresse-repairs-hero.webp'],
    ['interior-trim-repairs-hero', 'public/service-interior-trim-repairs-hero.webp'],
    ['machinery-cover-repairs-hero', 'public/service-machinery-cover-repairs-hero.webp'],
    ['operator-seat-repairs-hero', 'public/service-operator-seat-repairs-hero.webp'],
    ['booth-upholstery-repairs-hero', 'public/service-booth-upholstery-repairs-hero.webp'],
    ['office-chair-repairs-hero', 'public/service-office-chair-repairs-hero.webp'],
  ]
  for (const [key, file] of serviceHeroImages) {
    const doc = await payload.create({
      collection: 'media',
      data: image2,
      file: readLocalFile(file, 'image/webp'),
    })
    media[key] = doc.id
  }

  // ---- Projects & service types -----------------------------------------
  const typeIds = await seedProjects(payload, media)

  // ---- SEO matrix: regions, suburbs, businesses, asset types ------------
  const { regionIds } = await seedLocations(payload)
  await seedBusinesses(payload, regionIds)
  await seedMatrix(payload, typeIds, media)

  // Helper to resolve {{PLACEHOLDER}} IDs in page JSON (handles text/numeric IDs)
  const quote = (id: unknown) =>
    payload.db.defaultIDType === 'text' ? `"${id}"` : String(id)
  const buildPage = (pageObj: unknown, extra: Record<string, string | number> = {}) => {
    const map: Record<string, string | number> = {
      '{{IMAGE_1}}': media.hero,
      '{{IMG_OUR_WORK}}': media.marine,
      '{{HERO_MARINE}}': media.boats,
      '{{HERO_AUTOMOTIVE}}': media.utes,
      '{{HERO_CARAVAN}}': media.rvs,
      '{{HERO_TRADE}}': media.trade,
      '{{HERO_COMMERCIAL}}': media.trade,
      '{{HERO_OUR_WORK}}': media.marine,
      ...extra,
    }
    let json = JSON.stringify(pageObj)
    for (const [key, id] of Object.entries(map)) {
      json = json.split(`"${key}"`).join(quote(id))
    }
    return JSON.parse(json)
  }

  // ---- Enquiry form (created early; contact page needs its ID) ----------
  payload.logger.info(`— Seeding enquiry form...`)
  const enquiryForm = await payload.create({ collection: 'forms', data: JSON.parse(JSON.stringify(enquiryFormData)) })
  const formId = payload.db.defaultIDType === 'text' ? `"${enquiryForm.id}"` : String(enquiryForm.id)

  // ---- Pages -------------------------------------------------------------
  payload.logger.info(`— Seeding pages...`)
  const created: Record<string, number | string> = {}

  // Service pillars first
  for (const pillar of pillarPages) {
    created[pillar.slug as string] = (await payload.create({ collection: 'pages', data: buildPage(pillar) })).id
  }
  // Our Work + About (home references Our Work)
  created['our-work'] = (await payload.create({ collection: 'pages', data: buildPage(ourWorkPage) })).id
  created.about = (await payload.create({ collection: 'pages', data: buildPage(aboutPage) })).id
  // Contact (uses the enquiry form)
  const contactPageDataJson = JSON.stringify(contactPageData).split('"{{CONTACT_FORM_ID}}"').join(formId)
  created.contact = (await payload.create({ collection: 'pages', data: JSON.parse(contactPageDataJson) })).id
  // Home last — its "See our work" link references the our-work page
  created.home = (await payload.create({ collection: 'pages', data: buildPage(home, { '{{PAGE_OUR_WORK}}': created['our-work'] }) })).id

  // ---- Header navigation -----------------------------------------------
  // The CMS-managed nav holds the five service pillars only. Home is the
  // logo; Our Work / About / Contact live in the utility strip (rendered in
  // the header component) and the mobile drawer.
  payload.logger.info(`— Seeding header...`)
  const ref = (slug: string) => ({
    type: 'reference' as const,
    label: '',
    reference: { relationTo: 'pages' as const, value: created[slug] as number },
  })
  const navLabels: Record<string, string> = {
    marine: 'Marine',
    automotive: 'Automotive',
    'caravan-and-rv': 'Caravan & RV',
    'trade-and-industrial': 'Trade & Industrial',
    commercial: 'Commercial',
  }
  const navOrder = ['marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial']

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: navOrder.map((slug) => ({ link: { ...ref(slug), label: navLabels[slug] } })),
    },
  })

  // ---- Footer navigation ------------------------------------------------
  payload.logger.info(`— Seeding footer...`)
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        { link: { ...ref('our-work'), label: 'Our Work' } },
        { link: { ...ref('about'), label: 'About' } },
        { link: { ...ref('contact'), label: 'Contact' } },
        { link: { type: 'custom', label: 'Request a Quote', url: '/contact' } },
        { link: { type: 'custom', label: 'Call 1300 799 882', url: 'tel:1300799882' } },
      ],
    },
  })

  payload.logger.info('Seeded database successfully!')
}

// Read an image from the local repo (./public/...) into the Payload File shape.
function readLocalFile(filePath: string, mimetype: string): File {
  const abs = path.resolve(process.cwd(), filePath)
  const data = fs.readFileSync(abs)
  return { name: path.basename(abs), data: Buffer.from(data), mimetype, size: data.byteLength }
}
