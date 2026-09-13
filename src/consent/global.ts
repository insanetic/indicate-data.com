import type { GlobalConfig } from 'payload'

import { consentConfig } from './config'
import { revalidateConsent } from './hooks/revalidateConsent'

const categoryOptions = consentConfig.categories.map((c) => ({ label: c.key, value: c.key }))

/**
 * Editor-owned parts of the consent layer: texts, links, categories with their services, and a
 * revision that re-asks every visitor when raised. Button labels live in ./defaults.ts.
 */
export const Consent: GlobalConfig = {
  slug: 'consent',
  label: { de: 'Cookies & Tracking', en: 'Cookies & tracking' },
  access: { read: () => true },
  admin: { group: { de: 'Website', en: 'Site' } },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: { de: 'Banner und Tracking aktiv', en: 'Banner and tracking active' },
          admin: { width: '50%' },
        },
        {
          name: 'revision',
          type: 'number',
          defaultValue: 1,
          min: 1,
          required: true,
          label: { de: 'Revision', en: 'Revision' },
          admin: {
            width: '50%',
            description: {
              de: 'Erhöhen, um alle Besucher erneut zu fragen (z. B. nach neuen Diensten).',
              en: 'Increase to ask every visitor again (e.g. after adding services).',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'privacyPage',
          type: 'relationship',
          relationTo: 'pages',
          label: { de: 'Datenschutz-Seite', en: 'Privacy page' },
          admin: { width: '50%' },
        },
        {
          name: 'imprintPage',
          type: 'relationship',
          relationTo: 'pages',
          label: { de: 'Impressum-Seite', en: 'Imprint page' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'banner',
      type: 'group',
      label: { de: 'Banner (erste Ebene)', en: 'Banner (first layer)' },
      fields: [
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: { de: 'Einstellungen (zweite Ebene)', en: 'Settings (second layer)' },
      fields: [
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      label: { de: 'Kategorien', en: 'Categories' },
      labels: { singular: { de: 'Kategorie', en: 'Category' }, plural: { de: 'Kategorien', en: 'Categories' } },
      admin: { components: { RowLabel: '@/consent/CategoryRowLabel#CategoryRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'key', type: 'select', required: true, options: categoryOptions, admin: { width: '30%' } },
            { name: 'label', type: 'text', localized: true, label: { de: 'Bezeichnung', en: 'Label' }, admin: { width: '70%' } },
          ],
        },
        { name: 'description', type: 'textarea', localized: true, label: { de: 'Beschreibung', en: 'Description' } },
        {
          name: 'services',
          type: 'array',
          label: { de: 'Dienste', en: 'Services' },
          labels: { singular: { de: 'Dienst', en: 'Service' }, plural: { de: 'Dienste', en: 'Services' } },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '50%' } },
                { name: 'provider', type: 'text', label: { de: 'Anbieter', en: 'Provider' }, admin: { width: '50%' } },
              ],
            },
            { name: 'purpose', type: 'textarea', localized: true, label: { de: 'Zweck', en: 'Purpose' } },
            {
              type: 'row',
              fields: [
                {
                  name: 'cookies',
                  type: 'text',
                  label: { de: 'Cookies und Laufzeit', en: 'Cookies and lifetime' },
                  admin: { width: '50%', placeholder: '_ga, _ga_* · 2 Jahre' },
                },
                { name: 'privacyUrl', type: 'text', label: { de: 'Datenschutz-Link', en: 'Privacy link' }, admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateConsent] },
}
