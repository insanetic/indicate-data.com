/**
 * Illustration keys and friendly names. The marketer picks one of these in the CMS;
 * `index.tsx` maps each key to a code-built illustration.
 */
export const illustrationOptions = [
  { value: 'dashboard', label: { de: 'Dashboard mit Kennzahlen', en: 'Dashboard with KPIs' } },
  { value: 'agent', label: { de: 'KI-Agent im Gespräch', en: 'AI agent conversation' } },
  { value: 'comparison', label: { de: 'Vergleich Plan vs. Ist', en: 'Plan vs. actual comparison' } },
  { value: 'sources', label: { de: 'Datenquellen fließen zusammen', en: 'Sources flowing together' } },
  { value: 'team', label: { de: 'Team & Rechte', en: 'Team & permissions' } },
  { value: 'integrations', label: { de: 'Integrations-Hub', en: 'Integrations hub' } },
  { value: 'alerts', label: { de: 'Hinweise & Trends', en: 'Alerts & trends' } },
  { value: 'builder', label: { de: 'Dashboard per Beschreibung (Loop)', en: 'Dashboard from a description (loop)' } },
  { value: 'flyingKpis', label: { de: 'Flying KPIs: Report wird versendet (Loop)', en: 'Flying KPIs: report being sent (loop)' } },
  { value: 'portfolio', label: { de: 'Hotelgruppe: Häuser im Vergleich (Loop)', en: 'Hotel group: properties compared (loop)' } },
  { value: 'campaigns', label: { de: 'Agentur: Kampagnen-ROI je Kunde (Loop)', en: 'Agency: campaign ROI per client (loop)' } },
] as const

export type IllustrationKey = (typeof illustrationOptions)[number]['value']
