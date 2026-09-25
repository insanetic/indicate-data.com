/** Copy for the `dashboard` scene: every connection brings its KPIs, Resi builds the widgets. */
type Source = { name: string; kpis: string[] }

type Copy = {
  label: string
  property: string
  /** What Resi builds in each exchange, under her mark. */
  status: string[]
  sources: Source[]
  empty: string
  colours: string
  kinds: { scorecard: string; line: string; columns: string; pie: string }
  scorecard: { title: string; value: string; delta: string; vs: string }
  line: { title: string; now: string; last: string }
  columns: { title: string; target: string; from: string; to: string }
  pie: { title: string; centre: string; centreLabel: string; segments: string[] }
}

const de: Copy = {
  label:
    'Fertige Kennzahlen: Mews, Google Ads und Re:Guest bringen ihre KPI-Sammlungen mit, Resi baut daraus eine Scorecard, eine Linie mit Vorjahr, Säulen mit Ziel und einen Kreis, am Ende in den Farben des Hauses',
  property: 'Hotel Alpenrose · Dashboard',
  status: ['Baut aus Mews: Scorecard und Linie', 'Baut aus Google Ads: Säulen mit Ziel', 'Baut aus Re:Guest: Kreis in deinen Farben'],
  sources: [
    { name: 'Mews', kpis: ['Belegung', 'ADR', 'RevPAR'] },
    { name: 'Google Ads', kpis: ['Buchungen', 'Kosten', 'CPB'] },
    { name: 'Re:Guest', kpis: ['Anfragen', 'Abschluss'] },
  ],
  empty: 'Freier Platz',
  colours: 'Deine Farben',
  kinds: { scorecard: 'Scorecard', line: 'Linie', columns: 'Säulen', pie: 'Kreis' },
  scorecard: { title: 'Belegung', value: '84', delta: '+6 Pkt', vs: 'zum Vorjahr' },
  line: { title: 'Logisumsatz', now: 'Dieses Jahr', last: 'Vorjahr' },
  columns: { title: 'Buchungen aus Google Ads', target: 'Ziel 30', from: 'KW 30', to: 'KW 37' },
  pie: { title: 'Anfragen nach Kanal', centre: '38 %', centreLabel: 'Abschluss', segments: ['Website', 'E-Mail', 'Telefon'] },
}

const en: Copy = {
  label:
    'Ready-made KPIs: Mews, Google Ads and Re:Guest bring their KPI collections, Resi builds a scorecard, a line against last year, columns against a target and a pie from them, finally in the property’s colours',
  property: 'Hotel Alpenrose · Dashboard',
  status: ['Building from Mews: scorecard and line', 'Building from Google Ads: columns with a target', 'Building from Re:Guest: a pie in your colours'],
  sources: [
    { name: 'Mews', kpis: ['Occupancy', 'ADR', 'RevPAR'] },
    { name: 'Google Ads', kpis: ['Bookings', 'Spend', 'CPB'] },
    { name: 'Re:Guest', kpis: ['Requests', 'Conversion'] },
  ],
  empty: 'Free slot',
  colours: 'Your colours',
  kinds: { scorecard: 'Scorecard', line: 'Line', columns: 'Columns', pie: 'Pie' },
  scorecard: { title: 'Occupancy', value: '84', delta: '+6 pts', vs: 'vs last year' },
  line: { title: 'Room revenue', now: 'This year', last: 'Last year' },
  columns: { title: 'Bookings from Google Ads', target: 'Target 30', from: 'Wk 30', to: 'Wk 37' },
  pie: { title: 'Requests by channel', centre: '38 %', centreLabel: 'conversion', segments: ['Website', 'Email', 'Phone'] },
}

export const widgetsCopy = { de, en }
