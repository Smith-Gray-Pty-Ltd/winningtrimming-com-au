// Lexical richText node helpers for seeds. Typed loosely (any) because the
// nodes are serialised to JSON at seed time.
type Node = any

export const txt = (t: string): Node => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})

export const p = (t: string): Node => ({
  type: 'paragraph',
  children: [txt(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const h = (t: string, tag: 'h1' | 'h2' | 'h3' | 'h4' = 'h3'): Node => ({
  type: 'heading',
  children: [txt(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

export const root = (children: Node[]): any => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

/**
 * The primary CTA used across the site — points to the on-site enquiry form.
 * (Replaces the old third-party Workshop Software booking link.)
 */
export const QUOTE_CTA = {
  type: 'custom' as const,
  appearance: 'default' as const,
  label: 'Request a Quote',
  url: '/contact',
}

export const quoteLink = (label = 'Request a Quote') => ({
  link: { ...QUOTE_CTA, label },
})
