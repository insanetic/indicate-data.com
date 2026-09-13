import type { Block, Field } from 'payload'

import { l } from './labels'

export interface PricingBlockOptions {
  slug?: string
  interfaceName?: string
  /** Store headings per language (needs `localization` in the Payload config). */
  localized?: boolean
  /** Site-specific fields placed before the block's own (e.g. a section header). */
  before?: Field[]
  /** Site-specific fields placed after (e.g. section settings). */
  after?: Field[]
}

const text = (name: string, label: Record<string, string>, localized: boolean, extra: Partial<Field> = {}): Field =>
  ({ name, type: 'text', label, ...(localized ? { localized: true } : {}), ...extra }) as Field

/**
 * The page block that renders the plans. It decides *what* shows (which families, cards, add-ons,
 * comparison) and carries the headings; the data comes from the global through `getPricing`.
 */
export const createPricingBlock = ({
  slug = 'pricing',
  interfaceName = 'PricingBlock',
  localized = false,
  before = [],
  after = [],
}: PricingBlockOptions = {}): Block => ({
  slug,
  interfaceName,
  labels: { singular: l('Preise (Subneo)', 'Pricing (Subneo)'), plural: l('Preis-Abschnitte (Subneo)', 'Pricing sections (Subneo)') },
  fields: [
    ...before,
    {
      name: 'families',
      type: 'array',
      label: l('Paketfamilien (leer = alle konfigurierten)', 'Plan families (empty = all configured)'),
      labels: { singular: l('Familie', 'Family'), plural: l('Familien', 'Families') },
      admin: { initCollapsed: true },
      fields: [text('code', l('Familien-Code', 'Family code'), false, { required: true })],
    },
    {
      name: 'show',
      type: 'group',
      label: l('Abschnitte', 'Sections'),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'cards', type: 'checkbox', defaultValue: true, label: l('Paketkarten', 'Plan cards'), admin: { width: '33%' } },
            { name: 'addons', type: 'checkbox', defaultValue: true, label: l('Zusatzpakete', 'Add-ons'), admin: { width: '33%' } },
            { name: 'comparison', type: 'checkbox', defaultValue: true, label: l('Vergleichstabelle', 'Comparison table'), admin: { width: '34%' } },
          ],
        },
      ],
    },
    {
      name: 'addonsHeader',
      type: 'group',
      label: l('Überschrift Zusatzpakete', 'Add-ons heading'),
      admin: { condition: (_, siblingData) => siblingData?.show?.addons !== false },
      fields: [
        text('heading', l('Überschrift', 'Heading'), localized),
        { name: 'lead', type: 'textarea', label: l('Einleitung', 'Lead'), ...(localized ? { localized: true } : {}) } as Field,
      ],
    },
    {
      name: 'comparisonHeader',
      type: 'group',
      label: l('Überschrift Vergleich', 'Comparison heading'),
      admin: { condition: (_, siblingData) => siblingData?.show?.comparison !== false },
      fields: [
        text('heading', l('Überschrift', 'Heading'), localized),
        { name: 'lead', type: 'textarea', label: l('Einleitung', 'Lead'), ...(localized ? { localized: true } : {}) } as Field,
      ],
    },
    text('footnote', l('Fußnote (z. B. „Alle Preise zzgl. MwSt.“)', 'Footnote (e.g. “All prices exclude VAT”)'), localized),
    ...after,
  ],
})
