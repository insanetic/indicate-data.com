import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

export const PricingTeaser: Block = {
  slug: 'pricingTeaser',
  interfaceName: 'PricingTeaserBlock',
  labels: {
    singular: { de: 'Preise (Übersicht)', en: 'Pricing (overview)' },
    plural: { de: 'Preis-Abschnitte', en: 'Pricing sections' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'plans',
      type: 'array',
      label: { de: 'Pakete', en: 'Plans' },
      labels: { singular: { de: 'Paket', en: 'Plan' }, plural: { de: 'Pakete', en: 'Plans' } },
      minRows: 1,
      maxRows: 4,
      admin: { components: { RowLabel: '@/blocks/PricingTeaser/RowLabel#PlanRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '40%' } },
            {
              name: 'price',
              type: 'text',
              required: true,
              label: { de: 'Preis (z. B. 100 €)', en: 'Price (e.g. 100 €)' },
              admin: { width: '30%', description: { de: 'Gilt für alle Sprachen.', en: 'Shared across languages.' } },
            },
            { name: 'period', type: 'text', localized: true, label: { de: 'Zeitraum (z. B. pro Monat)', en: 'Period (e.g. per month)' }, admin: { width: '30%' } },
          ],
        },
        { name: 'description', type: 'text', localized: true, label: { de: 'Für wen', en: 'Who it is for' } },
        {
          name: 'points',
          type: 'array',
          label: { de: 'Enthalten', en: 'Included' },
          maxRows: 6,
          fields: [{ name: 'text', type: 'text', required: true, localized: true, label: { de: 'Punkt', en: 'Point' } }],
        },
        {
          name: 'highlighted',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Hervorheben (empfohlen)', en: 'Highlight (recommended)' },
        },
        linkGroup({
          appearances: ['default', 'outline'],
          localized: true,
          overrides: { maxRows: 1, label: { de: 'Button', en: 'Button' } },
        }),
      ],
    },
    { name: 'footnote', type: 'text', localized: true, label: { de: 'Fußnote', en: 'Footnote' } },
    linkGroup({
      appearances: ['link', 'outline'],
      localized: true,
      overrides: { maxRows: 1, label: { de: 'Link zur Preisseite (optional)', en: 'Link to pricing page (optional)' } },
    }),
    sectionSettings({ defaultBackground: 'tinted' }),
  ],
}
