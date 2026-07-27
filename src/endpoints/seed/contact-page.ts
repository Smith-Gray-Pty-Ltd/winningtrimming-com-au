import type { Page } from '@/payload-types'
import { h, p, root } from './helpers'

export const contact: Partial<Page> = {
  slug: 'contact',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: root([
      h('Request a Quote', 'h1'),
      p('Tell us about your project and we will respond within one business day.'),
    ]),
  },
  layout: [
    // Business details alongside the form
    {
      blockType: 'content',
      background: 'default',
      columns: [
        {
          size: 'half',
          richText: root([
            h('Visit the workshop', 'h3'),
            p('Shop 2, 25 Sara Street, Toronto NSW 2280'),
            p('Call 1300 799 882'),
            h('Hours', 'h3'),
            p('Monday – Friday: 8am – 4pm'),
            p('Saturday: 8am – Midday'),
            h('Serving', 'h3'),
            p('Lake Macquarie, Newcastle & the Hunter, and the Central Coast.'),
          ]),
        },
        {
          size: 'half',
          richText: root([
            h('Prefer to talk it through?', 'h3'),
            p('Use the form below and we will get back to you with advice and a quote. For the quickest response include the service area, a short description and a photo or two if you can.'),
          ]),
        },
      ],
    },
    // The enquiry form
    {
      blockType: 'formBlock',
      enableIntro: false,
      // @ts-ignore
      form: '{{CONTACT_FORM_ID}}',
    },
  ],
  meta: {
    title: 'Contact',
    description:
      'Request a quote from Winning Trimming — marine, automotive, caravan & RV, trade and commercial trimming, upholstery and covers.',
  },
  title: 'Contact',
}
