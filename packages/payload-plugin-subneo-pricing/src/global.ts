import type { Field, GlobalConfig } from 'payload'

import { SUBNEO_API_URL, SUBNEO_API_VERSION } from '@subneo/sdk'

import { l } from './labels'
import { revalidatePricing } from './hooks'
import type { ResolvedPluginOptions } from './types'

type Args = ResolvedPluginOptions & { localized: boolean }

const text = (name: string, label: Record<string, string>, extra: Partial<Field> = {}, localized = false): Field =>
  ({ name, type: 'text', label, ...(localized ? { localized: true } : {}), ...extra }) as Field

/**
 * Connection, plan families and display overrides. Readable only by logged-in users so the API
 * key never leaves the server; the loader reads it with `overrideAccess`.
 */
export const createSubneoPricingGlobal = ({ globalSlug, adminGroup, env, localized }: Args): GlobalConfig => ({
  slug: globalSlug,
  label: l('Preise (Subneo)', 'Pricing (Subneo)'),
  access: { read: ({ req }) => Boolean(req.user) },
  admin: { group: adminGroup },
  hooks: { afterChange: [revalidatePricing] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: l('Verbindung', 'Connection'),
          description: l(
            'Woher die Pakete kommen. Der API-Schlüssel kann hier oder als Umgebungsvariable hinterlegt werden.',
            'Where the plans come from. The API key can live here or in an environment variable.',
          ),
          fields: [
            {
              name: 'source',
              type: 'select',
              defaultValue: 'fixture',
              required: true,
              label: l('Datenquelle', 'Data source'),
              options: [
                { label: l('Subneo API (live)', 'Subneo API (live)'), value: 'subneo' },
                { label: l('Beispieldaten (Vorschau)', 'Example data (preview)'), value: 'fixture' },
              ],
            },
            {
              type: 'row',
              fields: [
                text('baseUrl', l('API-Basis-URL', 'API base URL'), {
                  defaultValue: SUBNEO_API_URL,
                  admin: { width: '50%', placeholder: SUBNEO_API_URL, description: l(`Leer: ${env.baseUrl} oder ${SUBNEO_API_URL}`, `Empty: ${env.baseUrl} or ${SUBNEO_API_URL}`) },
                }),
                text('apiVersion', l('API-Version (Datum)', 'API version (date)'), {
                  defaultValue: SUBNEO_API_VERSION,
                  admin: { width: '25%', placeholder: SUBNEO_API_VERSION },
                }),
                {
                  name: 'cacheSeconds',
                  type: 'number',
                  defaultValue: 300,
                  min: 0,
                  label: l('Cache (Sekunden)', 'Cache (seconds)'),
                  admin: { width: '25%', description: l('Wie lange geladene Pakete gültig bleiben.', 'How long fetched plans stay valid.') },
                },
              ],
            },
            text('apiKey', l('API-Schlüssel (sneo_…)', 'API key (sneo_…)'), {
              access: { read: ({ req }) => Boolean(req.user) },
              admin: {
                description: l(
                  `Leer lassen, um die Umgebungsvariable ${env.apiKey} zu verwenden. Nur eingeloggte Nutzer sehen diesen Wert.`,
                  `Leave empty to use the environment variable ${env.apiKey}. Only logged-in users can read this value.`,
                ),
              },
            }),
          ],
        },
        {
          label: l('Paketfamilien', 'Plan families'),
          description: l(
            'Jede Familie ist eine Gruppe von Paketen in Subneo, z. B. die App-Pakete und die Agent-Zusatzpakete.',
            'Each family is a group of plans in Subneo, e.g. the app plans and the agent add-ons.',
          ),
          fields: [
            {
              name: 'families',
              type: 'array',
              label: l('Familien', 'Families'),
              labels: { singular: l('Familie', 'Family'), plural: l('Familien', 'Families') },
              admin: { initCollapsed: false },
              fields: [
                {
                  type: 'row',
                  fields: [
                    text('code', l('Familien-Code (Subneo)', 'Family code (Subneo)'), { required: true, admin: { width: '40%' } }),
                    {
                      name: 'role',
                      type: 'select',
                      defaultValue: 'app',
                      required: true,
                      label: l('Rolle', 'Role'),
                      admin: { width: '30%' },
                      options: [
                        { label: l('Hauptpakete (Karten + Vergleich)', 'Main plans (cards + comparison)'), value: 'app' },
                        { label: l('Zusatzpakete (kompakt)', 'Add-ons (compact)'), value: 'addon' },
                      ],
                    },
                    text('featuredPlanCode', l('Hervorgehobenes Paket (Code)', 'Featured plan (code)'), {
                      admin: { width: '30%', description: l('Leer: Metadaten „featured“ aus Subneo.', 'Empty: Subneo metadata “featured”.') },
                    }),
                  ],
                },
                text('label', l('Überschrift der Familie', 'Family heading'), {}, localized),
                { name: 'lead', type: 'textarea', label: l('Einleitung', 'Lead'), ...(localized ? { localized: true } : {}) } as Field,
                text('unit', l('Einheit unter dem Preis (z. B. „pro Betrieb und Monat“)', 'Unit below the price (e.g. “per property and month”)'), {}, localized),
                {
                  name: 'highlightFeatures',
                  type: 'array',
                  label: l('Auf den Karten gezeigte Leistungen (leer = die ersten fünf)', 'Entitlements shown on the cards (empty = first five)'),
                  labels: { singular: l('Leistung', 'Entitlement'), plural: l('Leistungen', 'Entitlements') },
                  admin: { initCollapsed: true },
                  fields: [text('featureCode', l('Feature-Code', 'Feature code'), { required: true })],
                },
                {
                  name: 'showInComparison',
                  type: 'checkbox',
                  defaultValue: true,
                  label: l('Vergleichstabelle anzeigen', 'Show comparison table'),
                },
              ],
            },
          ],
        },
        {
          label: l('Anpassungen', 'Overrides'),
          description: l(
            'Namen und Texte aus Subneo pro Sprache ersetzen oder einzelne Einträge ausblenden. Alles andere kommt unverändert aus Subneo.',
            'Replace names and texts from Subneo per language or hide single entries. Everything else comes from Subneo as is.',
          ),
          fields: [
            {
              name: 'planOverrides',
              type: 'array',
              label: l('Pakete', 'Plans'),
              labels: { singular: l('Paket', 'Plan'), plural: l('Pakete', 'Plans') },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    text('planCode', l('Paket-Code', 'Plan code'), { required: true, admin: { width: '50%' } }),
                    text('name', l('Name', 'Name'), { admin: { width: '50%' } }, localized),
                  ],
                },
                text('tagline', l('Für wen (eine Zeile)', 'Who it is for (one line)'), {}, localized),
                {
                  type: 'row',
                  fields: [
                    text('badge', l('Badge (z. B. „Beliebt“)', 'Badge (e.g. “Popular”)'), { admin: { width: '33%' } }, localized),
                    text('ctaLabel', l('Button-Text', 'Button label'), { admin: { width: '33%' } }, localized),
                    text('ctaUrl', l('Button-Ziel (überschreibt Vorlage)', 'Button target (overrides template)'), { admin: { width: '34%' } }),
                  ],
                },
                { name: 'hidden', type: 'checkbox', defaultValue: false, label: l('Ausblenden', 'Hide') },
              ],
            },
            {
              name: 'featureOverrides',
              type: 'array',
              label: l('Leistungen', 'Entitlements'),
              labels: { singular: l('Leistung', 'Entitlement'), plural: l('Leistungen', 'Entitlements') },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    text('featureCode', l('Feature-Code', 'Feature code'), { required: true, admin: { width: '50%' } }),
                    text('label', l('Name', 'Name'), { admin: { width: '50%' } }, localized),
                  ],
                },
                text('description', l('Beschreibung', 'Description'), {}, localized),
                { name: 'hidden', type: 'checkbox', defaultValue: false, label: l('Ausblenden', 'Hide') },
              ],
            },
            {
              name: 'groupOverrides',
              type: 'array',
              label: l('Gruppen', 'Groups'),
              labels: { singular: l('Gruppe', 'Group'), plural: l('Gruppen', 'Groups') },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    text('groupCode', l('Gruppen-Code', 'Group code'), { required: true, admin: { width: '40%' } }),
                    text('label', l('Name', 'Name'), { admin: { width: '40%' } }, localized),
                    { name: 'order', type: 'number', label: l('Reihenfolge', 'Order'), admin: { width: '20%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: l('Buttons', 'Buttons'),
          fields: [
            text('defaultCtaUrl', l('Button-Vorlage für Pakete mit Preis', 'Button template for priced plans'), {
              defaultValue: 'https://app.indicate-data.com/signup?plan={plan}&rate={rate}',
              admin: { description: l('{plan} und {rate} werden durch die Codes ersetzt.', '{plan} and {rate} are replaced with the codes.') },
            }),
            text('contactUrl', l('Button-Ziel für Pakete auf Anfrage', 'Button target for plans on request'), {
              defaultValue: '/contact',
            }),
          ],
        },
      ],
    },
  ],
})
