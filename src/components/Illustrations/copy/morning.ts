import type { Locale } from '@/i18n/config'

type Kpi = { label: string; value: number; before: string; after: string; delta: string }

type MorningCopy = {
  label: string
  /** The automatic workflow behind the scenes, left to right. */
  steps: [string, string, string]
  dashboard: {
    title: string
    syncing: string
    updated: string
    kpis: [Kpi, Kpi, Kpi, Kpi]
    bookings: string
    thisYear: string
    lastYear: string
    pickup: string
    weekend: string
  }
  chat: { role: string; question: string; thinking: string; answer: string; source: string; ask: string }
  digest: {
    title: string
    when: string
    chips: [string, string, string]
    note: string
    sent: string
  }
  people: [string, string, string]
}

const de: MorningCopy = {
  label:
    'Dein Haus in Zahlen: Im Hintergrund laufen Sync, KPI-Prüfung und Zeitplan automatisch. Vorne aktualisiert sich das Dashboard um 07:00, Resi beantwortet eine Frage zum Pickup, und montags um 08:00 geht der Wochenbericht per E-Mail an drei Personen',
  steps: ['Sync · alle 15 Min', 'KPIs geprüft', 'Zeitplan · Mo 08:00'],
  dashboard: {
    title: 'Hotel Alpenrose · Heute',
    syncing: 'Synchronisiert …',
    updated: 'Aktualisiert 07:00',
    kpis: [
      { label: 'Belegung', value: 84, before: '', after: ' %', delta: '+6 Pkt' },
      { label: 'ADR', value: 142, before: '', after: ' €', delta: '+3 %' },
      { label: 'RevPAR', value: 119, before: '', after: ' €', delta: '+9 %' },
      { label: 'Pickup 7 Tage', value: 38, before: '', after: ' Zi.', delta: '+12 zur Vorwoche' },
    ],
    bookings: 'Buchungen',
    thisYear: 'Dieses Jahr',
    lastYear: 'Vorjahr',
    pickup: 'Pickup · nächste 14 Tage',
    weekend: 'Wochenende',
  },
  chat: {
    role: 'Deine KI-Analystin',
    question: 'Warum ist der Pickup höher?',
    thinking: 'Resi prüft die Zahlen …',
    answer: 'Mehr Direktbuchungen fürs Wochenende, +18 % zur Vorwoche. Die meisten kommen über deine Website.',
    source: 'Mews · Buchungen · geprüft',
    ask: 'Frag Resi …',
  },
  digest: {
    title: 'Wochenbericht per E-Mail',
    when: 'Jeden Montag · 08:00',
    chips: ['Belegung 84 %', 'ADR 142 €', 'RevPAR 119 €'],
    note: 'Mit drei Highlights von Resi',
    sent: 'Zugestellt · 3',
  },
  people: ['LH', 'JK', 'AB'],
}

const en: MorningCopy = {
  label:
    'Your property in numbers: sync, KPI checks and the schedule run by themselves in the background. In front, the dashboard updates at 07:00, Resi answers a question about pickup, and on Monday at 08:00 the weekly report goes out by email to three people',
  steps: ['Sync · every 15 min', 'KPIs checked', 'Schedule · Mon 08:00'],
  dashboard: {
    title: 'Hotel Alpenrose · Today',
    syncing: 'Syncing …',
    updated: 'Updated 07:00',
    kpis: [
      { label: 'Occupancy', value: 84, before: '', after: ' %', delta: '+6 pts' },
      { label: 'ADR', value: 142, before: '€', after: '', delta: '+3 %' },
      { label: 'RevPAR', value: 119, before: '€', after: '', delta: '+9 %' },
      { label: 'Pickup 7 days', value: 38, before: '', after: ' rooms', delta: '+12 vs last week' },
    ],
    bookings: 'Bookings',
    thisYear: 'This year',
    lastYear: 'Last year',
    pickup: 'Pickup · next 14 days',
    weekend: 'Weekend',
  },
  chat: {
    role: 'Your AI analyst',
    question: 'Why is pickup up this week?',
    thinking: 'Resi is checking the numbers …',
    answer: 'More direct bookings for the weekend, +18 % on last week. Most come through your website.',
    source: 'Mews · bookings · checked',
    ask: 'Ask Resi …',
  },
  digest: {
    title: 'Weekly report by email',
    when: 'Every Monday · 08:00',
    chips: ['Occupancy 84 %', 'ADR €142', 'RevPAR €119'],
    note: 'With three highlights from Resi',
    sent: 'Delivered · 3',
  },
  people: ['LH', 'JK', 'AB'],
}

export const morningCopy = { de, en }
export const morningCopyFor = (locale?: Locale | null) => morningCopy[locale === 'en' ? 'en' : 'de']
