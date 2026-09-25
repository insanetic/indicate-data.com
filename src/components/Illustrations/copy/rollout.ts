/** Copy for the `templates` scene: one template rolls out to every property of a group. */
type RolloutCopy = {
  label: string
  library: string
  templates: { system: string; name: string; by: string }[]
  template: string
  apply: string
  /** Two KPI names per template. */
  kpis: [string, string][]
  /** Caption of each template's chart. */
  charts: string[]
  remap: string
}

const de: RolloutCopy = {
  label: 'Dashboard-Vorlagen: eine Vorlage wird gewählt und auf drei Häuser angewendet, jedes mit seinen eigenen Zahlen',
  library: 'Vorlagen',
  templates: [
    { system: 'Mews', name: 'Umsatz & Auslastung', by: 'Indicate' },
    { system: 'Google Ads', name: 'Kampagnen', by: 'Indicate' },
    { system: 'Re:Guest', name: 'Anfragen & Angebote', by: 'Deine Agentur' },
  ],
  template: 'Vorlage',
  apply: 'Auf 3 Häuser anwenden',
  kpis: [
    ['Auslastung', 'ADR'],
    ['Buchungen', 'Kosten je Buchung'],
    ['Anfragen', 'Abschlussquote'],
  ],
  charts: ['Auslastung, 12 Wochen', 'Buchungen je Kampagne', 'Anfragen je Woche'],
  remap: 'Auslastung aus Apaleo',
}

const en: RolloutCopy = {
  label: 'Dashboard templates: one template is picked and applied to three properties, each with its own numbers',
  library: 'Templates',
  templates: [
    { system: 'Mews', name: 'Revenue & occupancy', by: 'Indicate' },
    { system: 'Google Ads', name: 'Campaigns', by: 'Indicate' },
    { system: 'Re:Guest', name: 'Requests & offers', by: 'Your agency' },
  ],
  template: 'Template',
  apply: 'Apply to 3 properties',
  kpis: [
    ['Occupancy', 'ADR'],
    ['Bookings', 'Cost per booking'],
    ['Requests', 'Conversion'],
  ],
  charts: ['Occupancy, 12 weeks', 'Bookings per campaign', 'Requests per week'],
  remap: 'Occupancy from Apaleo',
}

export const rolloutCopy = { de, en }
