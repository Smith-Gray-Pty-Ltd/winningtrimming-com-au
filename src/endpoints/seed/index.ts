import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'
import fs from 'fs'
import path from 'path'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
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

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not

  payload.logger.info(`— Clearing media...`)
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  for (const global of globals) {
    await payload.updateGlobal({
      slug: global,
      data: {
        navItems: [],
      },
    })
  }

  for (const collection of collections) {
    await payload.delete({
      collection: collection,
      where: {
        id: {
          exists: true,
        },
      },
    })
  }

  const pages = await payload.delete({
    collection: 'pages',
    where: {},
  })

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: 'demo-author@payloadcms.com',
      },
    },
  })

  const demoAuthor = await payload.create({
    collection: 'users',
    data: {
      name: 'Demo Author',
      email: 'demo-author@payloadcms.com',
      password: 'password',
    },
  })

  let demoAuthorID: number | string = demoAuthor.id

  payload.logger.info(`— Seeding media...`)
  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    // Winning Trimming hero photo (boat) — served from the local /public dir.
    readLocalFile('public/winning-trimming-hero.webp', 'image/webp'),
  ])

  const image1Doc = await payload.create({
    collection: 'media',
    data: image1,
    file: image1Buffer,
  })
  const image2Doc = await payload.create({
    collection: 'media',
    data: image2,
    file: image2Buffer,
  })
  const image3Doc = await payload.create({
    collection: 'media',
    data: image2,
    file: image3Buffer,
  })
  const imageHomeDoc = await payload.create({
    collection: 'media',
    data: image2,
    file: hero1Buffer,
  })

  // Winning Trimming category photos (one per home-page column).
  payload.logger.info(`— Seeding category photos...`)
  const categoryImages = [
    ['boats', 'public/wt-cat-boats.webp'],
    ['rvs', 'public/wt-cat-rvs.webp'],
    ['utes', 'public/wt-cat-utes.webp'],
    ['marine', 'public/wt-cat-marine.webp'],
    ['recreational', 'public/wt-cat-recreational.webp'],
    ['trade', 'public/wt-cat-trade.webp'],
  ] as const
  const categoryDocs: Record<string, (typeof image1Doc)['id']> = {}
  for (const [key, file] of categoryImages) {
    const doc = await payload.create({
      collection: 'media',
      data: image2,
      file: readLocalFile(file, 'image/webp'),
    })
    categoryDocs[key] = doc.id
  }

  payload.logger.info(`— Seeding categories...`)
  const technologyCategory = await payload.create({
    collection: 'categories',
    data: {
      title: 'Technology',
    },
  })

  const newsCategory = await payload.create({
    collection: 'categories',
    data: {
      title: 'News',
    },
  })

  const financeCategory = await payload.create({
    collection: 'categories',
    data: {
      title: 'Finance',
    },
  })

  await payload.create({
    collection: 'categories',
    data: {
      title: 'Design',
    },
  })

  await payload.create({
    collection: 'categories',
    data: {
      title: 'Software',
    },
  })

  await payload.create({
    collection: 'categories',
    data: {
      title: 'Engineering',
    },
  })

  let image1ID: number | string = image1Doc.id
  let image2ID: number | string = image2Doc.id
  let image3ID: number | string = image3Doc.id
  let imageHomeID: number | string = imageHomeDoc.id

  if (payload.db.defaultIDType === 'text') {
    image1ID = `"${image1Doc.id}"`
    image2ID = `"${image2Doc.id}"`
    image3ID = `"${image3Doc.id}"`
    imageHomeID = `"${imageHomeDoc.id}"`
    demoAuthorID = `"${demoAuthorID}"`
  }

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    data: JSON.parse(
      JSON.stringify({ ...post1, categories: [technologyCategory.id] })
        .replace(/"\{\{IMAGE_1\}\}"/g, String(image1ID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image2ID))
        .replace(/"\{\{AUTHOR\}\}"/g, String(demoAuthorID)),
    ),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    data: JSON.parse(
      JSON.stringify({ ...post2, categories: [newsCategory.id] })
        .replace(/"\{\{IMAGE_1\}\}"/g, String(image2ID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image3ID))
        .replace(/"\{\{AUTHOR\}\}"/g, String(demoAuthorID)),
    ),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    data: JSON.parse(
      JSON.stringify({ ...post3, categories: [financeCategory.id] })
        .replace(/"\{\{IMAGE_1\}\}"/g, String(image3ID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image1ID))
        .replace(/"\{\{AUTHOR\}\}"/g, String(demoAuthorID)),
    ),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  payload.logger.info(`— Seeding home page...`)

  const quote = (id: unknown) =>
    payload.db.defaultIDType === 'text' ? `"${id}"` : String(id)

  await payload.create({
    collection: 'pages',
    data: JSON.parse(
      JSON.stringify(home)
        .replace(/"\{\{IMAGE_1\}\}"/g, String(imageHomeID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image2ID))
        .replace(/"\{\{IMG_BOATS\}\}"/g, quote(categoryDocs.boats))
        .replace(/"\{\{IMG_RVS\}\}"/g, quote(categoryDocs.rvs))
        .replace(/"\{\{IMG_UTES\}\}"/g, quote(categoryDocs.utes))
        .replace(/"\{\{IMG_MARINE\}\}"/g, quote(categoryDocs.marine))
        .replace(/"\{\{IMG_RECREATIONAL\}\}"/g, quote(categoryDocs.recreational))
        .replace(/"\{\{IMG_TRADE\}\}"/g, quote(categoryDocs.trade)),
    ),
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    data: JSON.parse(JSON.stringify(contactFormData)),
  })

  let contactFormID: number | string = contactForm.id

  if (payload.db.defaultIDType === 'text') {
    contactFormID = `"${contactFormID}"`
  }

  payload.logger.info(`— Seeding contact page...`)

  const contactPage = await payload.create({
    collection: 'pages',
    data: JSON.parse(
      JSON.stringify(contactPageData).replace(/"\{\{CONTACT_FORM_ID\}\}"/g, String(contactFormID)),
    ),
  })

  payload.logger.info(`— Seeding header...`)

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            label: 'Book a Call/Inspection',
            newTab: true,
            url: 'https://my.workshopsoftware.com.au/bookings.html#/Smith?token=ngrqms',
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Contact',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
          },
        },
      ],
    },
  })

  payload.logger.info(`— Seeding footer...`)

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            label: 'Book a Call/Inspection',
            newTab: true,
            url: 'https://my.workshopsoftware.com.au/bookings.html#/Smith?token=ngrqms',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Contact',
            url: '/contact',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Call 1300 799 882',
            url: 'tel:1300799882',
          },
        },
      ],
    },
  })

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}

// Read an image from the local repo (e.g. ./public/...) into the Payload File
// shape. Used for brand assets like the hero photo that ship with the project.
function readLocalFile(filePath: string, mimetype: string): File {
  const abs = path.resolve(process.cwd(), filePath)
  const data = fs.readFileSync(abs)

  return {
    name: path.basename(abs),
    data: Buffer.from(data),
    mimetype,
    size: data.byteLength,
  }
}
