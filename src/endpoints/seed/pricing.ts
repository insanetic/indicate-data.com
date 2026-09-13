import type { Page, SubneoPricing } from '@/payload-types'

import type { Refs, T } from './content'
import { closing, defaults, faq, logos } from './pages'
import { pricingFamilyCodes } from '@/pricing/fixture'

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>
type Block = PageData['layout'][number]

export const pricingSlug = 'pricing'

/** The pricing page: plans from Subneo (block), logos, questions, closing CTA. */
export const pricingPage = (t: T, refs: Refs): Partial<PageData> => ({
  title: t('Preise', 'Pricing'),
  slug: pricingSlug,
  _status: 'published',
  hero: { type: 'none' },
  seo: {
    title: t('Preise', 'Pricing'),
    description: t(
      'Drei Pakete für Hotels, Hotelgruppen und Agenturen, pro Betrieb und Monat. Resi ist überall dabei.',
      'Three plans for hotels, hotel groups and agencies, per property and month. Resi is included everywhere.',
    ),
  },
  layout: [
    {
      blockType: 'pricing',
      blockName: t('Preise', 'Pricing'),
      header: {
        eyebrow: t('Preise', 'Pricing'),
        heading: t('Klar kalkuliert. Pro Betrieb, pro Monat.', 'Clear pricing. Per property, per month.'),
        lead: t(
          'Drei Pakete für Hotels, Gruppen und Agenturen. Resi ist überall dabei.',
          'Three plans for hotels, groups and agencies. Resi is included everywhere.',
        ),
        align: 'center',
      },
      families: [],
      show: { cards: true, addons: true, comparison: true },
      addonsHeader: {
        heading: t('Resi wächst mit.', 'Resi grows with you.'),
        lead: t(
          'Jedes Paket enthält Resi-Credits und den MCP-Zugang für Claude, ChatGPT und Langdock. Mehr Fragen oder mehr Agenten? Einfach dazubuchen.',
          'Every plan includes Resi credits and MCP access for Claude, ChatGPT and Langdock. More questions or more agents? Add them any time.',
        ),
      },
      comparisonHeader: {
        heading: t('Alles im Vergleich', 'Everything compared'),
        lead: t('Alle Leistungen der drei Pakete, Gruppe für Gruppe.', 'All features of the three plans, group by group.'),
      },
      footnote: t(
        'Alle Preise zzgl. MwSt. Monatspakete sind monatlich kündbar, Jahrespakete laufen zwölf Monate.',
        'All prices exclude VAT. Monthly plans can be cancelled monthly, yearly plans run for twelve months.',
      ),
      settings: { ...defaults },
    } as Block,
    logos(t),
    faq(t, [
      {
        q: t('Was zählt als Datenquelle?', 'What counts as a data connection?'),
        a: t(
          'Jede verbundene Anbindung zählt als eine Datenquelle: das PMS, die Booking Engine, Google Analytics, Meta Ads und so weiter. Zusätzliche Datenquellen kosten 5 € pro Monat.',
          'Every connected system counts as one data connection: the PMS, the booking engine, Google Analytics, Meta Ads and so on. Additional connections cost 5 € per month.',
        ),
      },
      {
        q: t('Wie funktionieren die Credits der KI-Agentin?', 'How do the AI agent credits work?'),
        a: t(
          'Ein Credit ist eine Frage, eine Zusammenfassung oder ein Dashboard-Schritt. Das Kontingent setzt sich jeden Monat zurück, nicht genutzte Credits verfallen. Sind sie aufgebraucht, laufen Dashboards und Reports normal weiter; nur die KI-Agentin pausiert bis zum nächsten Monat oder bis Sie ein Credit-Paket dazubuchen.',
          'One credit is one question, one summary or one dashboard step. The allowance resets every month and unused credits expire. When they run out, dashboards and reports keep working; only the AI agent pauses until next month or until you add a credit pack.',
        ),
      },
      {
        q: t('Monatlich oder jährlich?', 'Monthly or yearly?'),
        a: t(
          'Monatspakete sind monatlich kündbar. Jahrespakete sparen 10 % und laufen zwölf Monate, abgerechnet im Voraus.',
          'Monthly plans can be cancelled monthly. Yearly plans save 10 % and run for twelve months, billed in advance.',
        ),
      },
      {
        q: t('Kann ich das Paket später wechseln?', 'Can I switch plans later?'),
        a: t(
          'Jederzeit. Ein Upgrade gilt sofort, ein Downgrade zum nächsten Abrechnungszeitraum. Ihre Daten und Dashboards bleiben unverändert.',
          'Any time. An upgrade applies immediately, a downgrade from the next billing period. Your data and dashboards stay as they are.',
        ),
      },
      {
        q: t('Wie rechnen Hotelgruppen und Agenturen ab?', 'How do hotel groups and agencies pay?'),
        a: t(
          'Jeder Betrieb ist ein eigener Space mit eigenem Paket. Gruppen und Agenturen bündeln ihre Spaces in einer Organisation mit einem Login; ab mehreren Betrieben lohnt sich Enterprise mit Staffelpreisen und eigenem Vertrag.',
          'Each property is its own space with its own plan. Groups and agencies bundle their spaces in one organisation with one login; from several properties on, Enterprise with volume pricing and its own contract pays off.',
        ),
      },
      {
        q: t('Mehrwertsteuer und Währung?', 'VAT and currency?'),
        a: t(
          'Alle Preise verstehen sich in Euro zuzüglich der gesetzlichen Mehrwertsteuer. Die Rechnung kommt monatlich oder jährlich per E-Mail.',
          'All prices are in euros and exclude the statutory VAT. Invoices arrive monthly or yearly by e-mail.',
        ),
      },
    ]),
    closing(
      t,
      refs,
      t('Nicht sicher, welches Paket passt?', 'Not sure which plan fits?'),
      t('In 30 Minuten zeigen wir Ihnen Indicate mit Ihren eigenen Zahlen.', 'In 30 minutes we show you Indicate with your own numbers.'),
    ),
  ],
})

/**
 * The `subneo-pricing` global: families, German and English display overrides and the button
 * templates. Connection fields (source, key, URL) are left alone so a re-seed never flips a live
 * site back to example data or drops a key typed in the admin.
 */
export const pricingSettings = (t: T): Partial<SubneoPricing> => ({
  families: [
    {
      code: pricingFamilyCodes.app,
      role: 'app',
      label: t('Pakete', 'Plans'),
      unit: t('pro Betrieb und Monat', 'per property and month'),
      featuredPlanCode: 'pro',
      highlightFeatures: ['pipelines', 'dashboards', 'resi_credits', 'agent_tokens', 'sub_daily_sync', 'flying_kpis_ai_summary', 'data_sharing'].map(
        (featureCode) => ({ featureCode }),
      ),
      showInComparison: true,
    },
    {
      code: pricingFamilyCodes.agent,
      role: 'addon',
      label: t('Resi und Agenten', 'Resi and agents'),
      unit: '',
      showInComparison: false,
    },
  ],
  planOverrides: [
    { planCode: 'core', tagline: t('Für ein Hotel, das jeden Morgen klare Zahlen will.', 'For a single hotel that wants clear numbers every morning.') },
    {
      planCode: 'pro',
      badge: t('Beliebt', 'Popular'),
      tagline: t('Für Hotels und kleine Gruppen, die Marketing und Umsatz zusammen steuern.', 'For hotels and small groups that steer marketing and revenue together.'),
    },
    {
      planCode: 'enterprise',
      tagline: t('Für Gruppen, Agenturen und Software-Partner mit eigenen Anforderungen.', 'For groups, agencies and software partners with their own requirements.'),
    },
    { planCode: 'agent-single', name: t('Agent-Token, ein Space', 'Agent token, single space'), tagline: t('Ein externer Assistent auf einem Space', 'One external assistant on one space') },
    { planCode: 'agent-multi', name: t('Agent-Token, alle Spaces', 'Agent token, all spaces'), tagline: t('Ein Token für alle Spaces Ihrer Organisation', 'One token across every space of your organisation') },
    { planCode: 'resi-credits-500', name: t('Resi-Credits, 500', 'Resi credits, 500'), tagline: t('Für Teams, die Resi jeden Tag fragen', 'For teams that ask Resi every day') },
    { planCode: 'resi-credits-2500', name: t('Resi-Credits, 2.500', 'Resi credits, 2,500'), tagline: t('Für Gruppen und Agenturen mit vielen Spaces', 'For groups and agencies with many spaces') },
  ],
  featureOverrides: [
    { featureCode: 'pipelines', label: t('Datenquellen', 'Data connections'), description: t('Angebundene Systeme, synchronisiert in Ihr Warehouse', 'Connected systems, synced into your warehouse') },
    { featureCode: 'sub_daily_sync', label: t('Stündliche Synchronisation', 'Hourly sync'), description: t('Statt einmal täglich', 'Instead of once a day') },
    { featureCode: 'sync_15min', label: t('Synchronisation alle 15 Minuten', '15-minute sync') },
    { featureCode: 'premium_connectors', label: t('Premium-Anbindungen', 'Premium connectors'), description: t('PMS- und Channel-Systeme mit Premium-Faktor', 'PMS and channel systems with a premium multiplier') },
    { featureCode: 'csv_import', label: t('CSV-Import', 'CSV import') },
    { featureCode: 'data_sharing', label: t('Datenprodukte zwischen Spaces teilen', 'Share data products across spaces') },
    { featureCode: 'warehouse_export', label: t('Warehouse-Export', 'Warehouse export'), description: t('Tabellen und DDL Ihres Warehouses herunterladen', 'Download tables and the DDL of your warehouse') },
    { featureCode: 'dashboards', label: t('Dashboards', 'Dashboards') },
    { featureCode: 'templates', label: t('Vorlagen-Marktplatz', 'Template marketplace') },
    { featureCode: 'kpi_studio', label: 'KPI Studio', description: t('Eigene Kennzahlen im Semantic Layer, versioniert', 'Own metrics in the semantic layer, versioned') },
    { featureCode: 'flying_kpis', label: 'Flying KPIs', description: t('Dashboards nach Zeitplan per E-Mail', 'Scheduled dashboard reports by e-mail') },
    { featureCode: 'flying_kpis_ai_summary', label: t('KI-Zusammenfassung in Reports', 'AI summary in reports') },
    { featureCode: 'brand_palettes', label: t('Eigene Farbpaletten', 'Brand palettes') },
    { featureCode: 'resi_chat', label: t('Mit Ihren Daten chatten', 'Chat with your data') },
    { featureCode: 'resi_build', label: t('Dashboards mit Resi bauen', 'Build dashboards with Resi') },
    { featureCode: 'resi_credits', label: t('Resi-Credits', 'Resi credits'), description: t('Ein Credit ist eine Frage, eine Zusammenfassung oder ein Dashboard-Schritt', 'One credit is one question, summary or dashboard step') },
    { featureCode: 'resi_warehouse_access', label: t('Warehouse-Zugriff für Resi', 'Warehouse access for Resi'), description: t('Resi darf über den Kennzahlen-Katalog hinaus abfragen', 'Resi may query beyond the metric catalogue') },
    { featureCode: 'mcp_clients', label: t('MCP für Claude, ChatGPT und Langdock', 'MCP for Claude, ChatGPT and Langdock') },
    { featureCode: 'agent_tokens', label: t('Agent-Tokens', 'Agent tokens'), description: t('Externe Assistenten und Agenten anbinden', 'Connect external assistants and agents') },
    { featureCode: 'users', label: t('Nutzer', 'Users') },
    { featureCode: 'roles', label: t('Rollen (Leser, Nutzer, Admin)', 'Roles (reader, user, admin)') },
    { featureCode: 'mfa', label: t('Zwei-Faktor-Anmeldung', 'Two-factor authentication') },
    { featureCode: 'audit_log_days', label: t('Tage Audit-Log', 'Days of audit log') },
    { featureCode: 'api_tokens', label: t('API-Tokens', 'API tokens') },
    { featureCode: 'service_accounts', label: t('Service-Konten', 'Service accounts') },
    { featureCode: 'org_branding', label: t('Organisations-Branding', 'Organisation branding') },
    { featureCode: 'support_channel', label: 'Support' },
    { featureCode: 'onboarding', label: t('Begleitetes Onboarding', 'Guided onboarding') },
    { featureCode: 'sla', label: t('Service Level Agreement', 'Service level agreement') },
  ],
  groupOverrides: [
    { groupCode: 'data', label: t('Daten & Integrationen', 'Data & integrations'), order: 1 },
    { groupCode: 'analytics', label: t('Dashboards & Reporting', 'Dashboards & reporting'), order: 2 },
    { groupCode: 'resi', label: t('Resi, Ihre KI-Agentin', 'Resi, your AI agent'), order: 3 },
    { groupCode: 'team', label: t('Team & Governance', 'Team & governance'), order: 4 },
    { groupCode: 'support', label: 'Support', order: 5 },
  ],
  defaultCtaUrl: 'https://app.indicate-data.com/signup?plan={plan}&rate={rate}',
  contactUrl: '/contact',
})
