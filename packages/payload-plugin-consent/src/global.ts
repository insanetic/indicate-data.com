import { ValidationError, type Field, type GlobalConfig } from 'payload'

import type { ConsentGlobalDoc } from './defaults'
import { createRevalidateHook } from './hooks/revalidate'
import type { ResolvedPluginOptions } from './plugin'
import {
  integrationEnv,
  resolveIntegrations,
  runtimeIntegrations,
  serverEnv,
  settingsOf,
  type ResolvedSetup,
  type RuntimeEnv,
} from './setup'

type Row = { key?: string | null } | null | undefined

/** Payload `validate` for the categories array: every key known, none twice. */
export const validateCategoryRows =
  (setup: ResolvedSetup) =>
  (value: unknown): true | string => {
    const rows = Array.isArray(value) ? (value as Row[]) : []
    const seen = new Set<string>()
    const known = new Set(setup.categories.map((c) => c.key))
    for (const row of rows) {
      const key = row?.key
      if (!key) continue
      if (!known.has(key)) return `Category "${key}" is unknown to the site setup.`
      if (seen.has(key)) return `Category "${key}" appears twice.`
      seen.add(key)
    }
    return true
  }

/**
 * Integrations enabled at runtime that have no service row with their key inside their own
 * category. `env` (default `process.env`) decides which integrations count, so a staging server
 * without a container id is not asked to list one.
 */
export function missingServiceRows(
  setup: ResolvedSetup,
  data: ConsentGlobalDoc | null | undefined,
  env?: RuntimeEnv,
): string[] {
  const rows = data?.categories || []
  const runtime = integrationEnv(setup, data?.integrations, env ?? serverEnv())
  return runtimeIntegrations(setup, { integrations: resolveIntegrations(setup, runtime) })
    .filter((integration) => {
      const row = rows.find((r) => r?.key === integration.category)
      return !(row?.services || []).some((s) => s?.integration === integration.key)
    })
    .map((integration) => integration.key)
}

/**
 * Editor-owned parts of the consent layer: texts, links, trigger, categories with their services
 * and a revision that re-asks every visitor when raised. Button labels live in ./defaults.ts.
 */
export const createConsentGlobal = (setup: ResolvedSetup, options: ResolvedPluginOptions): GlobalConfig => {
  const { globalSlug, adminGroup, cacheTag, componentPaths, localized } = options
  const loc = (extra: Partial<Field> = {}): Partial<Field> => (localized ? { localized: true, ...extra } : extra)
  const validateRows = validateCategoryRows(setup)
  const categoryOptions = setup.categories.map((c) => ({ label: c.texts.en?.label || c.key, value: c.key }))
  const integrationOptions = [
    { label: '—', value: 'none' },
    ...setup.integrations.map((i) => ({ label: `${i.service.name} (${i.key})`, value: i.key })),
  ]

  // Ids and keys an editor may change without a deploy. Each value overrides the environment
  // variable of the same name; an integration that declares nothing does not appear here.
  const configurable = settingsOf(setup)
  const integrationFields: Field[] =
    configurable.length === 0
      ? []
      : [
          {
            name: 'integrations',
            type: 'group',
            label: { de: 'Integrationen', en: 'Integrations' },
            admin: {
              description: {
                de: 'Zugangsdaten der Dienste, die auf dieser Seite laufen. Leere Felder werden aus der Server-Umgebung gelesen.',
                en: 'Ids of the services running on this site. Empty fields are read from the server environment.',
              },
            },
            fields: configurable.map((integration) => ({
              name: integration.key,
              type: 'group',
              label: integration.service.name,
              fields: (integration.settings || []).map((setting) => ({
                name: setting.name,
                type: 'text',
                label: setting.label,
                validate: (value: unknown) => {
                  const text = typeof value === 'string' ? value.trim() : ''
                  if (!text || !setting.validate) return true
                  return setting.validate(text)
                },
                admin: {
                  placeholder: setting.placeholder,
                  ...(setting.description ? { description: setting.description } : {}),
                },
              })) as Field[],
            })) as Field[],
          } as Field,
        ]

  return {
    slug: globalSlug,
    label: { de: 'Cookies & Tracking', en: 'Cookies & tracking' },
    access: { read: () => true },
    admin: { group: adminGroup },
    hooks: {
      beforeValidate: [
        async ({ data, originalDoc, req }) => {
          // A partial update carries only the changed fields: validate the merged document, but
          // treat an explicit empty array as the removal it is.
          const doc = data as ConsentGlobalDoc | undefined
          const saved = originalDoc as ConsentGlobalDoc | undefined
          const categories = doc?.categories === undefined ? saved?.categories : doc.categories
          const integrations = doc?.integrations === undefined ? saved?.integrations : doc.integrations
          const missing = missingServiceRows(setup, { categories, integrations })
          if (missing.length > 0) {
            // The label carries the integration key: Payload builds the toast from the labels,
            // the per-field `message` only shows next to the array itself.
            throw new ValidationError(
              {
                global: globalSlug,
                req,
                errors: missing.map((key) => ({
                  path: 'categories',
                  label: { de: `Kategorien (${key})`, en: `Categories (${key})` },
                  message: `Integration "${key}" runs on this site but has no service row (with integration "${key}") in its category. Add the row so visitors see what runs.`,
                })),
              },
              req?.t,
            )
          }
          return data
        },
      ],
      afterChange: [createRevalidateHook(cacheTag)],
    },
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
      ...integrationFields,
      {
        type: 'row',
        fields: [
          { name: 'privacyPage', type: 'relationship', relationTo: 'pages', label: { de: 'Datenschutz-Seite', en: 'Privacy page' }, admin: { width: '50%' } },
          { name: 'imprintPage', type: 'relationship', relationTo: 'pages', label: { de: 'Impressum-Seite', en: 'Imprint page' }, admin: { width: '50%' } },
        ],
      },
      {
        name: 'trigger',
        type: 'group',
        label: { de: 'Einstellungen erneut öffnen', en: 'Reopen settings' },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'mode',
                type: 'select',
                defaultValue: 'link',
                options: [
                  { label: { de: 'Link (z. B. in der Fußzeile)', en: 'Link (e.g. in the footer)' }, value: 'link' },
                  { label: { de: 'Schwebender Button', en: 'Floating button' }, value: 'floating' },
                ],
                label: { de: 'Art', en: 'Mode' },
                admin: { width: '50%' },
              },
              {
                name: 'position',
                type: 'select',
                defaultValue: 'bottom-left',
                options: [
                  { label: { de: 'Unten links', en: 'Bottom left' }, value: 'bottom-left' },
                  { label: { de: 'Unten rechts', en: 'Bottom right' }, value: 'bottom-right' },
                ],
                label: { de: 'Position', en: 'Position' },
                admin: { width: '50%', condition: (_, siblingData) => siblingData?.mode === 'floating' },
              },
            ],
          },
        ],
      },
      {
        name: 'banner',
        type: 'group',
        label: { de: 'Banner (erste Ebene)', en: 'Banner (first layer)' },
        fields: [
          { name: 'title', type: 'text', label: { de: 'Titel', en: 'Title' }, ...loc() } as Field,
          {
            name: 'text',
            type: 'textarea',
            label: { de: 'Text', en: 'Text' },
            admin: { description: { de: '{categories} wird durch die Kategorienamen ersetzt.', en: '{categories} is replaced by the category names.' } },
            ...loc(),
          } as Field,
        ],
      },
      {
        name: 'settings',
        type: 'group',
        label: { de: 'Einstellungen (zweite Ebene)', en: 'Settings (second layer)' },
        fields: [
          { name: 'title', type: 'text', label: { de: 'Titel', en: 'Title' }, ...loc() } as Field,
          { name: 'text', type: 'textarea', label: { de: 'Text', en: 'Text' }, ...loc() } as Field,
        ],
      },
      {
        name: 'categories',
        type: 'array',
        label: { de: 'Kategorien', en: 'Categories' },
        labels: { singular: { de: 'Kategorie', en: 'Category' }, plural: { de: 'Kategorien', en: 'Categories' } },
        validate: (value) => validateRows(value),
        admin: { components: { RowLabel: componentPaths.categoryRowLabel } },
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'key', type: 'select', required: true, options: categoryOptions, label: { de: 'Schlüssel', en: 'Key' }, admin: { width: '30%' } },
              { name: 'label', type: 'text', label: { de: 'Bezeichnung', en: 'Label' }, admin: { width: '70%' }, ...loc() } as Field,
            ],
          },
          { name: 'description', type: 'textarea', label: { de: 'Beschreibung', en: 'Description' }, ...loc() } as Field,
          {
            name: 'services',
            type: 'array',
            label: { de: 'Dienste', en: 'Services' },
            labels: { singular: { de: 'Dienst', en: 'Service' }, plural: { de: 'Dienste', en: 'Services' } },
            admin: { initCollapsed: true, components: { RowLabel: componentPaths.serviceRowLabel } },
            fields: [
              {
                type: 'row',
                fields: [
                  { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '50%' } },
                  { name: 'provider', type: 'text', label: { de: 'Anbieter', en: 'Provider' }, admin: { width: '50%' } },
                ],
              },
              {
                name: 'integration',
                type: 'select',
                defaultValue: 'none',
                options: integrationOptions,
                label: { de: 'Technische Integration', en: 'Code integration' },
                admin: {
                  description: {
                    de: 'Welcher Code-Baustein diesen Dienst lädt. Jede aktive Integration braucht genau so eine Zeile in ihrer Kategorie.',
                    en: 'Which code integration loads this service. Every active integration needs such a row in its category.',
                  },
                },
              },
              { name: 'purpose', type: 'textarea', label: { de: 'Zweck', en: 'Purpose' }, ...loc() } as Field,
              {
                type: 'row',
                fields: [
                  {
                    name: 'cookies',
                    type: 'text',
                    label: { de: 'Cookies und Laufzeit', en: 'Cookies and lifetime' },
                    admin: { width: '50%', placeholder: '_ga, _ga_* · 2 Jahre / 2 years' },
                  },
                  {
                    name: 'privacyUrl',
                    type: 'text',
                    label: { de: 'Datenschutz-Link', en: 'Privacy link' },
                    // The value becomes an href in the settings dialog: only http(s), never javascript:.
                    validate: (value: unknown) => !value || /^https?:\/\//i.test(String(value)) || 'Use an http(s) URL',
                    admin: { width: '50%', placeholder: 'https://…' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}
