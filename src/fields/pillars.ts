import type { SelectField } from 'payload'

/**
 * The five service pillars that organise the whole site (nav, pages, projects).
 * Shared by the Projects + ServiceTypes collections so the values stay in sync.
 */
export const pillarOptions = [
  { label: 'Marine', value: 'marine' },
  { label: 'Automotive', value: 'automotive' },
  { label: 'Caravan & RV', value: 'caravan-and-rv' },
  { label: 'Trade & Industrial', value: 'trade-and-industrial' },
  { label: 'Commercial', value: 'commercial' },
] as const

export const pillarValues = pillarOptions.map((o) => o.value)

export const pillarLabel = (value?: string): string =>
  pillarOptions.find((o) => o.value === value)?.label ?? (value || '')

export const pillarSelectField = (overrides?: Partial<SelectField>): SelectField => ({
  name: 'pillar',
  type: 'select',
  required: true,
  options: pillarOptions.map((o) => ({ label: o.label, value: o.value })),
  ...overrides,
})
