import type { Field, GlobalConfig } from 'payload'

import { SUBNEO_API_URL, SUBNEO_API_VERSION } from '@subneo/sdk'

import { l } from './labels'
import { revalidatePricing } from './hooks'
import { validateManualEntitlement, type ManualCatalogue } from './manual'
import type { ResolvedPluginOptions } from './types'

type Args = ResolvedPluginOptions & { localized: boolean }

const text = (name: string, label: Record<string, string>, extra: Partial<Field> = {}, localized = false): Field =>
  ({ name, type: 'text', label, ...(localized ? { localized: true } : {}), ...extra }) as Field

/**
 * Connection, plan families and display overrides. Readable only by logged-in users so the API
 * key never leaves the server; the loader reads it with `overrideAccess`.
 */
export const createSubneoPricingGlobal = ({ globalSlug, adminGroup, env, componentPaths, localized }: Args): GlobalConfig => ({
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
                { label: l('Manuell gepflegt (Tab „Pakete (manuell)“)', 'Maintained by hand (tab “Plans (manual)”)'), value: 'manual' },
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
        manualTab(componentPaths.rowLabel),
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

const isManual = (data: Partial<{ source: string }> | undefined) => data?.source === 'manual'

const KINDS = [
  { label: l('An/aus (ja, nein)', 'On/off (ja, nein)'), value: 'boolean' },
  { label: l('Menge (3, 10/10, unbegrenzt)', 'Amount (3, 10/10, unbegrenzt)'), value: 'allocation' },
  { label: l('Monatskontingent (500, unbegrenzt)', 'Monthly allowance (500, unbegrenzt)'), value: 'consumable' },
  { label: l('Zahl (50)', 'Number (50)'), value: 'number' },
  { label: l('Text', 'Text'), value: 'string' },
]

/**
 * Plans typed in by hand, used while the Subneo catalogue is not live (source "manual"). The shape
 * mirrors Subneo's: groups, features with a type, plans with EUR prices and a value per feature.
 * Single-language like Subneo; the overrides tab translates names and texts.
 */
const manualTab = (rowLabel: string) => ({
  label: l('Pakete (manuell)', 'Plans (manual)'),
  description: l(
    'Nur aktiv, wenn die Datenquelle „Manuell gepflegt“ ist. Namen hier wie in Subneo (eine Sprache); Übersetzungen im Tab „Anpassungen“.',
    'Only used when the data source is “Maintained by hand”. Names as in Subneo (one language); translations live in the “Overrides” tab.',
  ),
  fields: [
    {
      name: 'manualGroups',
      type: 'array',
      label: l('Gruppen der Vergleichstabelle', 'Comparison groups'),
      labels: { singular: l('Gruppe', 'Group'), plural: l('Gruppen', 'Groups') },
      admin: { initCollapsed: true, condition: isManual, components: { RowLabel: rowLabel } },
      fields: [
        {
          type: 'row',
          fields: [
            text('code', l('Code', 'Code'), { required: true, admin: { width: '40%' } }),
            text('name', l('Name', 'Name'), { required: true, admin: { width: '60%' } }),
          ],
        },
      ],
    },
    {
      name: 'manualFeatures',
      type: 'array',
      label: l('Leistungen', 'Features'),
      labels: { singular: l('Leistung', 'Feature'), plural: l('Leistungen', 'Features') },
      admin: {
        initCollapsed: true,
        condition: isManual,
        components: { RowLabel: rowLabel },
        description: l(
          'Alle Leistungen, die Pakete enthalten können. Die Reihenfolge auf Karten und in der Tabelle kommt aus der Liste im Paket.',
          'Every feature a plan can carry. The order on the cards and in the table comes from the list inside each plan.',
        ),
      },
      fields: [
        {
          type: 'row',
          fields: [
            text('code', l('Feature-Code', 'Feature code'), { required: true, admin: { width: '30%' } }),
            text('name', l('Name', 'Name'), { required: true, admin: { width: '70%' } }),
          ],
        },
        text('description', l('Beschreibung', 'Description')),
        {
          type: 'row',
          fields: [
            { name: 'kind', type: 'select', required: true, defaultValue: 'boolean', label: l('Art', 'Type'), options: KINDS, admin: { width: '50%' } },
            text('group', l('Gruppe (Code)', 'Group (code)'), {
              required: true,
              admin: { width: '50%' },
              validate: (value: unknown, { data }: { data: Partial<ManualCatalogue> }) =>
                !value || (data?.manualGroups || []).some((g) => g.code === value) || 'Unbekannte Gruppe / Unknown group',
            } as Partial<Field>),
          ],
        },
      ],
    },
    {
      name: 'manualPlans',
      type: 'array',
      label: l('Pakete', 'Plans'),
      labels: { singular: l('Paket', 'Plan'), plural: l('Pakete', 'Plans') },
      admin: {
        initCollapsed: true,
        condition: isManual,
        components: { RowLabel: rowLabel },
        description: l('Die Reihenfolge innerhalb einer Familie ist die Reihenfolge auf der Seite.', 'The order within a family is the order on the page.'),
      },
      fields: [
        {
          type: 'row',
          fields: [
            text('code', l('Paket-Code', 'Plan code'), { required: true, admin: { width: '25%' } }),
            text('name', l('Name', 'Name'), { required: true, admin: { width: '45%' } }),
            text('family', l('Familie (Code)', 'Family (code)'), { required: true, admin: { width: '30%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'monthlyPrice',
              type: 'number',
              min: 0,
              label: l('Preis monatlich (€ pro Monat)', 'Monthly price (€ per month)'),
              admin: { width: '50%', description: l('Beide Preise leer: Preis auf Anfrage.', 'Both prices empty: price on request.') },
            },
            {
              name: 'yearlyPrice',
              type: 'number',
              min: 0,
              label: l('Preis jährlich (€ pro Jahr, gesamt)', 'Yearly price (€ per year, total)'),
              admin: { width: '50%', description: l('Z. B. 1080 = 90 € pro Monat. Leer: kein Jahrespaket.', 'E.g. 1080 = 90 € per month. Empty: no yearly plan.') },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            text('tagline', l('Für wen (eine Zeile)', 'Who it is for (one line)'), { admin: { width: '50%' } }),
            text('badge', l('Badge', 'Badge'), { admin: { width: '30%' } }),
            { name: 'featured', type: 'checkbox', defaultValue: false, label: l('Hervorheben', 'Featured'), admin: { width: '20%' } },
          ],
        },
        {
          name: 'entitlements',
          type: 'array',
          label: l('Leistungen und Mengen', 'Features and amounts'),
          labels: { singular: l('Leistung', 'Feature'), plural: l('Leistungen', 'Features') },
          admin: {
            initCollapsed: true,
            components: { RowLabel: rowLabel },
            description: l(
              'Wert je nach Art: „ja“/„nein“; Menge „3“ (mehr dazubuchbar), „10/10“ (enthalten/maximal) oder „unbegrenzt“; Monatskontingent „500“; Zahl „50“; Text wie geschrieben. Fehlt eine Leistung, zeigt die Tabelle „–“.',
              'Value by type: “ja”/“nein”; amount “3” (more can be added), “10/10” (included/maximum) or “unbegrenzt”; monthly allowance “500”; number “50”; text as typed. A missing feature shows “–” in the table.',
            ),
          },
          fields: [
            {
              type: 'row',
              fields: [
                text('featureCode', l('Feature-Code', 'Feature code'), { required: true, admin: { width: '50%' } }),
                text('value', l('Wert', 'Value'), {
                  required: true,
                  admin: { width: '50%' },
                  validate: (value: unknown, { data, siblingData }: { data: Partial<ManualCatalogue>; siblingData: { featureCode?: string } }) =>
                    validateManualEntitlement(data, siblingData?.featureCode, typeof value === 'string' ? value : undefined),
                } as Partial<Field>),
              ],
            },
          ],
        },
        {
          name: 'featureRates',
          type: 'array',
          label: l('Zukaufpreise (z. B. je weitere Datenquelle)', 'Add-on prices (e.g. per extra connection)'),
          labels: { singular: l('Zukaufpreis', 'Add-on price'), plural: l('Zukaufpreise', 'Add-on prices') },
          admin: { initCollapsed: true, components: { RowLabel: rowLabel } },
          fields: [
            {
              type: 'row',
              fields: [
                text('featureCode', l('Feature-Code', 'Feature code'), { required: true, admin: { width: '40%' } }),
                { name: 'price', type: 'number', required: true, min: 0, label: l('Preis (€)', 'Price (€)'), admin: { width: '30%' } },
                {
                  name: 'packageSize',
                  type: 'number',
                  min: 1,
                  label: l('Pro Paket von', 'Per package of'),
                  admin: { width: '30%', description: l('Leer: pro Einheit.', 'Empty: per unit.') },
                },
              ],
            },
          ],
        },
      ],
    },
  ] as Field[],
})
