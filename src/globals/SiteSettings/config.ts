import type { GlobalConfig } from 'payload'

import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

/**
 * Site-wide facts every page can use: name, logo, contact, external product links.
 * Editable by the marketer; read by header, footer, metadata and blocks.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { de: 'Website-Einstellungen', en: 'Site settings' },
  access: {
    read: () => true,
  },
  admin: {
    group: { de: 'Website', en: 'Site' },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { de: 'Allgemein', en: 'General' },
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              defaultValue: 'Indicate Data',
              label: { de: 'Name der Website', en: 'Site name' },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: { de: 'Kurzbeschreibung (Footer, Suchmaschinen)', en: 'Tagline (footer, search engines)' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: { de: 'Logo (hell)', en: 'Logo (light background)' },
                  admin: {
                    width: '50%',
                    description: {
                      de: 'Leer lassen, um das eingebaute Logo zu verwenden.',
                      en: 'Leave empty to use the built-in logo.',
                    },
                  },
                },
                {
                  name: 'logoDark',
                  type: 'upload',
                  relationTo: 'media',
                  label: { de: 'Logo (dunkel)', en: 'Logo (dark background)' },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: { de: 'Standard-Vorschaubild (Social Media)', en: 'Default share image (social media)' },
            },
          ],
        },
        {
          label: { de: 'Kontakt & Links', en: 'Contact & links' },
          fields: [
            {
              name: 'contact',
              type: 'group',
              label: { de: 'Kontakt', en: 'Contact' },
              fields: [
                { name: 'email', type: 'email', label: 'E-Mail' },
                { name: 'phone', type: 'text', label: { de: 'Telefon', en: 'Phone' } },
                {
                  name: 'address',
                  type: 'textarea',
                  label: { de: 'Adresse (eine Zeile pro Zeile)', en: 'Address (one line per line)' },
                },
              ],
            },
            {
              name: 'links',
              type: 'group',
              label: { de: 'Produkt-Links', en: 'Product links' },
              fields: [
                { name: 'appUrl', type: 'text', label: { de: 'Login / App', en: 'Login / app' } },
                { name: 'demoUrl', type: 'text', label: { de: 'Demo buchen', en: 'Book a demo' } },
                { name: 'helpUrl', type: 'text', label: { de: 'Hilfe-Center', en: 'Help centre' } },
                { name: 'docsUrl', type: 'text', label: { de: 'Entwickler-Dokumentation', en: 'Developer docs' } },
              ],
            },
            {
              name: 'social',
              type: 'array',
              label: { de: 'Soziale Netzwerke', en: 'Social networks' },
              labels: {
                singular: { de: 'Netzwerk', en: 'Network' },
                plural: { de: 'Netzwerke', en: 'Networks' },
              },
              admin: { components: { RowLabel: '@/globals/SiteSettings/SocialRowLabel#SocialRowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      admin: { width: '40%' },
                      options: [
                        { label: 'LinkedIn', value: 'linkedin' },
                        { label: 'Discord', value: 'discord' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'X', value: 'x' },
                      ],
                    },
                    { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
