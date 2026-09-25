import type { Locale } from '@/i18n/config'

type Person = { name: string; initials: string; role: string }
type Answer = { kpi: string; value: number; unit: string; delta: string; up: boolean; source: string }

type TeamCopy = {
  title: string
  role: string
  catalogue: string
  /** The catalogue definition each exchange uses. */
  defs: [string, string, string]
  people: [Person, Person, Person]
  /** Who the status line says Resi is working for, and what she is doing. */
  status: [{ for: string; doing: string }, { for: string; doing: string }, { for: string; doing: string }]
  questions: [string, string]
  answers: [Answer, Answer]
  dashboard: { title: string; widgets: [[string, string], [string, string]]; pinned: string; slot: string }
  digest: { title: string; when: string; sent: string; chip: string }
  to: string
  team: string
  /** Opening and closing quotation marks. */
  quote: [string, string]
}

const de: TeamCopy = {
  title: 'Resi in der Mitte des Teams: Mews, Google Ads, Re:Guest und Meta links, Lena, Jonas und Anna rechts; sie beantwortet Fragen, heftet ein Diagramm ans Dashboard und verschickt montags den Wochenbericht per E-Mail',
  role: 'Deine KI-Analystin',
  catalogue: 'KPI-Katalog',
  defs: ['occupancy · Wochenende', 'occupancy · Zimmerkategorie', 'Wochenbericht · 6 KPIs'],
  people: [
    { name: 'Lena H.', initials: 'LH', role: 'Direktorin' },
    { name: 'Jonas K.', initials: 'JK', role: 'Revenue Management' },
    { name: 'Anna B.', initials: 'AB', role: 'Marketing' },
  ],
  status: [
    { for: 'Für Lena', doing: 'Prüft Mews und Google Ads …' },
    { for: 'Für Jonas', doing: 'Prüft Mews und Re:Guest …' },
    { for: 'Montag, 8:00', doing: 'Schreibt den Wochenbericht …' },
  ],
  questions: ['Wie lief das Wochenende?', 'Wie laufen die Juniorsuiten im Oktober?'],
  answers: [
    { kpi: 'Belegung · Wochenende', value: 92, unit: ' %', delta: '+6 Pkt.', up: true, source: 'Mews · Google Ads' },
    { kpi: 'Juniorsuiten · Oktober', value: 61, unit: ' %', delta: 'Mo–Do 48 %', up: false, source: 'Mews · Re:Guest' },
  ],
  dashboard: {
    title: 'Dashboard · Alpenrose',
    widgets: [
      ['Belegung', '84 %'],
      ['ADR', '142 €'],
    ],
    pinned: 'Juniorsuiten',
    slot: 'Neues Widget',
  },
  digest: { title: 'Wochenbericht per E-Mail', when: 'Jeden Montag · 8:00', sent: 'Gesendet', chip: 'Wochenbericht KW 39' },
  to: 'An',
  team: 'An das Team',
  quote: ['„', '“'],
}

const en: TeamCopy = {
  title: 'Resi at the centre of the team: Mews, Google Ads, Re:Guest and Meta on the left, Lena, Jonas and Anna on the right; she answers questions, pins a chart to the dashboard and sends the weekly report by email on Monday',
  role: 'Your AI analyst',
  catalogue: 'KPI catalogue',
  defs: ['occupancy · weekend', 'occupancy · room category', 'Weekly report · 6 KPIs'],
  people: [
    { name: 'Lena H.', initials: 'LH', role: 'General manager' },
    { name: 'Jonas K.', initials: 'JK', role: 'Revenue manager' },
    { name: 'Anna B.', initials: 'AB', role: 'Marketing' },
  ],
  status: [
    { for: 'For Lena', doing: 'Checking Mews and Google Ads …' },
    { for: 'For Jonas', doing: 'Checking Mews and Re:Guest …' },
    { for: 'Monday, 8:00', doing: 'Writing the weekly report …' },
  ],
  questions: ['How did the weekend go?', 'How are the junior suites doing in October?'],
  answers: [
    { kpi: 'Occupancy · weekend', value: 92, unit: ' %', delta: '+6 pts', up: true, source: 'Mews · Google Ads' },
    { kpi: 'Junior suites · October', value: 61, unit: ' %', delta: 'Mon–Thu 48 %', up: false, source: 'Mews · Re:Guest' },
  ],
  dashboard: {
    title: 'Dashboard · Alpenrose',
    widgets: [
      ['Occupancy', '84 %'],
      ['ADR', '€142'],
    ],
    pinned: 'Junior suites',
    slot: 'New widget',
  },
  digest: { title: 'Weekly report by email', when: 'Every Monday · 8:00', sent: 'Sent', chip: 'Weekly report, week 39' },
  to: 'To',
  team: 'To the team',
  quote: ['“', '”'],
}

export const teamCopy = { de, en }

export const teamCopyFor = (locale?: Locale | null): TeamCopy => (locale === 'en' ? en : de)
