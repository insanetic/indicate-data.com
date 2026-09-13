import type { Locale } from '@/i18n/config'

import type { IntegrationCategory, IntegrationStatus } from './types'

/** UI strings of the directory that are not CMS content. */
export const directoryLabels: Record<
  Locale,
  {
    categories: Record<IntegrationCategory, string>
    status: Record<IntegrationStatus, string>
    all: string
    search: string
    placeholder: string
    clear: string
    count: (n: number, total: number) => string
    noResultsTitle: (q: string) => string
    noResultsText: string
    requestWithTerm: (q: string) => string
    requestMessage: (q: string) => string
    reset: string
  }
> = {
  de: {
    categories: {
      pms: 'PMS & Hotelsoftware',
      sales: 'Vertrieb & Gäste',
      marketing: 'Marketing & Werbung',
      web: 'Web & Social',
      operations: 'Betrieb',
      data: 'Daten & Import',
    },
    status: { available: 'Verfügbar', beta: 'Beta', 'on-request': 'Auf Anfrage' },
    all: 'Alle',
    search: 'Integration suchen',
    placeholder: 'System suchen, z. B. Mews, Google Ads …',
    clear: 'Suche löschen',
    count: (n, total) => (n === total ? `${total} Anbindungen` : `${n} von ${total} Anbindungen`),
    noResultsTitle: (q) => `Nichts zu „${q}“ gefunden.`,
    noResultsText: 'Prüfen Sie die Schreibweise oder fragen Sie uns. Für gängige Systeme bauen wir Anbindungen laufend dazu.',
    requestWithTerm: (q) => `„${q}“ anfragen`,
    requestMessage: (q) =>
      q ? `Wir würden gern ${q} mit Indicate verbinden. Welche Möglichkeiten gibt es?` : 'Wir würden gern ein weiteres System mit Indicate verbinden:',
    reset: 'Filter zurücksetzen',
  },
  en: {
    categories: {
      pms: 'PMS & hotel software',
      sales: 'Sales & guests',
      marketing: 'Marketing & ads',
      web: 'Web & social',
      operations: 'Operations',
      data: 'Data & import',
    },
    status: { available: 'Available', beta: 'Beta', 'on-request': 'On request' },
    all: 'All',
    search: 'Search integrations',
    placeholder: 'Search a system, e.g. Mews, Google Ads …',
    clear: 'Clear search',
    count: (n, total) => (n === total ? `${total} connections` : `${n} of ${total} connections`),
    noResultsTitle: (q) => `Nothing found for “${q}”.`,
    noResultsText: 'Check the spelling or ask us. We keep adding connections for the common systems.',
    requestWithTerm: (q) => `Request “${q}”`,
    requestMessage: (q) =>
      q ? `We would like to connect ${q} to Indicate. What are the options?` : 'We would like to connect another system to Indicate:',
    reset: 'Reset filters',
  },
}
