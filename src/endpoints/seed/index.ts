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

  payload.logger.info(`— Clearing collections and globals...`)
  for (const global of globals) {
    await payload.updateGlobal({ slug: global, data: { navItems: [] } })
  }
  for (const collection of collections) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
  await payload.delete({ collection: 'pages', where: {} })

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

  // ---- Projects & service types -----------------------------------------
  const typeIds = await seedProjects(payload, media)

  // ---- SEO matrix: regions, suburbs, businesses, asset types ------------
  const { regionIds } = await seedLocations(payload)
  await seedBusinesses(payload, regionIds)
  await seedMatrix(payload, typeIds)

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
