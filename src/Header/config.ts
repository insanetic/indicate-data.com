import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { iconSelect } from '@/fields/iconSelect'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: { de: 'Kopfzeile & Navigation', en: 'Header & navigation' },
  access: {
    read: () => true,
  },
  admin: {
    group: { de: 'Website', en: 'Site' },
  },
  fields: [
    {
      name: 'announcement',
      type: 'group',
      label: { de: 'Hinweisleiste (über der Navigation)', en: 'Announcement bar (above the navigation)' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Anzeigen', en: 'Show' },
        },
        {
          name: 'text',
          type: 'text',
          localized: true,
          label: { de: 'Text', en: 'Text' },
          admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
        },
        link({
          appearances: false,
          localized: true,
          overrides: {
            admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
          },
        }),
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: { de: 'Navigationspunkte', en: 'Navigation items' },
      labels: {
        singular: { de: 'Navigationspunkt', en: 'Navigation item' },
        plural: { de: 'Navigationspunkte', en: 'Navigation items' },
      },
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              localized: true,
              required: true,
              label: { de: 'Beschriftung', en: 'Label' },
              admin: { width: '50%' },
            },
            {
              name: 'type',
              type: 'radio',
              defaultValue: 'link',
              label: { de: 'Art', en: 'Type' },
              admin: { layout: 'horizontal', width: '50%' },
              options: [
                { label: { de: 'Einfacher Link', en: 'Single link' }, value: 'link' },
                { label: { de: 'Menü mit Spalten', en: 'Menu with columns' }, value: 'menu' },
              ],
            },
          ],
        },
        link({
          appearances: false,
          disableLabel: true,
          overrides: {
            admin: { condition: (_, siblingData) => siblingData?.type !== 'menu' },
          },
        }),
        {
          name: 'columns',
          type: 'array',
          label: { de: 'Menüspalten', en: 'Menu columns' },
          labels: {
            singular: { de: 'Spalte', en: 'Column' },
            plural: { de: 'Spalten', en: 'Columns' },
          },
          maxRows: 3,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'menu',
            components: { RowLabel: '@/Header/RowLabel#ColumnRowLabel' },
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              label: { de: 'Spaltentitel', en: 'Column title' },
            },
            {
              name: 'links',
              type: 'array',
              label: { de: 'Einträge', en: 'Entries' },
              labels: {
                singular: { de: 'Eintrag', en: 'Entry' },
                plural: { de: 'Einträge', en: 'Entries' },
              },
              maxRows: 8,
              admin: { components: { RowLabel: '@/Header/RowLabel#MenuLinkRowLabel' } },
              fields: [
                link({ appearances: false, localized: true }),
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'description',
                      type: 'text',
                      localized: true,
                      label: { de: 'Kurzbeschreibung', en: 'Short description' },
                      admin: { width: '70%' },
                    },
                    iconSelect({ admin: { width: '30%' } }),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      label: { de: 'Zweiter Button (z. B. Anmelden)', en: 'Secondary button (e.g. Sign in)' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, label: { de: 'Anzeigen', en: 'Show' } },
        link({
          appearances: false,
          localized: true,
          overrides: { admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) } },
        }),
      ],
    },
    {
      name: 'primaryCta',
      type: 'group',
      label: { de: 'Hauptbutton (z. B. Demo buchen)', en: 'Primary button (e.g. Book a demo)' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, label: { de: 'Anzeigen', en: 'Show' } },
        link({
          appearances: false,
          localized: true,
          overrides: { admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) } },
        }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}

/**
 * Legacy `navItems` from the starter template, hidden and unused. It stays in the config so the
 * dev-mode schema push never has to delete a table (drizzle-kit would prompt in the Docker
 * container). Remove it together with a migration.
 */
Header.fields.push({
  name: 'navItems',
  type: 'array',
  admin: { hidden: true },
  fields: [link({ appearances: false })],
})
