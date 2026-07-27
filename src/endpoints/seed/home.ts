import type { RequiredDataFromCollectionSlug } from 'payload'

// --- Lexical helpers: build richText nodes concisely for the seed -------------
// Typed loosely (any) because these are serialised to JSON at seed time; the
// exact Lexical node shapes are validated at runtime, not at compile time.
type Node = any
const txt = (t: string): Node => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})
const p = (t: string): Node => ({
  type: 'paragraph',
  children: [txt(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})
const h = (t: string, tag: 'h1' | 'h2' | 'h3' | 'h4' = 'h3'): Node => ({
  type: 'heading',
  children: [txt(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})
const root = (children: Node[]): any => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const BOOKING_URL = 'https://my.workshopsoftware.com.au/bookings.html#/Smith?token=ngrqms'

export const home: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'highImpact',
    links: [
      {
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'Book a Call/Inspection',
          url: BOOKING_URL,
        },
      },
    ],
    // @ts-ignore
    media: '{{IMAGE_1}}',
    richText: root([
      h('Discover the Winning difference', 'h1'),
      p('Where quality meets craftsmanship and customer service shines.'),
    ]),
  },
  layout: [
    // ---- Band 1: teal — "Marine, Recreational and Trade" ------------------
    {
      blockName: 'Service categories',
      blockType: 'content',
      background: 'teal',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Marine, Recreational and Trade', 'h2'),
            p('At Winning Trimming, we specialise in providing top-quality trimming, upholstery, and cover solutions for marine, recreational and trade.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Boats and watercraft'),
            p('Yachts'),
            p('Catamarans'),
            p('Inflatable Boats (RIBS)'),
            p('Jet Skis'),
            p('Outboard Motors'),
            p('Pontoons'),
            p('Power Boats'),
            p('Row Boats'),
            p('Sail Boats'),
            p('Fishing Boats'),
            p('Tenders'),
            p('Tinnies'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('RVs, Caravans & Offroad'),
            p('Caravans'),
            p('RVs'),
            p('Motorhomes'),
            p('Campervans'),
            p('Camping Trailers'),
            p('Offroad'),
            p('4x4'),
            p('5th Wheelers'),
            p('Trailers'),
            p('Motorcycles'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Utes, Plant & Machinery'),
            p('Utility Beds'),
            p('Trays'),
            p('Tools'),
            p('Hiabs/Cranes'),
            p('Trailers'),
            p('Mini/Small Equipment'),
            p('Tractors'),
            p('Mowers'),
            p('Equipment'),
          ]),
        },
        {
          size: 'full',
          enableLink: true,
          richText: root([]),
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Book a Call/Inspection',
            url: BOOKING_URL,
          },
        },
      ],
    },
    // ---- Band 2: white — "Bespoke Trimming, Upholstery & Covers" ----------
    {
      blockName: 'Bespoke services',
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'full',
          richText: root([
            h('Bespoke Trimming, Upholstery & Covers', 'h2'),
            p('Custom-crafted covers, upholstery and trim, built to last in the harsh Australian conditions.'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Marine'),
            p('Weather Covers'),
            p('Towing Covers'),
            p('Bimini Tops'),
            p('Dodgers'),
            p('Flybridge Enclosures'),
            p('Cockpit Enclosures'),
            p('Sail Covers'),
            p('Sun beds'),
            p('Seats'),
            p('Cushions'),
            p('Mattresses'),
            p('Interior Panels'),
            p('Carpet'),
            p('Hull Lining'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Recreational'),
            p('Storage Covers'),
            p('Caravan Bras'),
            p('Canopies'),
            p('Awnings'),
            p('Pop-Tops'),
            p('Seats'),
            p('Saddles'),
            p('Cushions'),
            p('Mattresses'),
            p('Interior Panels'),
            p('Carpet'),
            p('Wall Lining'),
          ]),
        },
        {
          size: 'oneThird',
          richText: root([
            h('Trade'),
            p('Tonneau Covers'),
            p('Canopies'),
            p('Custom Trays'),
            p('Tool Covers'),
            p('Machinery Covers'),
            p('Equipment Covers'),
            p('Soft Cabs'),
            p('Trailer Covers'),
            p('Tractor Covers'),
            p('Mower Covers'),
          ]),
        },
        {
          size: 'full',
          enableLink: true,
          richText: root([]),
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Book a Call/Inspection',
            url: BOOKING_URL,
          },
        },
      ],
    },
    // ---- CTA --------------------------------------------------------------
    {
      blockName: 'Call to action',
      blockType: 'cta',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Book a Call/Inspection',
            url: BOOKING_URL,
          },
        },
      ],
      richText: root([
        h('Experience the winning difference.', 'h3'),
        p('We recommend using our online booking form to book in a call, on-site or off-site inspection.'),
      ]),
    },
  ],
  meta: {
    description:
      'Marine, recreational and trade trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.',
    // @ts-ignore
    image: '{{IMAGE_1}}',
    title: 'Home',
  },
  title: 'Home',
}
