import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { de: 'Fußzeile', en: 'Footer' },
  access: {
    read: () => true,
  },
  admin: {
    group: { de: 'Website', en: 'Site' },
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: { de: 'Linkspalten', en: 'Link columns' },
      labels: { singular: { de: 'Spalte', en: 'Column' }, plural: { de: 'Spalten', en: 'Columns' } },
      maxRows: 5,
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#ColumnRowLabel' },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: { de: 'Spaltentitel', en: 'Column title' },
        },
        {
          name: 'links',
          type: 'array',
          label: { de: 'Links', en: 'Links' },
          maxRows: 10,
          admin: { components: { RowLabel: '@/Footer/RowLabel#LinkRowLabel' } },
          fields: [link({ appearances: false, localized: true })],
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: { de: 'Rechtliches (Impressum, Datenschutz …)', en: 'Legal links (imprint, privacy …)' },
      maxRows: 6,
      admin: { initCollapsed: true, components: { RowLabel: '@/Footer/RowLabel#LinkRowLabel' } },
      fields: [link({ appearances: false, localized: true })],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showContact',
          type: 'checkbox',
          defaultValue: true,
          label: { de: 'Kontaktdaten anzeigen', en: 'Show contact details' },
          admin: { width: '50%' },
        },
        {
          name: 'showLanguageSwitch',
          type: 'checkbox',
          defaultValue: true,
          label: { de: 'Sprachwahl anzeigen', en: 'Show language switch' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'bottomText',
      type: 'text',
      localized: true,
      label: { de: 'Zeile ganz unten (ohne ©-Jahr, wird ergänzt)', en: 'Bottom line (without © year, added automatically)' },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}

/** Legacy `navItems` from the starter template; see Header config for why it is kept. */
Footer.fields.push({
  name: 'navItems',
  type: 'array',
  admin: { hidden: true },
  fields: [link({ appearances: false })],
})
