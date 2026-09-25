import type { Locale } from '@/i18n/config'

/** Copy of the `kpiStudio` scene: one RevPAR definition, edited, dry-run, released to every consumer. */
export const studioCopy = {
  de: {
    label:
      'KPI Studio: Die RevPAR-Definition schließt Stornos aus, der Probelauf stimmt mit dem Finanzbericht überein, Version 1.2 geht an Dashboard, Resi, Claude und den Montags-Digest, alle zeigen 119 €',
    studio: 'KPI Studio',
    source: 'Mews',
    table: 'reservation',
    rows: '48.210 Zeilen',
    fields: [
      { name: 'net_revenue', type: 'decimal' },
      { name: 'rooms_available', type: 'int' },
      { name: 'status', type: 'enum' },
    ],
    dims: '+ 3 Dimensionen',
    draft: 'Entwurf',
    released: 'Freigegeben',
    dryRun: 'Probelauf · Okt. 2026',
    checks: ['Keine Nullwerte', 'Abgleich Finanzbericht', '3 Dimensionen'],
    preview: 'RevPAR',
    previous: 'v1.1',
    consumers: {
      dashboard: { title: 'Dashboard · Umsatz', kpi: 'RevPAR · Oktober' },
      resi: { before: 'RevPAR im Oktober:', after: 'laut KPI-Katalog.' },
      claude: { title: 'Claude · Indicate MCP' },
      digest: { title: 'Montags-Digest · 08:00', kpi: 'RevPAR letzte Woche' },
    },
  },
  en: {
    label:
      'KPI Studio: the RevPAR definition excludes cancellations, the dry run matches the finance report, version 1.2 goes out to the dashboard, Resi, Claude and the Monday digest, and all of them show €119',
    studio: 'KPI Studio',
    source: 'Mews',
    table: 'reservation',
    rows: '48,210 rows',
    fields: [
      { name: 'net_revenue', type: 'decimal' },
      { name: 'rooms_available', type: 'int' },
      { name: 'status', type: 'enum' },
    ],
    dims: '+ 3 dimensions',
    draft: 'Draft',
    released: 'Released',
    dryRun: 'Dry run · Oct 2026',
    checks: ['No null values', 'Matches finance report', '3 dimensions'],
    preview: 'RevPAR',
    previous: 'v1.1',
    consumers: {
      dashboard: { title: 'Dashboard · Revenue', kpi: 'RevPAR · October' },
      resi: { before: 'RevPAR in October:', after: 'per the KPI catalogue.' },
      claude: { title: 'Claude · Indicate MCP' },
      digest: { title: 'Monday digest · 08:00', kpi: 'RevPAR last week' },
    },
  },
} as const

export const studioCopyFor = (locale?: Locale | null) => studioCopy[locale === 'en' ? 'en' : 'de']
